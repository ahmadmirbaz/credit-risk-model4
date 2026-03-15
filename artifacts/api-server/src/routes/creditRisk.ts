import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "@workspace/db";
import { creditRiskPredictions } from "@workspace/db/schema";
import { desc } from "drizzle-orm";
import {
  PredictCreditRiskBody,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODEL_SCRIPT = path.resolve(__dirname, "../python/credit_risk_model.py");

function runPythonModel(input: Record<string, number | string>): Promise<{
  defaultProbability: number;
  featureContributions: Array<{ feature: string; value: number; contribution: number; displayName: string }>;
  modelInfo: { accuracy: number; auc: number; features: Array<{ name: string; displayName: string; importance: number; description: string }> };
}> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", [MODEL_SCRIPT, JSON.stringify(input)]);
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python model failed: ${err}`));
        return;
      }
      try {
        resolve(JSON.parse(out));
      } catch {
        reject(new Error(`Failed to parse model output: ${out}`));
      }
    });
  });
}

function getRiskCategory(prob: number): "low" | "medium" | "high" {
  if (prob < 0.2) return "low";
  if (prob < 0.5) return "medium";
  return "high";
}

function getDecision(prob: number): "approved" | "review" | "declined" {
  if (prob < 0.2) return "approved";
  if (prob < 0.5) return "review";
  return "declined";
}

router.post("/predict", async (req, res) => {
  try {
    const body = PredictCreditRiskBody.parse(req.body);

    const modelInput = {
      age: body.age,
      income: body.income,
      loan_amount: body.loanAmount,
      loan_term: body.loanTerm,
      credit_score: body.creditScore,
      debt_to_income_ratio: body.debtToIncomeRatio,
      employment_years: body.employmentYears,
      num_credit_lines: body.numCreditLines,
      num_late_payments: body.numLatePayments,
      home_ownership: body.homeOwnership,
      loan_purpose: body.loanPurpose,
    };

    const modelResult = await runPythonModel(modelInput);
    const defaultProbability = modelResult.defaultProbability;
    const riskCategory = getRiskCategory(defaultProbability);
    const decision = getDecision(defaultProbability);
    const riskScore = Math.round(defaultProbability * 100);

    const contributionsSummary = modelResult.featureContributions
      .slice(0, 5)
      .map((f) => `${f.displayName}: ${f.contribution > 0 ? "+" : ""}${f.contribution.toFixed(2)}`)
      .join(", ");

    const prompt = `You are a credit risk analyst. A logistic regression model has assessed a loan application.

Applicant: ${body.applicantName}
Loan Amount: $${body.loanAmount.toLocaleString()}
Income: $${body.income.toLocaleString()}/year
Credit Score: ${body.creditScore}
Default Probability: ${(defaultProbability * 100).toFixed(1)}%
Risk Category: ${riskCategory.toUpperCase()}
Decision: ${decision.toUpperCase()}
Top factors (contribution to risk): ${contributionsSummary}

Write a clear, professional 3-4 sentence explanation of this risk assessment for the loan officer. 
Mention the key factors, explain the risk level, and state the recommendation. Be direct and informative.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const aiExplanation = completion.choices[0]?.message?.content ?? "Assessment complete. Please review the risk factors below.";

    const record = await db
      .insert(creditRiskPredictions)
      .values({
        applicantName: body.applicantName,
        age: body.age,
        income: body.income,
        loanAmount: body.loanAmount,
        loanTerm: body.loanTerm,
        creditScore: body.creditScore,
        debtToIncomeRatio: body.debtToIncomeRatio,
        employmentYears: body.employmentYears,
        numCreditLines: body.numCreditLines,
        numLatePayments: body.numLatePayments,
        homeOwnership: body.homeOwnership,
        loanPurpose: body.loanPurpose,
        defaultProbability,
        riskCategory,
        riskScore,
        decision,
        aiExplanation,
        featureContributions: JSON.stringify(modelResult.featureContributions),
      })
      .returning();

    res.json({
      defaultProbability,
      riskCategory,
      riskScore,
      decision,
      aiExplanation,
      featureContributions: modelResult.featureContributions,
      id: record[0].id,
    });
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: String(err) });
  }
});

router.get("/history", async (_req, res) => {
  try {
    const records = await db
      .select({
        id: creditRiskPredictions.id,
        applicantName: creditRiskPredictions.applicantName,
        creditScore: creditRiskPredictions.creditScore,
        income: creditRiskPredictions.income,
        loanAmount: creditRiskPredictions.loanAmount,
        defaultProbability: creditRiskPredictions.defaultProbability,
        riskCategory: creditRiskPredictions.riskCategory,
        decision: creditRiskPredictions.decision,
        createdAt: creditRiskPredictions.createdAt,
      })
      .from(creditRiskPredictions)
      .orderBy(desc(creditRiskPredictions.createdAt))
      .limit(100);
    res.json(records);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: String(err) });
  }
});

router.get("/model-info", async (_req, res) => {
  try {
    const proc = spawn("python3", [MODEL_SCRIPT, JSON.stringify({ __info_only__: true })]);
    let out = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    await new Promise<void>((resolve, reject) => {
      proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error("Model info failed"))));
    });
    const info = JSON.parse(out);
    res.json(info.modelInfo);
  } catch (err) {
    console.error("Model info error:", err);
    res.status(500).json({ error: String(err) });
  }
});

export default router;

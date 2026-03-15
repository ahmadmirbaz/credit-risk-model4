import { pgTable, serial, text, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const creditRiskPredictions = pgTable("credit_risk_predictions", {
  id: serial("id").primaryKey(),
  applicantName: text("applicant_name").notNull(),
  age: real("age").notNull(),
  income: real("income").notNull(),
  loanAmount: real("loan_amount").notNull(),
  loanTerm: real("loan_term").notNull(),
  creditScore: real("credit_score").notNull(),
  debtToIncomeRatio: real("debt_to_income_ratio").notNull(),
  employmentYears: real("employment_years").notNull(),
  numCreditLines: real("num_credit_lines").notNull(),
  numLatePayments: real("num_late_payments").notNull(),
  homeOwnership: text("home_ownership").notNull(),
  loanPurpose: text("loan_purpose").notNull(),
  defaultProbability: real("default_probability").notNull(),
  riskCategory: text("risk_category").notNull(),
  riskScore: real("risk_score").notNull(),
  decision: text("decision").notNull(),
  aiExplanation: text("ai_explanation").notNull(),
  featureContributions: text("feature_contributions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCreditRiskPredictionSchema = createInsertSchema(creditRiskPredictions).omit({ id: true, createdAt: true });
export type InsertCreditRiskPrediction = z.infer<typeof insertCreditRiskPredictionSchema>;
export type CreditRiskPrediction = typeof creditRiskPredictions.$inferSelect;

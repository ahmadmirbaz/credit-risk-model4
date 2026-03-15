import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { usePredict } from "@/hooks/use-predict";
import { FormInput, FormSelect } from "@/components/FormInput";
import { Gauge } from "@/components/Gauge";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { 
  Calculator, 
  User, 
  Briefcase, 
  CreditCard, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  RotateCcw
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

// Map our local form shape to the API schema
const formSchema = z.object({
  applicantName: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(18, "Applicant must be 18+").max(120, "Invalid age"),
  income: z.coerce.number().min(0, "Income must be positive"),
  loanAmount: z.coerce.number().min(100, "Minimum $100"),
  loanTerm: z.coerce.number().min(1, "Minimum 1 month").max(360, "Maximum 360 months"),
  creditScore: z.coerce.number().min(300, "Min 300").max(850, "Max 850"),
  dtiPercentage: z.coerce.number().min(0, "Min 0%").max(100, "Max 100%"), // Used for UI only
  employmentYears: z.coerce.number().min(0, "Cannot be negative"),
  numCreditLines: z.coerce.number().min(0, "Cannot be negative"),
  numLatePayments: z.coerce.number().min(0, "Cannot be negative"),
  homeOwnership: z.enum(["rent", "own", "mortgage"], { required_error: "Select ownership" }),
  loanPurpose: z.enum([
    "debt_consolidation", 
    "home_improvement", 
    "major_purchase", 
    "medical", 
    "business", 
    "other"
  ], { required_error: "Select purpose" }),
});

type FormValues = z.infer<typeof formSchema>;

export function Assessment() {
  const { predict, data, isPending, error, reset } = usePredict();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantName: "",
      age: 35,
      income: 75000,
      loanAmount: 25000,
      loanTerm: 60,
      creditScore: 720,
      dtiPercentage: 25,
      employmentYears: 5,
      numCreditLines: 4,
      numLatePayments: 0,
      homeOwnership: "rent",
      loanPurpose: "debt_consolidation",
    },
  });

  const onSubmit = async (values: FormValues) => {
    // Transform DTI percentage to decimal ratio before sending
    const payload = {
      ...values,
      debtToIncomeRatio: values.dtiPercentage / 100,
    };
    await predict(payload);
  };

  const DecisionIcon = data?.decision === "approved" ? ShieldCheck : data?.decision === "declined" ? ShieldAlert : Search;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">New Assessment</h1>
        <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
          Enter the applicant's details below to run our logistic regression model and generate an AI-powered risk analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className={cn(
          "xl:col-span-7 bg-card rounded-2xl p-6 md:p-8 shadow-lg shadow-black/5 border border-border/50 transition-all duration-500",
          isPending && "opacity-60 pointer-events-none"
        )}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Personal Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Applicant Name"
                  placeholder="John Doe"
                  {...register("applicantName")}
                  error={errors.applicantName?.message}
                />
                <FormInput
                  label="Age"
                  type="number"
                  placeholder="35"
                  {...register("age")}
                  error={errors.age?.message}
                />
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Financial Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Annual Income ($)"
                  type="number"
                  icon={<DollarSign className="w-4 h-4" />}
                  {...register("income")}
                  error={errors.income?.message}
                />
                <FormInput
                  label="DTI Ratio (%)"
                  type="number"
                  step="0.1"
                  {...register("dtiPercentage")}
                  error={errors.dtiPercentage?.message}
                />
                <FormInput
                  label="Years Employed"
                  type="number"
                  {...register("employmentYears")}
                  error={errors.employmentYears?.message}
                />
                <FormSelect
                  label="Home Ownership"
                  {...register("homeOwnership")}
                  error={errors.homeOwnership?.message}
                  options={[
                    { label: "Rent", value: "rent" },
                    { label: "Own (Outright)", value: "own" },
                    { label: "Mortgage", value: "mortgage" },
                  ]}
                />
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Credit History</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Credit Score"
                  type="number"
                  {...register("creditScore")}
                  error={errors.creditScore?.message}
                />
                <FormInput
                  label="Open Lines"
                  type="number"
                  {...register("numCreditLines")}
                  error={errors.numCreditLines?.message}
                />
                <FormInput
                  label="Late Payments"
                  type="number"
                  {...register("numLatePayments")}
                  error={errors.numLatePayments?.message}
                />
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Calculator className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Loan Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Amount ($)"
                  type="number"
                  icon={<DollarSign className="w-4 h-4" />}
                  {...register("loanAmount")}
                  error={errors.loanAmount?.message}
                />
                <FormInput
                  label="Term (Months)"
                  type="number"
                  {...register("loanTerm")}
                  error={errors.loanTerm?.message}
                />
                <FormSelect
                  label="Purpose"
                  {...register("loanPurpose")}
                  error={errors.loanPurpose?.message}
                  options={[
                    { label: "Debt Consolidation", value: "debt_consolidation" },
                    { label: "Home Improvement", value: "home_improvement" },
                    { label: "Major Purchase", value: "major_purchase" },
                    { label: "Medical", value: "medical" },
                    { label: "Business", value: "business" },
                    { label: "Other", value: "other" },
                  ]}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-blue-600 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Running Model...
                </>
              ) : (
                <>
                  Run Assessment <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-5 relative h-full min-h-[600px]">
          <AnimatePresence mode="wait">
            {!data && !isPending && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-card/50 border border-border/50 border-dashed rounded-2xl"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Calculator className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ready for Analysis</h3>
                <p className="text-muted-foreground text-sm max-w-[250px]">
                  Fill out the applicant details and run the model to view the AI-driven risk assessment here.
                </p>
              </motion.div>
            )}

            {isPending && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-card rounded-2xl shadow-xl shadow-black/5 border border-border/50"
              >
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Processing Data</h3>
                <p className="text-muted-foreground text-sm text-center">
                  Running logistic regression model...<br/>
                  Generating AI insights...
                </p>
              </motion.div>
            )}

            {data && !isPending && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Score Card */}
                <div className="bg-card rounded-2xl p-6 shadow-xl shadow-black/5 border border-border flex flex-col items-center text-center">
                  <div className="flex justify-between w-full mb-4">
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</span>
                    <button onClick={reset} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      <RotateCcw className="w-3 h-3"/> New
                    </button>
                  </div>
                  
                  <Gauge 
                    score={data.riskScore} 
                    category={data.riskCategory}
                    className="mb-4"
                  />

                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full font-bold uppercase tracking-wider text-sm",
                    data.decision === "approved" ? "bg-success/10 text-success" :
                    data.decision === "declined" ? "bg-destructive/10 text-destructive" :
                    "bg-warning/10 text-warning"
                  )}>
                    <DecisionIcon className="w-4 h-4" />
                    {data.decision}
                  </div>
                  
                  <p className="mt-4 text-sm font-medium text-muted-foreground">
                    Probability of Default: <span className="text-foreground font-bold">{formatPercentage(data.defaultProbability)}</span>
                  </p>
                </div>

                {/* AI Explanation */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-2xl p-6 border border-indigo-500/20 shadow-lg">
                  <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold">AI Explanation</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90 font-medium">
                    {data.aiExplanation}
                  </p>
                </div>

                {/* Feature Contributions */}
                <div className="bg-card rounded-2xl p-6 shadow-xl shadow-black/5 border border-border">
                  <h3 className="font-bold text-foreground mb-6">Key Risk Drivers</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.featureContributions} layout="vertical" margin={{ left: 80, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="displayName" 
                          type="category" 
                          width={100} 
                          tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <Tooltip 
                          cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                          contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-md)' }}
                          formatter={(val: number) => [val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2), "Contribution"]}
                        />
                        <Bar dataKey="contribution" radius={[0, 4, 4, 0]} barSize={16}>
                          {data.featureContributions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.contribution > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-6 mt-2 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      Decreases Risk
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive"></div>
                      Increases Risk
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

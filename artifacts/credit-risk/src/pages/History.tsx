import React from "react";
import { useGetCreditRiskHistory } from "@workspace/api-client-react";
import { format } from "date-fns";
import { formatCurrency, formatPercentage, cn } from "@/lib/utils";
import { History as HistoryIcon, ArrowRight, Activity } from "lucide-react";
import { Link } from "wouter";

export function History() {
  const { data: history, isLoading, error } = useGetCreditRiskHistory();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center">
        <h3 className="font-bold text-lg mb-2">Error loading history</h3>
        <p>Could not fetch prediction history. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-primary" />
            Prediction History
          </h1>
          <p className="text-muted-foreground mt-1">Review past loan risk assessments.</p>
        </div>
        <Link 
          href="/"
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          New Assessment <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-card border border-border shadow-lg shadow-black/5 rounded-2xl overflow-hidden">
        {(!history || history.length === 0) ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Activity className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No history found</h3>
            <p className="text-muted-foreground max-w-sm">
              You haven't run any risk assessments yet. Create a new assessment to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-xs font-semibold border-b border-border">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Loan Amount</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">P(Default)</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {record.applicantName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {format(new Date(record.createdAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatCurrency(record.loanAmount)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {record.creditScore}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-muted rounded-md font-medium text-xs">
                        {formatPercentage(record.defaultProbability)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                        record.riskCategory === "low" ? "bg-success/10 text-success" :
                        record.riskCategory === "high" ? "bg-destructive/10 text-destructive" :
                        "bg-warning/10 text-warning"
                      )}>
                        {record.riskCategory}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-bold uppercase text-xs tracking-wider",
                        record.decision === "approved" ? "text-success" :
                        record.decision === "declined" ? "text-destructive" :
                        "text-warning"
                      )}>
                        {record.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

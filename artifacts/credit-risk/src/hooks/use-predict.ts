import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { LoanApplication, CreditRiskResult } from "@workspace/api-client-react";

/**
 * Custom hook for the Predict endpoint to easily expose a clear loading state 
 * and manage data outside the standard react-query boundary since it's a dynamic assessment action.
 */
export function usePredict() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<CreditRiskResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (application: LoanApplication) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch("/api/credit-risk/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application),
      });

      if (!res.ok) {
        throw new Error("Failed to run prediction model. Please check the inputs or try again.");
      }

      const result: CreditRiskResult = await res.json();
      setData(result);
      
      // Invalidate history query so the new prediction shows up in the history page immediately
      queryClient.invalidateQueries({ queryKey: ["/api/credit-risk/history"] });
      
      return result;
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setIsPending(false);
  };

  return { predict, data, isPending, error, reset };
}

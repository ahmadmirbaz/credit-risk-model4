import React from "react";
import { useGetModelInfo } from "@workspace/api-client-react";
import { format } from "date-fns";
import { formatPercentage } from "@/lib/utils";
import { 
  BarChart3, 
  BrainCircuit, 
  Target, 
  Database,
  CalendarClock
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

export function ModelInfo() {
  const { data: modelInfo, isLoading, error } = useGetModelInfo();

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !modelInfo) {
    return (
      <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center">
        <h3 className="font-bold text-lg mb-2">Error loading model metadata</h3>
        <p>Could not fetch model information. Please try again later.</p>
      </div>
    );
  }

  // Sort features by importance for the chart
  const sortedFeatures = [...modelInfo.features].sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-primary" />
          Model Metrics
        </h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">
          Detailed metadata for the currently active Logistic Regression model used for credit risk predictions.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Accuracy</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{formatPercentage(modelInfo.accuracy)}</h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl">
              <Target className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">AUC-ROC</p>
              <h3 className="text-3xl font-display font-bold text-foreground">{modelInfo.auc.toFixed(3)}</h3>
            </div>
            <div className="p-3 bg-success/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Training Samples</p>
              <h3 className="text-3xl font-display font-bold text-foreground">
                {new Intl.NumberFormat("en-US").format(modelInfo.trainingSamples)}
              </h3>
            </div>
            <div className="p-3 bg-chart-5/10 rounded-xl">
              <Database className="w-6 h-6 text-chart-5" />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Last Trained</p>
              <h3 className="text-xl mt-1.5 font-display font-bold text-foreground">
                {format(new Date(modelInfo.lastTrained), "MMM d, yyyy")}
              </h3>
            </div>
            <div className="p-3 bg-warning/10 rounded-xl">
              <CalendarClock className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-lg shadow-black/5">
        <h3 className="text-xl font-bold text-foreground mb-2">Global Feature Importances</h3>
        <p className="text-muted-foreground text-sm mb-8 max-w-2xl">
          The chart below illustrates the relative weight of each feature in the logistic regression model. Larger magnitude values indicate stronger influence on the model's decision output.
        </p>

        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedFeatures} layout="vertical" margin={{ left: 140, right: 30, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis 
                dataKey="displayName" 
                type="category" 
                width={130} 
                tick={{ fontSize: 13, fill: "hsl(var(--foreground))", fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: 'var(--shadow-md)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                formatter={(val: number) => [val.toFixed(4), "Importance Weight"]}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={24}>
                {sortedFeatures.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.importance > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--success))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

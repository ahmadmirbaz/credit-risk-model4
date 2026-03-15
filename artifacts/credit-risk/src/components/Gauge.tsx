import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GaugeProps {
  score: number;       // 0 to 100
  size?: number;       // SVG size
  strokeWidth?: number;
  category: "low" | "medium" | "high";
  className?: string;
}

export function Gauge({ score, size = 200, strokeWidth = 16, category, className }: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Half circle
  const dashoffset = circumference - (score / 100) * circumference;
  
  let color = "stroke-success"; // low
  if (category === "medium") color = "stroke-warning";
  if (category === "high") color = "stroke-destructive";

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size / 2 + 20 }}>
      <svg
        width={size}
        height={size / 2 + strokeWidth}
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
        className="overflow-visible"
      >
        {/* Background Track */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-muted"
        />
        {/* Progress Fill */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={color}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeDasharray={circumference}
        />
      </svg>
      
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="text-4xl font-display font-bold text-foreground">
          {Math.round(score)}
        </span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Risk Score
        </span>
      </div>
    </div>
  );
}

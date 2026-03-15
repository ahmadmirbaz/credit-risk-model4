import React from "react";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center text-center px-4 animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-display font-bold text-foreground tracking-tight mb-2">
        Page Not Found
      </h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

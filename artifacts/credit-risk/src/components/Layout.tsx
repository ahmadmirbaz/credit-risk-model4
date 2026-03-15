import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Activity, 
  History as HistoryIcon,
  ShieldAlert,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Assessment", icon: Activity },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/model-info", label: "Model Info", icon: BarChart3 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <span>RiskEdge</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 -mr-2 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center gap-3 font-display font-bold text-2xl tracking-tight border-b border-sidebar-border/50">
          <div className="p-2 bg-primary/20 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-sidebar-primary" />
          </div>
          <span>RiskEdge</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4 px-2">
            Platform Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200", 
                  !isActive && "group-hover:scale-110"
                )} />
                {item.label}
              </Link>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-sidebar-border/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold font-display text-sm">
              AI
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Model Status</span>
              <span className="text-xs text-sidebar-foreground/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile overlay */}
        {isMobileOpen && (
          <div 
            className="absolute inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

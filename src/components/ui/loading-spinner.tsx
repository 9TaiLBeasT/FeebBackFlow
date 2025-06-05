import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-600 border-t-[#1E90FF]",
        sizeClasses[size],
        className,
      )}
    />
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("loading-skeleton rounded-md", className)} />;
}

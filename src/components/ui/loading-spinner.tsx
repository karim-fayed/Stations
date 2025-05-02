
import React from "react";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className = "h-12 w-12" }: LoadingSpinnerProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-noor-purple ${className}`}></div>
    </div>
  );
};

export default LoadingSpinner;

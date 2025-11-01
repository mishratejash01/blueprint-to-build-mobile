import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🔥 App Error:", error, errorInfo);
    
    // Track error count
    this.setState((prev: any) => ({ 
      errorCount: prev.errorCount + 1 
    }));
    
    // If too many errors, force reset
    if (this.state.errorCount > 3) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth";
    }
  }

  handleReset = () => {
    // Clear caches and reload
    sessionStorage.clear();
    this.setState({ hasError: false, error: null, errorCount: 0 });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted">
          <Card className="max-w-md p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-destructive">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <div className="space-y-2">
              <Button onClick={this.handleReset} className="w-full">
                🔄 Reload App
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/auth"}
                className="w-full"
              >
                ← Back to Login
              </Button>
            </div>
            {this.state.errorCount > 2 && (
              <p className="text-xs text-destructive mt-4">
                Multiple errors detected. Consider clearing app data from your profile.
              </p>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

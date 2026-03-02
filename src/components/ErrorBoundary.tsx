'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Waduh, terjadi kesalahan!</h2>
          <p className="text-red-600 mb-6 text-center">
            Gagal memuat halaman buku. Hal ini mungkin disebabkan oleh masalah koneksi atau file buku yang bermasalah.
          </p>
          <button
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => this.setState({ hasError: false })}
          >
            Coba Lagi
          </button>
          {this.state.error && (
            <details className="mt-4 w-full text-xs text-red-400 cursor-pointer">
              <summary>Detail Error</summary>
              <pre className="mt-2 p-2 bg-white rounded overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

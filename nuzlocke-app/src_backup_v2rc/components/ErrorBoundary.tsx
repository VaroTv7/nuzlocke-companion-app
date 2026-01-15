import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-gray-900 text-red-500 min-h-screen">
                    <h1 className="text-3xl font-bold mb-4">Algo ha salido mal (Error Fatal)</h1>
                    <pre className="bg-black p-4 rounded overflow-auto border border-red-900">
                        {this.state.error?.message}
                        {this.state.error?.stack}
                    </pre>
                    <button
                        onClick={() => { localStorage.clear(); window.location.reload(); }}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Borrar Datos y Recargar (Hard Reset)
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

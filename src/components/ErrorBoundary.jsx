import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Liofy ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black mb-4 shadow-2xl">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-2">Application Notice</h1>
          <p className="text-sm text-zinc-400 max-w-md mb-4">
            Click below to clear cache and restart Liofy freshly.
          </p>

          {this.state.error && (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl max-w-lg w-full text-left text-xs font-mono text-red-300 mb-6 overflow-x-auto">
              <p className="font-bold mb-1 text-red-400">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <pre className="text-[10px] text-zinc-500 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
              )}
            </div>
          )}

          <button
            onClick={() => {
              try {
                localStorage.clear();
                sessionStorage.clear();
              } catch(e){}
              window.location.href = window.location.origin;
            }}
            className="px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-sm rounded-full shadow-xl flex items-center gap-2 transition-transform active:scale-95"
          >
            <RefreshCw size={18} />
            <span>Reset Cache & Launch Liofy</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.removeItem('smart_bazaar_cart');
      localStorage.removeItem('smart_bazaar_customer_user');
      localStorage.removeItem('smart_bazaar_products');
      localStorage.removeItem('smart_bazaar_orders');
      localStorage.removeItem('smart_bazaar_vendors');
      localStorage.removeItem('smart_bazaar_deliveryPartners');
      localStorage.removeItem('smart_bazaar_serviceProviders');
      localStorage.removeItem('smart_bazaar_serviceBookings');
      localStorage.removeItem('smart_bazaar_oldItems');
    } catch (e) {
      console.error('Error clearing local cache:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-800 border-2 border-red-500 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 border border-red-400/40 rounded-full flex items-center justify-center mx-auto text-red-400 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">स्मार्ट बाजार ऐप</h2>
              <p className="text-sm font-bold text-amber-300 mt-1">
                ऐप लोड करते समय कोई त्रुटि हुई है।
              </p>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                घबराएं नहीं, नीचे दिए गए बटन पर क्लिक करके ऐप को तुरंत पुनः लोड करें या रीसेट करें।
              </p>
            </div>

            {this.state.error && (
              <div className="bg-stone-950/80 p-3 rounded-xl text-left text-xs font-mono text-red-300 overflow-x-auto max-h-32 border border-stone-700">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>पुनः लोड करें (Reload)</span>
              </button>

              <button
                onClick={this.handleResetAndReload}
                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-600"
              >
                <RotateCcw className="w-4 h-4 text-stone-400" />
                <span>कैश साफ़ करें (Reset)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-3xl flex items-center justify-center mx-auto shadow-xs border border-slate-200">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">404 Error</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The opportunity, workspace, or resource route you requested does not exist or has been relocated.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => window.history.back()}
            className="flex-1 h-11 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>

          <Link to="/" className="flex-1">
            <Button className="w-full h-11 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
              <Home className="w-4 h-4 text-emerald-400" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default NotFound;

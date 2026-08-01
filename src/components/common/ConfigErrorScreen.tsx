import React from 'react';
import { AlertTriangle, Settings, RefreshCw } from 'lucide-react';

interface ConfigErrorScreenProps {
  missingVariables: string[];
  errorMessage?: string;
}

export const ConfigErrorScreen: React.FC<ConfigErrorScreenProps> = ({
  missingVariables,
  errorMessage
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-solid border-gray-200 p-8 space-y-6">
        <div className="flex items-center gap-3 text-red-600 border-b border-solid border-gray-100 pb-4">
          <AlertTriangle className="w-8 h-8 shrink-0" />
          <h1 className="text-lg font-black tracking-tight uppercase">Fatal Configuration Error</h1>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-gray-600 font-semibold leading-relaxed">
            The platform failed to initialize because one or more required production environment parameters are missing or invalid:
          </p>

          <div className="bg-red-50 border border-solid border-red-200 rounded-lg p-4 font-mono text-[11px] text-red-800 space-y-1.5">
            <span className="font-bold block">Missing Parameters:</span>
            <ul className="list-disc list-inside">
              {missingVariables.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>

          {errorMessage && (
            <p className="text-[10px] font-mono text-gray-500 bg-gray-50 p-2.5 rounded border border-solid border-gray-200">
              {errorMessage}
            </p>
          )}

          <div className="bg-blue-50 border border-solid border-blue-200 rounded-lg p-4 text-[11px] text-blue-800 space-y-1">
            <span className="font-bold block flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" /> Action Required:
            </span>
            <span>Check your `.env` configuration file or deployment settings to ensure these variables are supplied.</span>
          </div>
        </div>

        <button
          onClick={handleReload}
          className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <RefreshCw className="w-4 h-4" /> Reload System
        </button>
      </div>
    </div>
  );
};

export default ConfigErrorScreen;

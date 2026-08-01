import React from 'react';
import { useOpportunityWorkspace } from '../../../context/OpportunityWorkspaceContext';
import { ShieldCheck, MapPin } from 'lucide-react';

export const ProviderDirectoryStudio: React.FC = () => {
  const { providers } = useOpportunityWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Verified Opportunity Provider Graph Directory</h3>
          <p className="text-xs text-slate-500">Authoritative root organizations (Companies, Universities, Gov Agencies, Institutes)</p>
        </div>
        <span className="text-xs font-bold text-slate-500">{providers.length} Verified Providers</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((prov) => (
          <div key={prov.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-md uppercase border border-emerald-200">
                  {prov.provider_type}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{prov.name}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {prov.headquarters_location}
                </p>
              </div>

              <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-full border border-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {prov.trust_rating}% Trust
              </span>
            </div>

            <p className="text-xs text-slate-700">{prov.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { templateService } from '../../../lib/services/templateService';
import type { Template } from '../../../lib/services/templateService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { FolderGit2, Download, ShoppingBag } from 'lucide-react';

export const Purchases: React.FC = () => {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPurchases = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const list = await templateService.getPurchasedTemplates(profile.id);
      setTemplates(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, [profile]);

  if (loading) return <Loading label="Loading purchased templates..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-gray-200 border-solid pb-5 text-left">
        <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" /> My Purchases
        </h1>
        <p className="text-xs text-gray-500 font-semibold mt-0.5">
          Download purchased templates, checklists, and resume layouts.
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-gray-650">No purchases yet.</p>
          <p className="text-xs text-gray-400 font-medium">Browse the template marketplace to get professional resume guides.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {templates.map((temp) => (
            <Card key={temp.id} className="bg-white hover:shadow-xs transition-shadow">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-gray-900 text-sm leading-tight">{temp.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Microsoft Word Format (.docx)</p>
                  </div>
                </div>
                <a href={temp.download_url} download className="shrink-0">
                  <Button className="text-xs font-bold px-3 py-2 flex items-center gap-1.5">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
export default Purchases;

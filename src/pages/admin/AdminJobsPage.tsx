import React, { useState, useEffect } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService, AdminJobRecord } from '@/services/adminService';
import { Pause, Play, Archive, Loader2 } from 'lucide-react';

export const AdminJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<AdminJobRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    const res = await adminService.getJobs();
    if (res.data) {
      setJobs(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdateStatus = async (jobId: string, status: 'published' | 'paused' | 'closed') => {
    await adminService.updateJobStatus(jobId, status);
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
  };

  return (
    <AdminShell title="Job Post Moderation" currentPath="/admin/jobs">
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-kth-slate-200 shadow-xs">
          <div>
            <h2 className="font-display text-base font-bold text-kth-slate-900">All Enterprise Job Postings</h2>
            <p className="text-xs text-kth-slate-500">Monitor live job postings, pause inactive campaigns, or approve drafts.</p>
          </div>
          <span className="text-xs font-mono text-kth-slate-500 font-bold">{jobs.length} Listings</span>
        </div>

        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
              <p className="text-xs text-kth-slate-500">Loading platform jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center text-kth-slate-500 text-xs">
              No jobs currently found in the system.
            </div>
          ) : (
            <>
              {/* Mobile Card List View (< md) */}
              <div className="md:hidden divide-y divide-kth-slate-100">
                {jobs.map((j) => (
                  <div key={j.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-kth-slate-900">{j.title}</h4>
                        <p className="text-xs text-kth-primary-700 font-medium">{j.company_name}</p>
                      </div>
                      <Badge
                        variant={
                          j.status === 'published'
                            ? 'emerald'
                            : j.status === 'paused'
                            ? 'amber'
                            : j.status === 'closed'
                            ? 'rose'
                            : 'slate'
                        }
                        className="capitalize font-mono text-[10px] shrink-0"
                      >
                        {j.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-kth-slate-500 flex items-center justify-between">
                      <span>Category: <strong className="text-kth-slate-700">{j.category}</strong></span>
                      <span>{j.location}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {j.status !== 'published' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 min-h-[38px]"
                          leftIcon={<Play className="w-3.5 h-3.5" />}
                          onClick={() => handleUpdateStatus(j.id, 'published')}
                        >
                          Publish
                        </Button>
                      )}
                      {j.status === 'published' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 min-h-[38px]"
                          leftIcon={<Pause className="w-3.5 h-3.5" />}
                          onClick={() => handleUpdateStatus(j.id, 'paused')}
                        >
                          Pause
                        </Button>
                      )}
                      {j.status !== 'closed' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 min-h-[38px]"
                          leftIcon={<Archive className="w-3.5 h-3.5" />}
                          onClick={() => handleUpdateStatus(j.id, 'closed')}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-kth-slate-50 border-b border-kth-slate-200 text-kth-slate-500 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Position & Company</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kth-slate-100">
                    {jobs.map((j) => (
                      <tr key={j.id} className="hover:bg-kth-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-kth-slate-900">{j.title}</div>
                          <div className="text-kth-slate-500 text-[11px] font-medium">{j.company_name}</div>
                        </td>
                        <td className="p-4 text-kth-slate-600">{j.category}</td>
                        <td className="p-4 text-kth-slate-600">{j.location}</td>
                        <td className="p-4">
                          <Badge
                            variant={
                              j.status === 'published'
                                ? 'emerald'
                                : j.status === 'paused'
                                ? 'amber'
                                : j.status === 'closed'
                                ? 'rose'
                                : 'slate'
                            }
                            className="capitalize font-mono"
                          >
                            {j.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {j.status !== 'published' && (
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Play className="w-3.5 h-3.5" />}
                                onClick={() => handleUpdateStatus(j.id, 'published')}
                              >
                                Publish
                              </Button>
                            )}
                            {j.status === 'published' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<Pause className="w-3.5 h-3.5" />}
                                onClick={() => handleUpdateStatus(j.id, 'paused')}
                              >
                                Pause
                              </Button>
                            )}
                            {j.status !== 'closed' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                leftIcon={<Archive className="w-3.5 h-3.5" />}
                                onClick={() => handleUpdateStatus(j.id, 'closed')}
                              >
                                Close
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>
    </AdminShell>
  );
};

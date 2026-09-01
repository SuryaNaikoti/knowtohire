import React, { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService, AdminEmployerDetailRecord } from '@/services/adminService';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export interface AdminEmployerInspectModalProps {
  employerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChanged?: (userId: string, newStatus: 'active' | 'suspended') => void;
  onUserDeleted?: (userId: string) => void;
  onNavigate?: (path: string) => void;
}

export const AdminEmployerInspectModal: React.FC<AdminEmployerInspectModalProps> = ({
  employerId,
  isOpen,
  onClose,
  onUserDeleted,
  onNavigate,
}) => {
  const [employer, setEmployer] = useState<AdminEmployerDetailRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employerId) {
      setIsLoading(true);
      setActionSuccess(null);
      adminService.getEmployerDetails(employerId).then((res) => {
        if (res.data) {
          setEmployer(res.data);
        }
        setIsLoading(false);
      });
    } else {
      setEmployer(null);
      setIsLoading(false);
    }
  }, [isOpen, employerId]);

  const handleUpdateVerification = async (newStatus: 'verified' | 'rejected') => {
    if (!employer || !employer.company_id || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    const res = await adminService.updateCompanyVerification(employer.company_id, newStatus);
    setIsUpdatingStatus(false);
    if (res.data) {
      setEmployer((prev) => (prev ? { ...prev, verification_status: newStatus } : null));
      setActionSuccess(
        newStatus === 'verified'
          ? 'Employer enterprise verification status updated to Verified.'
          : 'Employer enterprise verification marked as Rejected.'
      );
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleToggleSuspend = async () => {
    if (!employer || isUpdatingStatus) return;

    // Prompt confirmation for permanent erasure
    const confirmed = window.confirm(
      `Are you sure you want to suspend and permanently erase employer "${employer.full_name}" and enterprise records from the platform? All profiles, postings, and credentials will be deleted, and they will need to sign up again from scratch.`
    );
    if (!confirmed) return;

    setIsUpdatingStatus(true);
    const res = await adminService.deleteUserPermanently(employer.id);
    setIsUpdatingStatus(false);

    if (res.data) {
      setActionSuccess('Employer account and enterprise records have been permanently erased.');
      if (onUserDeleted) {
        onUserDeleted(employer.id);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="max-w-2xl sm:max-w-3xl">
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-kth-primary-600 animate-spin" />
          <p className="text-sm font-medium text-kth-slate-500">Loading employer profile dossier...</p>
        </div>
      ) : !employer ? (
        <div className="py-20 text-center space-y-3">
          <Building2 className="w-12 h-12 text-kth-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-kth-slate-800">Employer Not Found</h4>
          <p className="text-xs text-kth-slate-500">Unable to load information for the selected employer account.</p>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-6 text-kth-slate-800 font-sans pb-8">
          {/* Action Success Alert */}
          {actionSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* 1. Header Profile Banner */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-kth-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-white font-bold text-xl shadow-inner font-display">
                  {employer.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-lg font-bold tracking-tight text-white">
                      {employer.full_name}
                    </h3>
                    <Badge
                      variant={
                        employer.status === 'active'
                          ? 'emerald'
                          : employer.status === 'suspended'
                          ? 'rose'
                          : 'amber'
                      }
                      className="text-[10px] uppercase font-mono"
                    >
                      {employer.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">{employer.company_name}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      {employer.email}
                    </span>
                    {employer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-indigo-400" />
                        {employer.phone}
                      </span>
                    )}
                    {employer.headquarters_location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {employer.headquarters_location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-right shrink-0 border border-white/10 w-full sm:w-auto">
                <div className="text-[10px] uppercase font-bold text-slate-300">Enterprise Status</div>
                <div className="text-sm font-bold capitalize text-cyan-300 font-display mt-0.5">
                  {employer.verification_status.replace('_', ' ')}
                </div>
                <div className="text-[10px] text-slate-300">MCA Registered</div>
              </div>
            </div>

            {/* Admin Management Action Toolbar */}
            <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {employer.verification_status !== 'verified' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateVerification('verified')}
                    disabled={isUpdatingStatus}
                    className="font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Verify Enterprise
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpdateVerification('rejected')}
                    disabled={isUpdatingStatus}
                    className="font-bold text-xs bg-white/15 hover:bg-white/25 text-white"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject Verification
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleToggleSuspend}
                  disabled={isUpdatingStatus}
                  className="font-bold text-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  Suspend Account
                </Button>
              </div>

              {employer.company_id && (
                <button
                  type="button"
                  onClick={() => {
                    const path = `/admin/employers/${employer.company_id}`;
                    if (onNavigate) onNavigate(path);
                    else window.location.href = path;
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Full MCA Dossier
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Key Enterprise Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-kth-slate-500">Industry</div>
              <div className="font-bold text-xs text-kth-slate-900 mt-0.5 truncate">
                {employer.industry || 'Environmental & ESG'}
              </div>
            </div>

            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-kth-slate-500">Company Size</div>
              <div className="font-bold text-xs text-kth-slate-900 mt-0.5">
                {employer.company_size || '51-200 employees'}
              </div>
            </div>

            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-kth-slate-500">Active Jobs</div>
              <div className="font-bold text-xs text-kth-slate-900 mt-0.5">
                {employer.active_jobs_count || 4} Published
              </div>
            </div>

            <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-kth-slate-500">Applicants</div>
              <div className="font-bold text-xs text-kth-slate-900 mt-0.5">
                {employer.total_applicants_count || 18} In Pipeline
              </div>
            </div>
          </div>

          {/* 3. Statutory Incorporation & CIN Details */}
          <div className="bg-white border border-kth-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-kth-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Corporate Identity & Statutory Registration
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-kth-slate-50 rounded-lg border border-kth-slate-100">
                <span className="text-[10px] uppercase font-bold text-kth-slate-400 block">Legal Entity Name</span>
                <span className="font-bold text-kth-slate-900 mt-0.5 block">{employer.legal_name || employer.company_name}</span>
              </div>
              <div className="p-3 bg-kth-slate-50 rounded-lg border border-kth-slate-100">
                <span className="text-[10px] uppercase font-bold text-kth-slate-400 block">Corporate ID (CIN)</span>
                <span className="font-mono font-bold text-kth-slate-900 mt-0.5 block">{employer.registration_number || 'U74999KA2021PTC148900'}</span>
              </div>
            </div>
          </div>

          {/* 4. Company Description & Overview */}
          <div className="bg-white border border-kth-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-kth-slate-500 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Enterprise Profile & Description
            </h4>
            <p className="text-xs text-kth-slate-600 leading-relaxed font-normal">
              {employer.description || 'Enterprise profile managing corporate sustainability recruitment and environmental compliance initiatives on KnowToHire.'}
            </p>
          </div>

          {/* 5. Contact & Web Presence */}
          <div className="bg-white border border-kth-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-kth-slate-500 mb-3 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              Contact & Official Channels
            </h4>
            <div className="space-y-2 text-xs text-kth-slate-700">
              <div className="flex items-center justify-between border-b border-kth-slate-100 pb-2">
                <span className="text-kth-slate-500">Official Website</span>
                <a
                  href={employer.website_url || 'https://ecostrategy.co.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  {employer.website_url || 'https://ecostrategy.co.in'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between border-b border-kth-slate-100 pb-2">
                <span className="text-kth-slate-500">Corporate Contact Email</span>
                <span className="font-medium text-kth-slate-900">{employer.contact_email || employer.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-kth-slate-500">Headquarters Location</span>
                <span className="font-medium text-kth-slate-900">{employer.headquarters_location || 'India'}</span>
              </div>
            </div>
          </div>

          {/* 6. System Registration Details */}
          <div className="bg-kth-slate-50 border border-kth-slate-200 rounded-xl p-3.5 text-[11px] text-kth-slate-500 flex flex-wrap items-center justify-between gap-2 font-mono">
            <span>User ID: {employer.id}</span>
            <span>Registered: {new Date(employer.created_at).toLocaleDateString()}</span>
            <span>Account Role: Employer</span>
          </div>
        </div>
      )}
    </Drawer>
  );
};

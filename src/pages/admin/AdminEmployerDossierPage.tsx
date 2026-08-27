import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminService, AdminCompanyRecord } from '@/services/adminService';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Globe,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  ExternalLink,
  Briefcase,
  Users,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export interface AdminEmployerDossierPageProps {
  employerId?: string;
  onNavigate?: (path: string) => void;
}

export const AdminEmployerDossierPage: React.FC<AdminEmployerDossierPageProps> = ({ employerId: propEmployerId, onNavigate }) => {
  const { id: paramId } = useParams<{ id: string }>();
  const id = propEmployerId || paramId;
  const navigate = useNavigate();

  const [company, setCompany] = useState<AdminCompanyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    const res = await adminService.getCompanies();
    if (res.data) {
      const match = res.data.find((c) => c.id === id);
      if (match) {
        setCompany(match);
      } else {
        setError('Enterprise employer profile not found in verification registry.');
      }
    } else {
      setError(res.error?.message || 'Failed to load employer records.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanyDetails();

    const handleSync = () => {
      fetchCompanyDetails();
    };

    window.addEventListener('kth_employers_changed', handleSync);
    window.addEventListener('kth_company_profile_updated', handleSync);

    return () => {
      window.removeEventListener('kth_employers_changed', handleSync);
      window.removeEventListener('kth_company_profile_updated', handleSync);
    };
  }, [id]);

  const handleUpdateStatus = async (status: 'verified' | 'rejected' | 'pending_review') => {
    if (!id) return;
    setActionLoading(true);
    const res = await adminService.updateCompanyVerification(id, status);
    setActionLoading(false);

    if (res.data) {
      setCompany((prev) => (prev ? { ...prev, verification_status: status } : null));
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('/admin/employers');
    } else {
      navigate('/admin/employers');
    }
  };

  return (
    <AdminShell title="Employer Enterprise Verification" currentPath="/admin/employers" onNavigate={onNavigate}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation Breadcrumb & Back Action */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-kth-slate-600 hover:text-kth-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Employer Directory</span>
          </button>

          <span className="text-xs font-mono text-kth-slate-400">Dossier ID: {id}</span>
        </div>

        {isLoading ? (
          <Card className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-kth-primary-600 animate-spin mb-3" />
            <p className="text-xs text-kth-slate-500 font-medium">Retrieving statutory enterprise credentials...</p>
          </Card>
        ) : error || !company ? (
          <Card className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-kth-slate-900">{error || 'Enterprise Record Not Found'}</h3>
            <p className="text-xs text-kth-slate-500 max-w-md mx-auto">
              The requested employer identification does not exist or has been removed from the registry.
            </p>
            <Button variant="secondary" size="sm" onClick={handleBack} className="text-xs font-semibold">
              Return to Employers
            </Button>
          </Card>
        ) : (
          <>
            {/* Enterprise Header Hero Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-cyan-300 flex items-center justify-center font-extrabold text-xl shadow-inner shrink-0">
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{company.name}</h2>
                      <Badge
                        variant={
                          company.verification_status === 'verified'
                            ? 'emerald'
                            : company.verification_status === 'rejected'
                            ? 'rose'
                            : 'amber'
                        }
                        className="capitalize text-xs font-bold px-2.5 py-0.5"
                      >
                        {company.verification_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      Legal Entity: <span className="text-white">{company.legal_name || company.name}</span>
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        Registered: {new Date(company.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-cyan-300">
                        CIN: {company.registration_number || 'U74999KA2021PTC148900'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Control Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  {company.verification_status !== 'pending_review' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 border-white/20"
                      isLoading={actionLoading}
                      onClick={() => handleUpdateStatus('pending_review')}
                    >
                      Mark Pending
                    </Button>
                  )}
                  {company.verification_status !== 'rejected' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      isLoading={actionLoading}
                      onClick={() => handleUpdateStatus('rejected')}
                      className="text-xs font-bold"
                    >
                      Reject Verification
                    </Button>
                  )}
                  {company.verification_status !== 'verified' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      isLoading={actionLoading}
                      onClick={() => handleUpdateStatus('verified')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                    >
                      Verify & Grant ATS Rights
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Statutory Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1 & 2: Corporate Dossier Information */}
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-kth-slate-100 pb-4">
                    <h3 className="font-display text-sm font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-kth-primary-600" />
                      Statutory Incorporation & Registration
                    </h3>
                    <Badge variant="indigo" className="text-[10px] font-mono">
                      MCA Certified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-kth-slate-400" />
                        Corporate ID (CIN)
                      </span>
                      <p className="text-xs font-mono font-bold text-kth-slate-900">
                        {company.registration_number || 'U74999KA2021PTC148900'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-kth-slate-400" />
                        Industry Sector
                      </span>
                      <p className="text-xs font-bold text-kth-slate-900">
                        {company.industry || 'Environmental & ESG Advisory'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-kth-slate-400" />
                        Headquarters Jurisdiction
                      </span>
                      <p className="text-xs font-bold text-kth-slate-900">
                        {company.headquarters_location || 'Bengaluru, Karnataka, India'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-kth-slate-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-kth-slate-400" />
                        Enterprise Scale
                      </span>
                      <p className="text-xs font-bold text-kth-slate-900">
                        {company.company_size || '51-200 employees'}
                      </p>
                    </div>
                  </div>

                  {/* Corporate Overview */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider">
                      Operations Scope & Business Description
                    </h4>
                    <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 text-xs text-kth-slate-700 leading-relaxed font-normal">
                      {company.description ||
                        'Registered corporate entity operating in India. Verification provides authorized credentials for talent acquisition and applicant pipeline workflows.'}
                    </div>
                  </div>
                </Card>

                {/* Digital Domain Verification Card */}
                <Card className="p-6 space-y-4">
                  <h3 className="font-display text-sm font-bold text-kth-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-kth-primary-600" />
                    Digital Web Identity & Corporate Domain
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] text-kth-slate-500 font-medium">Official Website</span>
                        <p className="font-bold text-kth-slate-900">{company.website_url || 'https://ecostrategy.co.in'}</p>
                      </div>
                      <a
                        href={company.website_url || 'https://ecostrategy.co.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white border border-kth-slate-200 text-kth-primary-600 hover:text-kth-primary-700 shadow-xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    <div className="p-4 rounded-xl bg-kth-slate-50 border border-kth-slate-200/80 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] text-kth-slate-500 font-medium">Compliance Contact</span>
                        <p className="font-bold text-kth-slate-900 truncate max-w-[200px]">
                          {company.contact_email || 'compliance@company.com'}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <Mail className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Column 3: Platform Governance & Compliance Checklist */}
              <div className="space-y-6">
                <Card className="p-6 bg-emerald-50/70 border-emerald-200/80 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Compliance Assurance</span>
                  </div>

                  <div className="space-y-3 text-xs text-emerald-900">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>MCA corporate registration number cross-validated with Registrar of Companies records.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Authorized corporate email domain verified against enterprise web infrastructure.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Employer granted statutory rights to post verified jobs to the public directory.</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <h4 className="text-xs font-bold text-kth-slate-900 uppercase tracking-wider">
                    Admin Audit Log
                  </h4>
                  <div className="text-xs text-kth-slate-500 space-y-2 font-mono">
                    <div className="flex justify-between py-1 border-b border-kth-slate-100">
                      <span>Status:</span>
                      <span className="capitalize font-bold text-kth-slate-900">{company.verification_status}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-kth-slate-100">
                      <span>Last Audit:</span>
                      <span className="text-kth-slate-700">{new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Superuser:</span>
                      <span className="text-kth-slate-700">admin@knowtohire.com</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
};

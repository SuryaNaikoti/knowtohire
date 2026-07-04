import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { candidateService } from '../../../lib/services/candidateService';
import type { CandidateCertification } from '../../../lib/services/candidateService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Loading } from '../../../components/ui/Loading';
import { CertificationForm } from '../../../components/dashboard/CertificationForm';
import { Award, Plus, Trash2, Edit2, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

export const Certifications: React.FC = () => {
  const { profile } = useAuth();
  const [certs, setCerts] = useState<CandidateCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CandidateCertification | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const data = await candidateService.getCertifications(profile.id);
      setCerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  const handleAdd = () => {
    setSelectedCert(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cert: CandidateCertification) => {
    setSelectedCert(cert);
    setIsModalOpen(true);
  };

  const handleDelete = async (certId: string) => {
    if (!profile || !window.confirm('Remove this certification?')) return;
    setDeleting(certId);
    try {
      await candidateService.deleteCertification(profile.id, certId);
      setCerts((prev) => prev.filter((c) => c.id !== certId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => {
    setIsModalOpen(false);
    fetchData();
  };

  const getExpiryStatus = (expDate?: string | null) => {
    if (!expDate) return null;
    const exp = new Date(expDate);
    const now = new Date();
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: 'Expired', variant: 'error' as const, icon: 'expired' };
    if (daysLeft <= 60) return { label: `Expires in ${daysLeft}d`, variant: 'warning' as const, icon: 'warn' };
    return { label: `Expires ${exp.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`, variant: 'success' as const, icon: 'ok' };
  };

  if (loading) return <Loading label="Loading certifications..." />;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-secondary" /> Certifications & Credentials
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Showcase your professional certifications and verifiable credentials.
          </p>
        </div>
        <Button onClick={handleAdd} className="font-bold text-xs shrink-0 flex items-center gap-1.5 w-full md:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Certification
        </Button>
      </div>

      {certs.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-7 h-7 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-gray-600">No certifications added yet.</p>
          <p className="text-xs text-gray-400 font-medium">Certifications increase your profile strength and improve employer match scores.</p>
          <Button onClick={handleAdd} className="text-xs font-bold">
            Add First Certification
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((cert) => {
            const expiryStatus = getExpiryStatus(cert.expiration_date);
            return (
              <Card key={cert.id} className="bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(cert)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-primary transition cursor-pointer"
                        aria-label="Edit certification"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cert.id)}
                        disabled={deleting === cert.id}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                        aria-label="Delete certification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-heading font-black text-gray-900 text-sm leading-tight">{cert.name}</h3>
                    <p className="text-xs font-bold text-gray-600">{cert.issuing_organization}</p>
                    {cert.credential_id && (
                      <p className="text-[11px] text-gray-400 font-medium">ID: {cert.credential_id}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {cert.issue_date && (
                      <span className="text-[11px] text-gray-500 font-semibold">
                        Issued: {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    {expiryStatus && (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          expiryStatus.icon === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : expiryStatus.icon === 'warn'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {expiryStatus.icon === 'expired' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : expiryStatus.icon === 'warn' ? (
                          <AlertTriangle className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {expiryStatus.label}
                      </span>
                    )}
                  </div>

                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Verify Credential
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Render CertificationForm Directly as it handles modal wrapping internally */}
      {profile && (
        <CertificationForm
          candidateId={profile.id}
          certificationToEdit={selectedCert}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaveSuccess={handleSaved}
        />
      )}
    </div>
  );
};
export default Certifications;

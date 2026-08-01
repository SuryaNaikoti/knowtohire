import React, { useState } from 'react';
import { useCareerEvidence } from '../../../context/CareerEvidenceContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Plus, Trash2, Award, Calendar, ExternalLink, ShieldCheck, Tag } from 'lucide-react';

export const CertificationsAccreditationEditor: React.FC = () => {
  const { certifications, addCertification, deleteCertification } = useCareerEvidence();

  const [name, setName] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [status, setStatus] = useState<'Active' | 'Expired' | 'Lifetime'>('Active');
  const [skillTagInput, setSkillTagInput] = useState('');
  const [skillsCovered, setSkillsCovered] = useState<{ skill_name: string }[]>([]);

  const handleAddSkillTag = () => {
    if (!skillTagInput.trim()) return;
    setSkillsCovered([...skillsCovered, { skill_name: skillTagInput.trim() }]);
    setSkillTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !issuingOrg) return;

    await addCertification({
      name,
      issuing_organization: issuingOrg,
      issue_date: issueDate,
      expiration_date: expiryDate || null,
      credential_id: credentialId,
      credential_url: credentialUrl,
      status,
      skills_covered: skillsCovered,
      verification_status: 'Issuer-Verified',
    });

    setName('');
    setIssuingOrg('');
    setIssueDate('');
    setExpiryDate('');
    setCredentialId('');
    setCredentialUrl('');
    setStatus('Active');
    setSkillsCovered([]);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-purple-600" />
          <span>Add Certification & Licensing Evidence</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Certification Name *"
            placeholder="e.g. AWS Certified Solutions Architect - Associate"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Issuing Organization *"
            placeholder="e.g. Amazon Web Services or PMI"
            value={issuingOrg}
            onChange={(e) => setIssuingOrg(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Issue Date"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />

          <Input
            label="Expiry Date (If applicable)"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Certification Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Lifetime">Lifetime / No Expiry</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Credential ID"
            placeholder="e.g. AWS-83920481"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
          />

          <Input
            label="Verification URL"
            placeholder="https://credly.com/verify/..."
            leftIcon={<ExternalLink className="w-4 h-4" />}
            value={credentialUrl}
            onChange={(e) => setCredentialUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Skills Validated by Certification</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. AWS, Cloud Security, DevOps"
              value={skillTagInput}
              onChange={(e) => setSkillTagInput(e.target.value)}
              className="flex-1 px-3.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
            <Button
              type="button"
              onClick={handleAddSkillTag}
              className="px-3 h-8 text-xs font-bold bg-slate-900 text-white rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" /> Add Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {skillsCovered.map((sk, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold rounded-md flex items-center gap-1">
                {sk.skill_name}
                <button type="button" onClick={() => setSkillsCovered(skillsCovered.filter((_, i) => i !== idx))}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Save Certification Evidence</span>
        </Button>
      </form>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Recorded Certifications ({certifications.length})
        </h4>

        {certifications.map((cert) => (
          <div key={cert.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{cert.name}</span>
                  <span className="text-xs font-semibold text-purple-600">@ {cert.issuing_organization}</span>
                </h4>
                <p className="text-xs text-slate-500">Issued: {cert.issue_date} • {cert.status}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Issuer Verified
                </span>
                <button
                  type="button"
                  onClick={() => deleteCertification(cert.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {cert.credential_url && (
              <a
                href={cert.credential_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Verify Credential #{cert.credential_id}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

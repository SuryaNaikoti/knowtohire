import React, { useState } from 'react';
import { useDocumentIntelligence } from '../../../context/DocumentIntelligenceContext';
import type { CareerDocumentType } from '../../../types/candidate.types';
import { Button } from '../../ui/Button';
import { Plus, Trash2, FileText, Upload, Eye, TrendingUp } from 'lucide-react';

export const CareerDocumentRepository: React.FC = () => {
  const { documents, uploadCareerDocument, deleteCareerDocument } = useDocumentIntelligence();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<CareerDocumentType>('Resume');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    await uploadCareerDocument(selectedFile, docType);
    setIsUploading(false);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload New Career Document */}
      <form onSubmit={handleUpload} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-600" />
          <span>Upload Career Document to CDIC Repository</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="Resume">Resume / CV</option>
              <option value="Cover Letter">Cover Letter</option>
              <option value="Portfolio PDF">Portfolio PDF</option>
              <option value="Certificate">Certificate Document</option>
              <option value="Publication">Research Publication</option>
              <option value="Patent">Patent Document</option>
              <option value="Case Study">Executive Case Study</option>
              <option value="Recommendation">Recommendation Letter</option>
              <option value="Performance Review">Performance Review</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Select PDF / DOCX File</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl bg-slate-50 cursor-pointer"
            />
          </div>
        </div>

        {selectedFile && (
          <Button
            type="submit"
            isLoading={isUploading}
            className="w-full h-11 text-xs font-bold bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document to CDIC</span>
          </Button>
        )}
      </form>

      {/* Document Repository List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Managed Career Documents ({documents.length})
        </h4>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>{doc.title}</span>
                      {doc.is_primary && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          Primary
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Type: {doc.document_type} • Version: {doc.version_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => deleteCareerDocument(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document Performance Analytics Strip */}
              {doc.analytics && (
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold">
                  <div>
                    <span className="text-slate-400 block uppercase">Downloads</span>
                    <span className="text-slate-800 font-extrabold">{doc.analytics.downloads}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3 text-slate-500" /> Views
                    </span>
                    <span className="text-emerald-600 font-extrabold">{doc.analytics.employer_views}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3 text-teal-500" /> Interview Conv.
                    </span>
                    <span className="text-teal-600 font-extrabold">{doc.analytics.interview_conversion_rate}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

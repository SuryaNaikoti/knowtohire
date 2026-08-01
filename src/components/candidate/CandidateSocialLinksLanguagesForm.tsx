import React, { useState } from 'react';
import { useIdentityWorkspace } from '../../context/IdentityWorkspaceContext';
import { Plus, Trash2, Globe, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const CandidateSocialLinksLanguagesForm: React.FC = () => {
  const { socialLinks, languages, updateSocialLinksState, updateLanguagesState } = useIdentityWorkspace();

  const [newPlatform, setNewPlatform] = useState('LinkedIn');
  const [newUrl, setNewUrl] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newProficiency, setNewProficiency] = useState<'Native' | 'Fluent' | 'Professional' | 'Intermediate' | 'Basic'>('Fluent');

  const handleAddSocial = () => {
    if (!newUrl.trim()) return;
    updateSocialLinksState([
      ...socialLinks,
      { platform_name: newPlatform, profile_url: newUrl, visibility: 'public', is_verified: true },
    ]);
    setNewUrl('');
  };

  const handleRemoveSocial = (index: number) => {
    updateSocialLinksState(socialLinks.filter((_, idx) => idx !== index));
  };

  const handleAddLanguage = () => {
    if (!newLang.trim()) return;
    updateLanguagesState([...languages, { language_name: newLang, proficiency_level: newProficiency }]);
    setNewLang('');
  };

  const handleRemoveLanguage = (index: number) => {
    updateLanguagesState(languages.filter((_, idx) => idx !== index));
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
      {/* Social Links Manager */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>Dynamic Social & Portfolio Links</span>
          <span className="text-xs font-normal text-slate-400">{socialLinks.length} items added</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="LinkedIn">LinkedIn</option>
            <option value="GitHub">GitHub</option>
            <option value="Portfolio">Portfolio</option>
            <option value="Twitter">Twitter / X</option>
            <option value="Dribbble">Dribbble</option>
            <option value="Personal Website">Personal Website</option>
          </select>

          <input
            type="text"
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />

          <Button
            type="button"
            onClick={handleAddSocial}
            className="px-4 h-9 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Link
          </Button>
        </div>

        <div className="space-y-2">
          {socialLinks.map((link, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">{link.platform_name}:</span>
                <span className="text-slate-600 truncate max-w-xs">{link.profile_url}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSocial(idx)}
                className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Spoken Languages Manager */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>Spoken Languages</span>
          <span className="text-xs font-normal text-slate-400">{languages.length} languages</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Language name (e.g. English, Spanish, Hindi)"
            value={newLang}
            onChange={(e) => setNewLang(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />

          <select
            value={newProficiency}
            onChange={(e) => setNewProficiency(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="Native">Native / Bilingual</option>
            <option value="Fluent">Fluent</option>
            <option value="Professional">Professional Working</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Basic">Basic</option>
          </select>

          <Button
            type="button"
            onClick={handleAddLanguage}
            className="px-4 h-9 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Language
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {languages.map((lang, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-center gap-2"
            >
              <span>
                {lang.language_name} ({lang.proficiency_level})
              </span>
              <button
                type="button"
                onClick={() => handleRemoveLanguage(idx)}
                className="text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useIdentityWorkspace } from '../../context/IdentityWorkspaceContext';
import { Input } from '../ui/Input';
import { Phone, MapPin, Globe, Clock } from 'lucide-react';

export const CandidateContactLocationForm: React.FC = () => {
  const { profile, updateProfileState } = useIdentityWorkspace();

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
        Contact Workspace & Location Intelligence
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          placeholder="+1 (555) 000-0000"
          leftIcon={<Phone className="w-4 h-4" />}
          value={profile.phone || ''}
          onChange={(e) => updateProfileState({ phone: e.target.value })}
        />

        <Input
          label="Current Location"
          placeholder="e.g. San Francisco, CA or Hyderabad, India"
          leftIcon={<MapPin className="w-4 h-4" />}
          value={profile.location || ''}
          onChange={(e) => updateProfileState({ location: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Time Zone"
          placeholder="e.g. UTC+05:30 (IST) or EST"
          leftIcon={<Clock className="w-4 h-4" />}
          value={profile.timezone || ''}
          onChange={(e) => updateProfileState({ timezone: e.target.value })}
        />

        <Input
          label="Preferred Working Hours"
          placeholder="e.g. 9:00 AM - 6:00 PM IST"
          leftIcon={<Clock className="w-4 h-4" />}
          value={profile.preferred_working_hours || ''}
          onChange={(e) => updateProfileState({ preferred_working_hours: e.target.value })}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Preferred Communication Method</label>
          <select
            value={profile.preferred_communication || 'Email'}
            onChange={(e) => updateProfileState({ preferred_communication: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="Email">Email Only</option>
            <option value="Phone">Phone Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Platform Messaging">In-App Messages</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Work Authorization Status"
          placeholder="e.g. US Citizen / Green Card / Authorized"
          leftIcon={<Globe className="w-4 h-4" />}
          value={profile.work_authorization || ''}
          onChange={(e) => updateProfileState({ work_authorization: e.target.value })}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Availability & Notice Period</label>
          <select
            value={profile.availability_status || 'Immediately Available'}
            onChange={(e) => updateProfileState({ availability_status: e.target.value as any })}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="Immediately Available">Immediately Available</option>
            <option value="15 Days Notice">15 Days Notice</option>
            <option value="30 Days Notice">30 Days Notice</option>
            <option value="Not Looking">Not Actively Looking</option>
          </select>
        </div>
      </div>
    </div>
  );
};

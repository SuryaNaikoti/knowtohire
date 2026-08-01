import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/services/employerService';
import type { Company, CompanyLocation } from '../../../lib/services/employerService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/Alert';
import { Loading } from '../../../components/ui/Loading';
import { MapPin, Plus, Trash2, Edit2, ShieldAlert, X, Search, Globe, Phone, Mail, User, Clock, Compass } from 'lucide-react';

export const Locations: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<CompanyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<CompanyLocation | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isHq, setIsHq] = useState(false);
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [timezone, setTimezone] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [manager, setManager] = useState('');
  const [gps, setGps] = useState('');
  
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLocationsData = async () => {
    if (!user) return;
    try {
      const comp = await employerService.getCompanyByEmployer(user.id);
      if (comp) {
        setCompany(comp);
        const locs = await employerService.getLocations(comp.id);
        setLocations(locs);
        setFilteredLocations(locs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationsData();
  }, [user]);

  // Search Filter
  useEffect(() => {
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      setFilteredLocations(
        locations.filter(
          (loc) =>
            loc.city.toLowerCase().includes(lower) ||
            loc.country.toLowerCase().includes(lower) ||
            loc.address.toLowerCase().includes(lower) ||
            (loc.manager && loc.manager.toLowerCase().includes(lower))
        )
      );
    } else {
      setFilteredLocations(locations);
    }
  }, [searchQuery, locations]);

  const handleAddNew = () => {
    setSelectedLocation(null);
    setAddress('');
    setCity('');
    setStateProvince('');
    setCountry('');
    setPostalCode('');
    setIsHq(false);
    setGoogleMapUrl('');
    setTimezone('');
    setWorkingHours('');
    setPhone('');
    setEmail('');
    setManager('');
    setGps('');
    setError('');
    setIsFormOpen(true);
  };

  const handleEdit = (loc: CompanyLocation) => {
    setSelectedLocation(loc);
    setAddress(loc.address);
    setCity(loc.city);
    setStateProvince(loc.state_province || '');
    setCountry(loc.country);
    setPostalCode(loc.postal_code || '');
    setIsHq(loc.is_headquarters);
    setGoogleMapUrl(loc.google_map_url || '');
    setTimezone(loc.timezone || '');
    setWorkingHours(loc.working_hours || '');
    setPhone(loc.phone || '');
    setEmail(loc.email || '');
    setManager(loc.manager || '');
    setGps(loc.gps || '');
    setError('');
    setIsFormOpen(true);
  };

  const handleDelete = async (locId: string) => {
    if (!company || !window.confirm('Are you sure you want to remove this office location?')) return;
    try {
      await employerService.deleteLocation(company.id, locId);
      if (selectedLocation?.id === locId) {
        setIsFormOpen(false);
      }
      fetchLocationsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    if (!address || !city || !country) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload = {
        id: selectedLocation?.id,
        company_id: company.id,
        address,
        city,
        state_province: stateProvince,
        country,
        postal_code: postalCode,
        is_headquarters: isHq,
        google_map_url: googleMapUrl,
        timezone,
        working_hours: workingHours,
        phone,
        email,
        manager,
        gps,
      };

      const success = await employerService.upsertLocation(payload as any);
      if (success) {
        setIsFormOpen(false);
        fetchLocationsData();
      } else {
        setError('Failed to save office location details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during save operations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading label="Loading office registry..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 border-solid pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-gray-900 tracking-tight">
            Office Locations
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Register your company office branches, regional spaces, and designate your global headquarters.
          </p>
        </div>
        {!isFormOpen && (
          <Button size="sm" onClick={handleAddNew} className="text-xs font-bold self-start">
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Location
          </Button>
        )}
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-gray-900 bg-white placeholder-gray-400 border-solid outline-none"
          placeholder="Search registered branch offices by city, manager, country or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Locations Grid */}
        <div className={`${isFormOpen ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {filteredLocations.length === 0 ? (
            <div className="bg-white border border-gray-155 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
              <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">No office locations found.</p>
              <p className="text-xs text-gray-400 font-medium">Add a corporate office or headquarters to enable candidate matching.</p>
              <Button size="sm" onClick={handleAddNew} className="text-xs font-bold mt-2">
                Create First Office
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLocations.map((loc) => (
                <Card
                  key={loc.id}
                  className="bg-white hover:border-gray-300 transition group flex flex-col justify-between"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider leading-none">
                            {loc.city}, {loc.state_province || loc.country}
                          </h4>
                        </div>

                        {/* HQ Tag */}
                        {loc.is_headquarters && (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-250">
                            Headquarters
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 font-semibold pl-6 space-y-1">
                        <p>{loc.address}</p>
                        <p>
                          {loc.city}
                          {loc.state_province ? `, ${loc.state_province}` : ''} {loc.postal_code}
                        </p>
                        <p className="text-gray-400">{loc.country}</p>
                      </div>

                      {/* Extended details display */}
                      <div className="pl-6 pt-2 border-t border-solid border-gray-100 text-xs text-gray-600 space-y-1.5 font-medium">
                        {loc.manager && <p className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> Manager: <span className="font-bold text-gray-800">{loc.manager}</span></p>}
                        {loc.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {loc.phone}</p>}
                        {loc.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" /> {loc.email}</p>}
                        {loc.working_hours && <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {loc.working_hours}</p>}
                        {loc.timezone && <p className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-gray-400" /> Timezone: {loc.timezone}</p>}
                        {loc.gps && <p className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-gray-400" /> GPS: {loc.gps}</p>}
                      </div>
                    </div>

                    {/* Edit & delete controls */}
                    <div className="flex justify-end space-x-1 border-t border-gray-100 border-solid pt-3 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(loc)}
                        className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                        aria-label="Edit location"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc.id)}
                        className="p-1 rounded text-gray-400 hover:bg-red-50 hover:text-red-650 cursor-pointer"
                        aria-label="Delete location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Split View Compact Form Panel */}
        {isFormOpen && company && (
          <div className="lg:col-span-5 bg-white border border-solid border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-solid border-gray-100 pb-3">
              <h3 className="font-heading font-black text-gray-900 text-sm">
                {selectedLocation ? 'Edit Office Location' : 'Add Office Location'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-655 transition cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && <Alert type="error" className="text-xs" title="Location Alert">{error}</Alert>}

              <Input
                label="Street Address"
                placeholder="e.g. 100 Main St, Suite 200"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  placeholder="e.g. San Francisco"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="State / Province"
                  placeholder="e.g. CA"
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Country"
                  placeholder="e.g. USA"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
                <Input
                  label="Postal / ZIP Code"
                  placeholder="e.g. 94105"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Branch Manager"
                  placeholder="Manager Name"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                />
                <Input
                  label="Branch Phone"
                  placeholder="e.g. +1 (555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Input
                label="Branch Contact Email"
                placeholder="branch@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Working Hours"
                  placeholder="e.g. 9 AM - 5 PM"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                />
                <Input
                  label="Timezone"
                  placeholder="e.g. GMT-8 / PST"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="GPS Coordinates"
                  placeholder="Latitude, Longitude"
                  value={gps}
                  onChange={(e) => setGps(e.target.value)}
                />
                <Input
                  label="Google Maps Link"
                  placeholder="https://maps.google.com/..."
                  value={googleMapUrl}
                  onChange={(e) => setGoogleMapUrl(e.target.value)}
                />
              </div>

              <label className="flex items-center space-x-2.5 cursor-pointer py-1 select-none">
                <input
                  type="checkbox"
                  checked={isHq}
                  onChange={(e) => setIsHq(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">Set as Company Headquarters</span>
              </label>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={saving} size="sm" className="bg-white text-xs font-bold">
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving} size="sm" className="text-xs font-bold">
                  Save Office
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

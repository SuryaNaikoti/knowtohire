import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { employerService } from '../../../lib/services/employerService';
import type { Company, CompanyLocation } from '../../../lib/services/employerService';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Loading } from '../../../components/ui/Loading';
import { LocationForm } from '../../../components/dashboard/LocationForm';
import { MapPin, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export const Locations: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [locations, setLocations] = useState<CompanyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<CompanyLocation | null>(null);

  const fetchLocationsData = async () => {
    if (!user) return;
    try {
      const comp = await employerService.getCompanyByEmployer(user.id);
      if (comp) {
        setCompany(comp);
        const locs = await employerService.getLocations(comp.id);
        setLocations(locs);
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

  const handleAddNew = () => {
    setSelectedLocation(null);
    setIsFormOpen(true);
  };

  const handleEdit = (loc: CompanyLocation) => {
    setSelectedLocation(loc);
    setIsFormOpen(true);
  };

  const handleDelete = async (locId: string) => {
    if (!company || !window.confirm('Are you sure you want to remove this office location?')) return;
    try {
      await employerService.deleteLocation(company.id, locId);
      fetchLocationsData();
    } catch (err) {
      console.error(err);
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
            Office Office Locations
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Register your company office branches, regional spaces, and designate your global headquarters.
          </p>
        </div>
        <Button size="sm" onClick={handleAddNew} className="text-xs font-bold self-start">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Location
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="bg-white border border-gray-150 border-solid rounded-xl p-12 text-center max-w-xl mx-auto space-y-3">
          <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-600">No office locations declared yet.</p>
          <p className="text-xs text-gray-400 font-medium">Add a corporate office or headquarters to enable candidate matching.</p>
          <Button size="sm" onClick={handleAddNew} className="text-xs font-bold mt-2">
            Create First Office
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locations.map((loc) => (
            <Card
              key={loc.id}
              className="bg-white hover:border-gray-300 transition group flex flex-col justify-between"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider leading-none">
                        {loc.city}, {loc.state_province || loc.country}
                      </h4>
                    </div>

                    {/* HQ Tag */}
                    {loc.is_headquarters && (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Headquarters
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 font-medium pl-6 leading-relaxed">
                    <p>{loc.address}</p>
                    <p>
                      {loc.city}
                      {loc.state_province ? `, ${loc.state_province}` : ''} {loc.postal_code}
                    </p>
                    <p className="font-bold text-gray-400 mt-1">{loc.country}</p>
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

      {/* Location Modal Form */}
      {company && (
        <LocationForm
          companyId={company.id}
          locationToEdit={selectedLocation}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSaveSuccess={fetchLocationsData}
        />
      )}
    </div>
  );
};

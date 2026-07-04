import React, { useState, useEffect } from 'react';
import { employerService } from '../../lib/services/employerService';
import type { CompanyLocation } from '../../lib/services/employerService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';

interface LocationFormProps {
  companyId: string;
  locationToEdit: CompanyLocation | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const LocationForm: React.FC<LocationFormProps> = ({
  companyId,
  locationToEdit,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isHq, setIsHq] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locationToEdit) {
      setAddress(locationToEdit.address);
      setCity(locationToEdit.city);
      setStateProvince(locationToEdit.state_province || '');
      setCountry(locationToEdit.country);
      setPostalCode(locationToEdit.postal_code || '');
      setIsHq(locationToEdit.is_headquarters);
    } else {
      setAddress('');
      setCity('');
      setStateProvince('');
      setCountry('');
      setPostalCode('');
      setIsHq(false);
    }
    setError('');
  }, [locationToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !city || !country) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = {
        id: locationToEdit?.id,
        company_id: companyId,
        address,
        city,
        state_province: stateProvince,
        country,
        postal_code: postalCode,
        is_headquarters: isHq,
      };

      const success = await employerService.upsertLocation(payload as any);
      if (success) {
        onSaveSuccess();
        onClose();
      } else {
        setError('Failed to save office location details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please verify input parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={locationToEdit ? 'Edit Office Location' : 'Add Office Location'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" className="text-xs" title="Location Alert">{error}</Alert>}

        <Input
          label="Street Address"
          placeholder="e.g. 100 Main St, Suite 200"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} size="sm" className="bg-white text-xs font-bold">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} size="sm" className="text-xs font-bold">
            Save Office
          </Button>
        </div>
      </form>
    </Modal>
  );
};

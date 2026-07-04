import React, { useState, useEffect } from 'react';
import { jobsService } from '../../lib/services/jobsService';
import type { JobCategory, JobFilter } from '../../lib/services/jobsService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Filter, RotateCcw, Search, MapPin, DollarSign } from 'lucide-react';

interface JobFilterSidebarProps {
  initialFilters: JobFilter;
  onFilterChange: (filters: JobFilter) => void;
}

export const JobFilterSidebar: React.FC<JobFilterSidebarProps> = ({
  initialFilters,
  onFilterChange,
}) => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  
  // Local state representing active filters
  const [search, setSearch] = useState(initialFilters.searchQuery || '');
  const [category, setCategory] = useState(initialFilters.categoryId || '');
  const [minSalary, setMinSalary] = useState(initialFilters.minSalary ? initialFilters.minSalary.toString() : '');
  const [salaryVisible, setSalaryVisible] = useState(initialFilters.salaryVisible || false);
  const [country, setCountry] = useState(initialFilters.country || '');
  const [stateVal, setStateVal] = useState(initialFilters.state || '');
  const [city, setCity] = useState(initialFilters.city || '');
  
  const [locationTypes, setLocationTypes] = useState<('Onsite' | 'Remote' | 'Hybrid')[]>(initialFilters.locationType || []);
  const [employmentTypes, setEmploymentTypes] = useState<('Full-time' | 'Part-time' | 'Contract' | 'Internship')[]>(initialFilters.employmentType || []);
  const [careerDomains, setCareerDomains] = useState<('General' | 'Environmental' | 'ESG' | 'Patent' | 'IPR' | 'Research' | 'Consulting')[]>(initialFilters.careerDomain || []);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await jobsService.getJobCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  const handleLocationToggle = (type: 'Onsite' | 'Remote' | 'Hybrid') => {
    setLocationTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleEmploymentToggle = (type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship') => {
    setEmploymentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleDomainToggle = (domain: 'General' | 'Environmental' | 'ESG' | 'Patent' | 'IPR' | 'Research' | 'Consulting') => {
    setCareerDomains(prev =>
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onFilterChange({
      searchQuery: search || undefined,
      categoryId: category || undefined,
      minSalary: minSalary ? parseInt(minSalary) : undefined,
      salaryVisible: salaryVisible || undefined,
      country: country || undefined,
      state: stateVal || undefined,
      city: city || undefined,
      locationType: locationTypes.length > 0 ? locationTypes : undefined,
      employmentType: employmentTypes.length > 0 ? employmentTypes : undefined,
      careerDomain: careerDomains.length > 0 ? careerDomains : undefined,
    });
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setMinSalary('');
    setSalaryVisible(false);
    setCountry('');
    setStateVal('');
    setCity('');
    setLocationTypes([]);
    setEmploymentTypes([]);
    setCareerDomains([]);

    onFilterChange({});
  };

  // Group categories into Parent -> Children
  const parentCategories = categories.filter(c => !c.parent_category_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_category_id === parentId);

  return (
    <Card className="bg-white shrink-0 shadow-sm border border-gray-200 border-solid sticky top-20">
      <CardHeader className="pb-3 border-b border-gray-150 border-solid flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-primary" /> Filter Vacancies
        </CardTitle>
        <button
          onClick={handleReset}
          className="text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest flex items-center gap-0.5 cursor-pointer border-none bg-transparent"
        >
          <RotateCcw className="w-3 h-3" /> Clear
        </button>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <form onSubmit={handleApply} className="space-y-4">
          {/* Keyword Search */}
          <div className="space-y-1">
            <Input
              label="Keywords"
              placeholder="Title, company, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Job Category */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-700 tracking-wide">Category</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {parentCategories.map(parent => (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name} (General)</option>
                  {getSubcategories(parent.id).map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </div>

          {/* Location Fields */}
          <div className="space-y-3 border-t border-gray-100 border-solid pt-3">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Localization</h5>
            <div className="grid grid-cols-1 gap-2">
              <Input
                placeholder="Country (e.g. Canada)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="py-1.5 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="State/Prov"
                  value={stateVal}
                  onChange={(e) => setStateVal(e.target.value)}
                  className="py-1.5 text-xs"
                />
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Location Type Checkboxes */}
          <div className="space-y-2 border-t border-gray-100 border-solid pt-3">
            <label className="text-xs font-bold text-gray-700 tracking-wide">Workplace Type</label>
            <div className="flex flex-col space-y-1.5 pl-0.5">
              {['Onsite', 'Remote', 'Hybrid'].map((type) => (
                <label key={type} className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={locationTypes.includes(type as any)}
                    onChange={() => handleLocationToggle(type as any)}
                    className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Career Domain Checkboxes */}
          <div className="space-y-2 border-t border-gray-100 border-solid pt-3">
            <label className="text-xs font-bold text-gray-700 tracking-wide">Career Domains</label>
            <div className="flex flex-col space-y-1.5 pl-0.5">
              {['General', 'Environmental', 'ESG', 'Patent', 'IPR', 'Research', 'Consulting'].map((domain) => (
                <label key={domain} className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={careerDomains.includes(domain as any)}
                    onChange={() => handleDomainToggle(domain as any)}
                    className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span>{domain}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div className="space-y-2 border-t border-gray-100 border-solid pt-3">
            <label className="text-xs font-bold text-gray-700 tracking-wide">Employment Type</label>
            <div className="flex flex-col space-y-1.5 pl-0.5">
              {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                <label key={type} className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employmentTypes.includes(type as any)}
                    onChange={() => handleEmploymentToggle(type as any)}
                    className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary Filter */}
          <div className="space-y-2 border-t border-gray-100 border-solid pt-3 pb-1">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Compensation</h5>
            <Input
              placeholder="Minimum Salary"
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              className="py-1.5 text-xs"
            />
            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-600 cursor-pointer mt-2 pl-0.5">
              <input
                type="checkbox"
                checked={salaryVisible}
                onChange={(e) => setSalaryVisible(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span>Disclosed salary only</span>
            </label>
          </div>

          <Button type="submit" className="w-full text-xs font-bold pt-2.5 pb-2.5">
            Apply Filters
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

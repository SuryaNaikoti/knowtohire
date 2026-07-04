import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { templateService } from '../../lib/services/templateService';
import type { Template, TemplateCategory } from '../../lib/services/templateService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { ShoppingBag, Search, Tag, Filter, CheckCircle2, ChevronRight } from 'lucide-react';

export const Marketplace: React.FC = () => {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        setLoading(true);
        const [cats, temps] = await Promise.all([
          templateService.getTemplateCategories(),
          templateService.getTemplates()
        ]);
        setCategories(cats);
        setTemplates(temps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMarketplace();
  }, []);

  const filteredTemplates = templates.filter(t => {
    const matchesCat = !selectedCat || t.category_id === selectedCat;
    const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (loading) return <Loading label="Loading templates..." />;

  return (
    <div className="bg-slate-50/50 min-h-screen py-16 animate-fade-in-up">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Banner Section */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
          <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none translate-x-12 translate-y-12 scale-150">
            <ShoppingBag className="w-96 h-96" />
          </div>
          <div className="max-w-xl space-y-4 text-left relative z-10">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full border border-solid border-emerald-500/30">
              KTH Marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight leading-tight">
              Premium Resume & Portfolio Templates
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
              Accelerate your job matching index. Use proven ATS-friendly layouts optimized for Environmental,ESG, and IPR domains.
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-solid border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-solid border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold outline-none bg-slate-50/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Button
              variant={selectedCat === '' ? 'primary' : 'outline'}
              onClick={() => setSelectedCat('')}
              className="text-xs font-bold whitespace-nowrap px-4 py-2 flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCat === cat.id ? 'primary' : 'outline'}
                onClick={() => setSelectedCat(cat.id)}
                className="text-xs font-bold whitespace-nowrap px-4 py-2 flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" /> {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white border border-solid border-slate-200 rounded-3xl p-16 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-650">No templates found matching filters.</p>
            <Button variant="outline" onClick={() => { setSelectedCat(''); setSearchQuery(''); }} className="text-xs font-bold">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredTemplates.map((temp) => (
              <Card key={temp.id} className="bg-white border border-solid border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div>
                  <img
                    src={temp.preview_image_url || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400'}
                    alt={temp.title}
                    className="w-full h-48 object-cover border-b border-solid border-slate-100"
                  />
                  <CardContent className="p-5 space-y-2">
                    <h3 className="font-heading font-black text-slate-900 text-sm tracking-tight leading-snug">{temp.title}</h3>
                    {temp.description && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{temp.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 pt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] text-slate-500 font-bold">ATS-Optimized</span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between gap-4 border-t border-solid border-slate-50 mt-4">
                  <span className="text-sm sm:text-base font-black text-slate-900">${(temp.price_cents / 100).toFixed(2)}</span>
                  <Link to={`/marketplace/template/${temp.slug}`}>
                    <Button className="text-xs font-bold px-3 py-1.5 flex items-center gap-1">
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
export default Marketplace;

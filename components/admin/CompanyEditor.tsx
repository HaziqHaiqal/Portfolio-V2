'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@utils/supabase/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import {
  Building,
  Edit,
  Trash2,
  Plus,
  X,
  Loader2,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Badge } from '@components/ui/badge';
import { Company } from '@lib/supabase';
import UniversalUpload from './UniversalUpload';
import UniversalImage from './UniversalImage';

export default function CompanyEditor() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const supabase = createClient();

  const loadCompanies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company? This will remove the logo but keep existing experiences linked to it.')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') {
          toast.error('Cannot delete company. It is linked to existing experiences.');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Company deleted successfully');
      await loadCompanies();
    } catch (error: unknown) {
      console.error('Error deleting company:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete company';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (companyData: Partial<Company>) => {
    setSaving(true);

    try {
      if (editingCompany?.id) {
        // Check for duplicate name
        const duplicate = companies.find(c => 
          c.name.toLowerCase() === companyData.name?.toLowerCase().trim() && 
          c.id !== editingCompany.id
        );
        
        if (duplicate) {
          toast.error(`Company "${companyData.name?.trim()}" already exists. Please use a different name.`);
          setSaving(false);
          return;
        }

        const { error } = await supabase
          .from('companies')
          .update({
            name: companyData.name?.trim(),
            logo_url: companyData.logo_url || null,
            website_url: companyData.website_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCompany.id);

        if (error) {
          if (error.code === '23505') {
            toast.error(`Company "${companyData.name?.trim()}" already exists. Please use a different name.`);
          } else {
            throw error;
          }
          return;
        }

        toast.success('Company updated successfully');
      } else {
        // Check for duplicate name
        const duplicate = companies.find(c => 
          c.name.toLowerCase() === companyData.name?.toLowerCase().trim()
        );
        
        if (duplicate) {
          toast.error(`Company "${companyData.name?.trim()}" already exists. Please select it from the list instead.`);
          setSaving(false);
          return;
        }

        // Generate UUID upfront so logo upload works immediately
        const newId = crypto.randomUUID();
        const { error } = await supabase
          .from('companies')
          .insert([{
            id: newId,
            name: companyData.name?.trim(),
            logo_url: companyData.logo_url || null,
            website_url: companyData.website_url || null,
          }]);

        if (error) {
          if (error.code === '23505') {
            toast.error(`Company "${companyData.name?.trim()}" already exists. Please select it from the list instead.`);
          } else {
            throw error;
          }
          return;
        }

        toast.success('Company created successfully');
      }

      setShowForm(false);
      setEditingCompany(null);
      await loadCompanies();
    } catch (error: unknown) {
      console.error('Error saving company:', error);
      const message = error instanceof Error ? error.message : 'Failed to save company';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <span className="text-gray-400">Loading companies...</span>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <CompanyForm
        company={editingCompany}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingCompany(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-xl mb-2 shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <Building className="h-6 w-6" />
            companies.manage()
          </motion.div>
          <p className="text-gray-400 font-mono">
            <span className="text-blue-500">{'// '}</span>
            Manage company logos shared across all roles
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCompany(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Badge className="bg-gray-700 text-gray-300 border-gray-600">
          {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
        </Badge>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {company.logo_url ? (
                      <UniversalImage
                        src={company.logo_url}
                        alt={company.name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <Building className="w-7 h-7 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-white truncate">
                        {company.name}
                      </CardTitle>
                      {company.website_url && (
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Website
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(company)}
                        className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(company.id)}
                        disabled={saving}
                        className="bg-red-900/40 border-red-700/70 hover:bg-red-900 text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-100 mb-2">No companies found</h3>
          <p className="text-gray-400 mb-6">
            {filter ? 'Try adjusting your search.' : 'Add your first company to get started.'}
          </p>
        </div>
      )}
    </motion.div>
  );
}

interface CompanyFormProps {
  company: Company | null;
  onSave: (company: Partial<Company>) => void;
  onCancel: () => void;
  saving: boolean;
}

function CompanyForm({ company, onSave, onCancel, saving }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    logo_url: company?.logo_url || '',
    website_url: company?.website_url || '',
  });

  // Generate ID upfront for new companies so logo upload works immediately
  const companyId = company?.id || crypto.randomUUID();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gray-800 border-gray-700 shadow-xl max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <Building className="h-6 w-6 text-blue-500" />
                {company?.id ? 'Edit Company' : 'Add New Company'}
              </CardTitle>
              <p className="text-gray-400 mt-1 text-sm">
                {company?.id 
                  ? 'Update company details and logo' 
                  : 'Create company and upload logo'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onCancel}
              className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-sm text-gray-300">Company Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Google, Microsoft"
                required
                className="mt-1 bg-gray-700 border-gray-600 text-white"
                autoFocus
              />
            </div>

            <div>
              <Label className="text-sm text-gray-300">Website URL</Label>
              <Input
                value={formData.website_url}
                onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://example.com"
                type="url"
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-300">Company Logo</Label>
              <p className="text-xs text-gray-500 mb-2">Upload an image or paste a URL</p>
              <UniversalUpload
                uploadType="company_logo"
                entityId={companyId}
                value={formData.logo_url}
                onChange={(url: string) => setFormData(prev => ({ ...prev, logo_url: url }))}
                enableCrop={true}
                cropAspect={1}
                allowUrlInput={true}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-gray-700 border-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || isEmpty(formData.name.trim())}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {company?.id ? 'Save Changes' : 'Create Company'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}


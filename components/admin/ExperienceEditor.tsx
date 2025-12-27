'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@utils/supabase/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { isEmpty } from 'lodash';
import CompanySelector from './CompanySelector';
import UniversalImage from './UniversalImage';
import { Company } from '@lib/supabase';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Building,
  MapPin,
  Loader2,
  Briefcase,
  Calendar,
  Code2,
  ChevronRight,
  Award,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Switch } from '@components/ui/switch';
import { Badge } from '@components/ui/badge';
import { Textarea } from '@components/ui/textarea';

interface ExperienceData {
  id?: string;
  company_id: string;
  position: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  // Joined from companies table
  companies?: Company;
}

const initialExperienceData: ExperienceData = {
  company_id: '',
  position: '',
  start_date: '',
  end_date: '',
  is_current: false,
  location: '',
  description: '',
  responsibilities: [],
  technologies: [],
  achievements: [],
};

export default function ExperienceEditor() {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const supabase = createClient();

  const loadExperiences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*, companies(*)')
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error loading experiences:', error);
        toast.error('Failed to load experiences');
        return;
      }

      // Normalize the data to ensure all fields have proper types
      const normalizedExperiences = (data || []).map(experience => ({
        id: experience.id,
        company_id: experience.company_id || '',
        position: experience.position || '',
        start_date: experience.start_date || '',
        end_date: experience.end_date || '',
        location: experience.location || '',
        description: experience.description || '',
        responsibilities: Array.isArray(experience.responsibilities) ? experience.responsibilities : [],
        technologies: Array.isArray(experience.technologies) ? experience.technologies : [],
        achievements: Array.isArray(experience.achievements) ? experience.achievements : [],
        is_current: Boolean(experience.is_current),
        companies: experience.companies || undefined,
      }));

      setExperiences(normalizedExperiences);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred while loading experiences');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadExperiences();
  }, [loadExperiences]);

  const handleEdit = (experience: ExperienceData) => {
    setEditingExperience(experience);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting experience:', error);
        toast.error('Failed to delete experience');
        return;
      }

      toast.success('Experience deleted successfully');
      await loadExperiences();
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred while deleting experience');
    } finally {
      setSaving(false);
    }
  };

  const prepareDbData = (data: ExperienceData, forUpdate = false) => {
    const clean = (val?: string | null) => (isEmpty(val?.trim()) ? null : val);

    const dbData = {
      company_id: data.company_id,
      position: data.position,
      start_date: data.start_date,
      end_date: data.is_current ? null : clean(data.end_date),
      is_current: data.is_current,
      location: clean(data.location),
      description: clean(data.description),
      responsibilities: data.responsibilities,
      technologies: data.technologies,
      achievements: data.achievements,
      ...(forUpdate && { updated_at: new Date().toISOString() }),
    };

    // For inserts: omit nulls so Postgres defaults/NULLs apply cleanly.
    // For updates: keep nulls so you can clear fields (e.g. end_date when switching to "current").
    return forUpdate
      ? dbData
      : Object.fromEntries(Object.entries(dbData).filter(([, v]) => v !== null));
  };

  const handleSave = async (experienceData: ExperienceData) => {
    setSaving(true);

    try {
      const isUpdate = !!editingExperience?.id;
      const dbData = prepareDbData(experienceData, isUpdate);

      const { error } = isUpdate
        ? await supabase
            .from('experience')
            .update(dbData)
            .eq('id', editingExperience.id)
        : await supabase
            .from('experience')
            .insert([dbData]);

      if (error) {
        console.error(`Error ${isUpdate ? 'updating' : 'creating'} experience:`, error);
        toast.error(`Failed to ${isUpdate ? 'update' : 'create'} experience: ${error.message}`);
        return;
      }

      toast.success(`Experience ${isUpdate ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingExperience(null);
      await loadExperiences();
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred while saving experience');
    } finally {
      setSaving(false);
    }
  };

  const filteredExperiences = experiences.filter((experience) => {
    const needle = filter.toLowerCase();
    const companyName = experience.companies?.name || '';
    return (
      companyName.toLowerCase().includes(needle) ||
      experience.position.toLowerCase().includes(needle) ||
      experience.location.toLowerCase().includes(needle)
    );
  });

  const formatDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatDateRange = (startDate: string, endDate: string, isCurrent: boolean) => {
    const start = formatDate(startDate);
    const end = isCurrent ? 'Present' : formatDate(endDate);
    if (start && end) return `${start} - ${end}`;
    if (start) return `${start} - ${isCurrent ? 'Present' : 'N/A'}`;
    return 'Dates not set';
  };

  type ExperienceGroup = {
    company: string;
    logo?: string;
    location?: string;
    roles: ExperienceData[];
    totalYears: number;
  };

  const groupedExperiences = useMemo<ExperienceGroup[]>(() => {
    const grouped = filteredExperiences.reduce<Record<string, ExperienceData[]>>((acc, item) => {
      const key = item.companies?.name?.trim() || 'Untitled Company';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const msInYear = 1000 * 60 * 60 * 24 * 365;

    return Object.entries(grouped)
      .map(([company, roles]) => {
        const sortedRoles = [...roles].sort((a, b) => {
          const aDate = new Date(a.start_date || a.end_date || '').getTime();
          const bDate = new Date(b.start_date || b.end_date || '').getTime();
          return bDate - aDate;
        });

        const totalYears = sortedRoles.reduce((sum, role) => {
          if (!role.start_date) return sum;
          const start = new Date(role.start_date);
          const end = role.is_current || !role.end_date ? new Date() : new Date(role.end_date);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return sum;
          }
          return sum + Math.max(0, (end.getTime() - start.getTime()) / msInYear);
        }, 0);

        const primary = sortedRoles[0];
        return {
          company,
          logo: primary?.companies?.logo_url || sortedRoles.find((role) => role.companies?.logo_url)?.companies?.logo_url,
          location: primary?.location || sortedRoles.find((role) => role.location)?.location,
          roles: sortedRoles,
          totalYears,
        };
      })
      .sort((a, b) => {
        const latestA = a.roles[0];
        const latestB = b.roles[0];
        const dateA = new Date(latestA.start_date || latestA.end_date || '').getTime();
        const dateB = new Date(latestB.start_date || latestB.end_date || '').getTime();
        return dateB - dateA;
      });
  }, [filteredExperiences]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center justify-center min-h-[400px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-medium shadow-xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Briefcase className="w-4 h-4" />
              Loading experience data...
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ExperienceForm
        experience={editingExperience || initialExperienceData}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingExperience(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <motion.div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-bold text-xl mb-2 shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <Briefcase className="h-6 w-6 text-white" />
            experience.manage()
          </motion.div>
          <p className="text-gray-400 font-mono">
            <span className="text-blue-500">{'// '}</span>
            Manage your professional work experience and career history.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => {
              setEditingExperience(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Experience
          </Button>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by company, position, or location..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white"
          />
        </div>
        <Badge className="bg-gray-700 text-gray-300 border-gray-600">
          {filteredExperiences.length} experience{filteredExperiences.length !== 1 ? 's' : ''} found
        </Badge>
      </motion.div>

      {/* Experience Overview */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {groupedExperiences.map((group, index) => (
          <motion.div
            key={group.company + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden bg-gray-800 border-gray-700">
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {group.logo ? (
                      <UniversalImage
                        src={group.logo}
                        alt={`${group.company} logo`}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-xl object-cover border border-blue-500/40 shadow-lg shadow-blue-900/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-xl font-bold text-white">{group.company}</CardTitle>
                      {group.location && (
                        <p className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                          <MapPin className="w-4 h-4" />
                          {group.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                      {group.roles.length} role{group.roles.length !== 1 ? 's' : ''}
                    </Badge>
                    {group.totalYears > 0 && (
                      <p className="text-xs text-gray-400 mt-2">≈ {group.totalYears.toFixed(1)} yrs total</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                {group.roles.map((role, roleIndex) => (
                  <div
                    key={role.id || roleIndex}
                    className="rounded-lg border border-gray-700 bg-gray-750 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-white">{role.position}</h4>
                          {role.is_current && (
                            <Badge className="bg-green-900/50 text-green-300 border-green-700 pointer-events-none">Current</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-2">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDateRange(role.start_date, role.end_date, role.is_current)}
                          </span>
                          {role.location && (
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {role.location}
                            </span>
                          )}
                          {role.technologies.length > 0 && (
                            <span className="flex items-center gap-2">
                              <Code2 className="w-4 h-4" />
                              {role.technologies.length} skill{role.technologies.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(role)}
                          className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(role.id!)}
                          disabled={saving}
                          className="bg-red-900/40 border-red-700/70 hover:bg-red-900 text-red-300 hover:text-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {role.description && (
                      <p className="text-sm text-gray-300 mt-3 leading-relaxed">{role.description}</p>
                    )}

                    {role.responsibilities.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                          Key Contributions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {role.responsibilities.slice(0, 4).map((item, respIndex) => (
                            <Badge key={respIndex} className="bg-gray-800 text-gray-200 border-gray-700 pointer-events-none">
                              {item}
                            </Badge>
                          ))}
                          {role.responsibilities.length > 4 && (
                            <Badge className="bg-gray-700 text-gray-300 border-gray-600 pointer-events-none">
                              +{role.responsibilities.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {role.technologies.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                          Tech Stack
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {role.technologies.slice(0, 5).map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="bg-gray-800 text-gray-200 border-gray-700 pointer-events-none">
                              {tech}
                            </Badge>
                          ))}
                          {role.technologies.length > 5 && (
                            <Badge className="bg-gray-700 text-gray-300 border-gray-600 pointer-events-none">
                              +{role.technologies.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {/* Empty State */}
      {filteredExperiences.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700"
          >
            <Briefcase className="w-12 h-12 text-blue-500" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            No experience found
          </h3>
          <p className="text-gray-400 mb-6">
            {filter ? 'Try adjusting your search filters.' : 'Get started by adding your first work experience.'}
          </p>
          {!filter && (
            <Button
              onClick={() => {
                setEditingExperience(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Experience
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============= EXPERIENCE FORM COMPONENT =============

interface ExperienceFormProps {
  experience: ExperienceData;
  onSave: (experience: ExperienceData) => void;
  onCancel: () => void;
  saving: boolean;
}

function ExperienceForm({ experience, onSave, onCancel, saving }: ExperienceFormProps) {
  const normalizeExperienceData = (data: ExperienceData): ExperienceData => {
    return {
      ...data,
      company_id: data.company_id || data.companies?.id || '',
      position: data.position || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      location: data.location || '',
      description: data.description || '',
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      achievements: Array.isArray(data.achievements) ? data.achievements : [],
      is_current: Boolean(data.is_current),
      companies: data.companies,
    };
  };

  const [formData, setFormData] = useState<ExperienceData>(normalizeExperienceData(experience));
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    experience.companies || null
  );
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newTechnology, setNewTechnology] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const handleInputChange = (field: keyof ExperienceData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (company: Company | null) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      company_id: company?.id || '',
      companies: company || undefined,
    }));
  };

  const handleAddToArray = (field: 'responsibilities' | 'technologies' | 'achievements', value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const handleRemoveFromArray = (field: 'responsibilities' | 'technologies' | 'achievements', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Briefcase className="h-6 w-6 text-white" />
                </motion.div>
                <span className="text-white">
                  {experience.id ? 'Edit Experience' : 'Add New Experience'}
                </span>
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                {experience.id ? 'Update work experience details' : 'Add a new professional experience'}
              </CardDescription>
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Selection */}
            <CompanySelector
              value={selectedCompany}
              onChange={handleCompanyChange}
            />

            {/* Basic Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">
                  Position/Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="e.g., Senior Full Stack Developer"
                  required
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">
                  Location
                </Label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>

            </div>

            {/* Date Range & Current Position */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-300">
                    End Date {formData.is_current && <span className="text-gray-500">(Present)</span>}
                  </Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    disabled={formData.is_current}
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Current Position Toggle */}
              <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                <Switch
                  checked={formData.is_current}
                  onCheckedChange={(checked) => {
                    handleInputChange('is_current', checked);
                    if (checked) {
                      handleInputChange('end_date', '');
                    }
                  }}
                />
                <span className="text-sm text-gray-300">
                  I currently work here
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Job Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief overview of your role and responsibilities..."
                className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white rounded-md px-3 py-2 min-h-[100px]"
              />
            </div>

            {/* Technologies */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-300">
                Technologies & Skills
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="e.g., React, Node.js, PostgreSQL"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('technologies', newTechnology, setNewTechnology))}
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddToArray('technologies', newTechnology, setNewTechnology)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.technologies.map((tech, index) => (
                    <Badge
                      key={index}
                      className="bg-gray-700 text-gray-300 border-gray-600 cursor-pointer hover:bg-red-900/50"
                      onClick={() => handleRemoveFromArray('technologies', index)}
                    >
                      {tech} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-300">
                Key Responsibilities
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    placeholder="e.g., Led a team of 5 developers..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('responsibilities', newResponsibility, setNewResponsibility))}
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddToArray('responsibilities', newResponsibility, setNewResponsibility)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.responsibilities.map((responsibility, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-300 flex-1">{responsibility}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromArray('responsibilities', index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-900/50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-gray-300">
                Key Achievements
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="e.g., Increased system performance by 40%..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('achievements', newAchievement, setNewAchievement))}
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddToArray('achievements', newAchievement, setNewAchievement)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <Award className="w-4 h-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm text-gray-300 flex-1">{achievement}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromArray('achievements', index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-900/50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !selectedCompany || !formData.position || !formData.start_date}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {experience.id ? 'Update Experience' : 'Create Experience'}
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

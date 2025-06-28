'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import UniversalUpload from './UniversalUpload';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Building,
  MapPin,
  Loader2,
  Check,
  AlertCircle,
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
import {
} from '@components/ui/select';

interface ExperienceData {
  id?: string;
  company: string;
  position: string;
  company_logo_url: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  sort_order: number;
}

const initialExperienceData: ExperienceData = {
  company: '',
  position: '',
  company_logo_url: '',
  start_date: '',
  end_date: '',
  is_current: false,
  location: '',
  description: '',
  responsibilities: [],
  technologies: [],
  achievements: [],
  sort_order: 0,
};

export default function ExperienceEditor() {
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [filter, setFilter] = useState<string>('');
  const supabase = createClient();

  const loadExperiences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading experiences:', error);
        setMessage({ type: 'error', text: 'Error loading experiences' });
        return;
      }

      // Normalize the data to ensure all fields have proper types
      const normalizedExperiences = (data || []).map(experience => ({
        ...experience,
        company: experience.company || '',
        position: experience.position || '',
        company_logo_url: experience.company_logo_url || '',
        start_date: experience.start_date || '',
        end_date: experience.end_date || '',
        location: experience.location || '',
        description: experience.description || '',
        responsibilities: Array.isArray(experience.responsibilities) ? experience.responsibilities : [],
        technologies: Array.isArray(experience.technologies) ? experience.technologies : [],
        achievements: Array.isArray(experience.achievements) ? experience.achievements : [],
        is_current: Boolean(experience.is_current),
        sort_order: experience.sort_order || 0,
      }));

      setExperiences(normalizedExperiences);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error loading experiences' });
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
        setMessage({ type: 'error', text: 'Error deleting experience' });
        return;
      }

      setMessage({ type: 'success', text: 'Experience deleted successfully!' });
      await loadExperiences();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error deleting experience' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (experienceData: ExperienceData) => {
    setSaving(true);
    setMessage(null);

    try {
      if (editingExperience?.id) {
        // Update existing experience
        const { error } = await supabase
          .from('experience')
          .update({
            ...experienceData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingExperience.id);

        if (error) {
          console.error('Error updating experience:', error);
          setMessage({ type: 'error', text: 'Error updating experience' });
          return;
        }

        setMessage({ type: 'success', text: 'Experience updated successfully!' });
      } else {
        // Create new experience
        const { error } = await supabase
          .from('experience')
          .insert([experienceData]);

        if (error) {
          console.error('Error creating experience:', error);
          setMessage({ type: 'error', text: 'Error creating experience' });
          return;
        }

        setMessage({ type: 'success', text: 'Experience created successfully!' });
      }

      setShowForm(false);
      setEditingExperience(null);
      await loadExperiences();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error saving experience' });
    } finally {
      setSaving(false);
    }
  };

  const filteredExperiences = experiences.filter(experience => {
    return experience.company.toLowerCase().includes(filter.toLowerCase()) ||
      experience.position.toLowerCase().includes(filter.toLowerCase()) ||
      experience.location.toLowerCase().includes(filter.toLowerCase());
  });

  const formatDateRange = (startDate: string, endDate: string, isCurrent: boolean) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const end = isCurrent ? 'Present' : new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  };

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

      {/* Success/Error Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`p-4 rounded-lg border ${message.type === 'success'
                ? 'bg-green-900/50 border-green-700 text-green-300'
                : 'bg-red-900/50 border-red-700 text-red-300'
              }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex-1 max-w-md">
          <Label className="text-sm font-medium text-white mb-2">Search Experience</Label>
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

      {/* Experience Timeline */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {filteredExperiences.map((experience, index) => (
          <motion.div
            key={experience.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gray-800 border-gray-700 hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25">
              {/* Current Badge */}
              {experience.is_current && (
                <motion.div
                  className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Current Position
                </motion.div>
              )}

              {/* Gradient Background */}
              

              <CardContent className="relative z-10 p-6">
                <div className="flex items-start space-x-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {experience.company_logo_url ? (
                      <Image
                        src={experience.company_logo_url}
                        alt={`${experience.company} logo`}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover border-2 border-gray-700 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center shadow-md">
                        <Building className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Experience Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-100 mb-1">
                          {experience.position}
                        </h3>
                        <p className="text-lg font-semibold text-blue-600 mb-2">
                          {experience.company}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateRange(experience.start_date, experience.end_date, experience.is_current)}
                          </div>
                          {experience.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {experience.location}
                            </div>
                          )}
                        </div>

                        {experience.description && (
                          <p className="text-gray-400 mb-4 leading-relaxed">
                            {experience.description}
                          </p>
                        )}

                        {/* Technologies */}
                        {experience.technologies.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Technologies</h4>
                            <div className="flex flex-wrap gap-2">
                              {experience.technologies.map((tech, techIndex) => (
                                <Badge
                                  key={techIndex}
                                  className="bg-gray-700 text-gray-300 border-gray-600"
                                >
                                  <Code2 className="w-3 h-3 mr-1" />
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Responsibilities */}
                        {experience.responsibilities.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Responsibilities</h4>
                            <ul className="space-y-1">
                              {experience.responsibilities.slice(0, 3).map((responsibility, respIndex) => (
                                <li key={respIndex} className="text-sm text-gray-400 flex items-start gap-2">
                                  <ChevronRight className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                  {responsibility}
                                </li>
                              ))}
                              {experience.responsibilities.length > 3 && (
                                <li className="text-sm text-blue-500">
                                  +{experience.responsibilities.length - 3} more responsibilities
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Achievements */}
                        {experience.achievements.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Achievements</h4>
                            <ul className="space-y-1">
                              {experience.achievements.slice(0, 2).map((achievement, achIndex) => (
                                <li key={achIndex} className="text-sm text-gray-400 flex items-start gap-2">
                                  <Award className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                                  {achievement}
                                </li>
                              ))}
                              {experience.achievements.length > 2 && (
                                <li className="text-sm text-green-500">
                                  +{experience.achievements.length - 2} more achievements
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(experience)}
                          className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(experience.id!)}
                          disabled={saving}
                          className="bg-red-900/50 border-red-700 hover:bg-red-900 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
      company: data.company || '',
      position: data.position || '',
      company_logo_url: data.company_logo_url || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      location: data.location || '',
      description: data.description || '',
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      achievements: Array.isArray(data.achievements) ? data.achievements : [],
      is_current: Boolean(data.is_current),
      sort_order: data.sort_order || 0,
    };
  };

  const [formData, setFormData] = useState<ExperienceData>(normalizeExperienceData(experience));
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newTechnology, setNewTechnology] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const handleInputChange = (field: keyof ExperienceData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            {/* Basic Information */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="e.g., Google, Microsoft, Startup Inc."
                  required
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>

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

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  disabled={formData.is_current}
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white disabled:opacity-50"
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

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">
                  Sort Order
                </Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                  className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                />
              </div>
            </div>

            {/* Current Position Toggle */}
            <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
              <Switch
                checked={formData.is_current}
                onCheckedChange={(checked) => {
                  handleInputChange('is_current', checked);
                  if (checked) {
                    handleInputChange('end_date', '');
                  }
                }}
              />
              <div>
                <span className="text-sm font-medium text-gray-300">
                  Current Position
                </span>
                <p className="text-xs text-gray-500">
                  I currently work at this position
                </p>
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

            {/* Company Logo */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Company Logo
              </Label>
              <UniversalUpload
                uploadType="company_logo"
                entityId={`experience-${experience.id || 'new'}`}
                value={formData.company_logo_url}
                onChange={(url: string) => handleInputChange('company_logo_url', url)}
                enableCrop={true}
                cropAspect={1}
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
                disabled={saving || !formData.company || !formData.position || !formData.start_date}
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
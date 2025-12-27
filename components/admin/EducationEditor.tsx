'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import UniversalUpload from './UniversalUpload';
import {
  Plus,
  Edit,
  Trash2,
  X,
  GraduationCap,
  MapPin,
  Loader2,
  Check,
  AlertCircle,
  Calendar,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Switch } from '@components/ui/switch';
import { Badge } from '@components/ui/badge';
import { Textarea } from '@components/ui/textarea';

interface EducationData {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  specialization: string;
  minor_subject: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  gpa: number;
  grade: string;
  location: string;
  description: string;
  achievements: string[];
  activities: string[];
  institution_logo_url: string;
  sort_order: number;
}

const initialEducationData: EducationData = {
  institution: '',
  degree: '',
  field_of_study: '',
  specialization: '',
  minor_subject: '',
  start_date: '',
  end_date: '',
  is_current: false,
  gpa: 0,
  grade: '',
  location: '',
  description: '',
  achievements: [],
  activities: [],
  institution_logo_url: '',
  sort_order: 0,
};

export default function EducationEditor() {
  const [educations, setEducations] = useState<EducationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEducation, setEditingEducation] = useState<EducationData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [filter, setFilter] = useState<string>('');
  const supabase = createClient();

  const loadEducations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error loading educations:', error);
        setMessage({ type: 'error', text: 'Error loading educations' });
        return;
      }

      setEducations(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error loading educations' });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadEducations();
  }, [loadEducations]);

  const handleEdit = (education: EducationData) => {
    setEditingEducation(education);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting education:', error);
        setMessage({ type: 'error', text: 'Error deleting education' });
        return;
      }

      setMessage({ type: 'success', text: 'Education deleted successfully!' });
      await loadEducations();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error deleting education' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (educationData: EducationData) => {
    setSaving(true);
    setMessage(null);

    // Prepare data for database (exclude sort_order, sorted by date instead)
    const { sort_order, id, ...dbData } = educationData;

    try {
      if (editingEducation?.id) {
        // Update existing education
        const { error } = await supabase
          .from('education')
          .update({
            ...dbData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEducation.id);

        if (error) {
          console.error('Error updating education:', error);
          setMessage({ type: 'error', text: 'Error updating education' });
          return;
        }

        setMessage({ type: 'success', text: 'Education updated successfully!' });
      } else {
        // Create new education
        const { error } = await supabase
          .from('education')
          .insert([dbData]);

        if (error) {
          console.error('Error creating education:', error);
          setMessage({ type: 'error', text: 'Error creating education' });
          return;
        }

        setMessage({ type: 'success', text: 'Education created successfully!' });
      }

      setShowForm(false);
      setEditingEducation(null);
      await loadEducations();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error saving education' });
    } finally {
      setSaving(false);
    }
  };

  const filteredEducations = educations.filter(education => {
    const needle = filter.toLowerCase();
    return education.institution.toLowerCase().includes(needle) ||
      education.degree.toLowerCase().includes(needle) ||
      education.field_of_study.toLowerCase().includes(needle) ||
      education.location.toLowerCase().includes(needle);
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

  const formatGrade = (gpa: number, grade: string) => {
    if (gpa > 0 && grade) {
      return `${gpa} GPA (${grade})`;
    } else if (gpa > 0) {
      return `${gpa} GPA`;
    } else if (grade) {
      return grade;
    }
    return null;
  };

  type EducationGroup = {
    institution: string;
    logo?: string;
    location?: string;
    programs: EducationData[];
    totalYears: number;
  };

  const groupedEducations = useMemo<EducationGroup[]>(() => {
    const grouped = filteredEducations.reduce<Record<string, EducationData[]>>((acc, item) => {
      const key = item.institution?.trim() || 'Untitled Institution';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    const msInYear = 1000 * 60 * 60 * 24 * 365;

    return Object.entries(grouped)
      .map(([institution, programs]) => {
        const sortedPrograms = [...programs].sort((a, b) => {
          const aDate = new Date(a.start_date || a.end_date || '').getTime();
          const bDate = new Date(b.start_date || b.end_date || '').getTime();
          return bDate - aDate;
        });

        const totalYears = sortedPrograms.reduce((sum, program) => {
          if (!program.start_date) return sum;
          const start = new Date(program.start_date);
          const end = program.is_current || !program.end_date ? new Date() : new Date(program.end_date);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return sum;
          }
          return sum + Math.max(0, (end.getTime() - start.getTime()) / msInYear);
        }, 0);

        const primary = sortedPrograms[0];
        return {
          institution,
          logo: primary?.institution_logo_url || sortedPrograms.find((program) => program.institution_logo_url)?.institution_logo_url,
          location: primary?.location || sortedPrograms.find((program) => program.location)?.location,
          programs: sortedPrograms,
          totalYears,
        };
      })
      .sort((a, b) => {
        const latestA = a.programs[0];
        const latestB = b.programs[0];
        const dateA = new Date(latestA.start_date || latestA.end_date || '').getTime();
        const dateB = new Date(latestB.start_date || latestB.end_date || '').getTime();
        return dateB - dateA;
      });
  }, [filteredEducations]);

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
              <GraduationCap className="w-4 h-4" />
              Loading education data...
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showForm) {
    return (
      <EducationForm
        education={editingEducation || initialEducationData}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingEducation(null);
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
            <GraduationCap className="h-6 w-6 text-white" />
            education.manage()
          </motion.div>
          <p className="text-gray-600 dark:text-gray-300 font-mono">
            <span className="text-blue-500">{'// '}</span>
            Manage your educational background and academic achievements.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => {
              setEditingEducation(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Education
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
                ? 'bg-green-500/10 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                : 'bg-red-500/10 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
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
          <Input
            placeholder="Search by institution, degree, or field..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
          />
        </div>
        <Badge className="bg-gray-700 text-gray-300 border-gray-600">
          {filteredEducations.length} education{filteredEducations.length !== 1 ? 's' : ''} found
        </Badge>
      </motion.div>

      {/* Education Overview */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {groupedEducations.map((group, index) => (
          <motion.div
            key={group.institution + index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden bg-gray-800 border-gray-700">
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {group.logo ? (
                      <Image
                        src={group.logo}
                        alt={`${group.institution} logo`}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-xl object-cover border border-sky-500/40 shadow-lg shadow-sky-900/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-700 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-xl font-bold text-white">{group.institution}</CardTitle>
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
                      {group.programs.length} program{group.programs.length !== 1 ? 's' : ''}
                    </Badge>
                    {group.totalYears > 0 && (
                      <p className="text-xs text-gray-400 mt-2">≈ {group.totalYears.toFixed(1)} yrs total</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                {group.programs.map((program, programIndex) => (
                  <div
                    key={program.id || programIndex}
                    className="rounded-lg border border-gray-700 bg-gray-750 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h4 className="text-lg font-semibold text-white">{program.degree}</h4>
                          {program.is_current && (
                            <Badge className="bg-green-900/50 text-green-300 border-green-700 pointer-events-none">In Progress</Badge>
                          )}
                          {formatGrade(program.gpa, program.grade) && (
                            <Badge className="bg-gray-700 text-gray-300 border-gray-600 pointer-events-none">
                              {formatGrade(program.gpa, program.grade)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          {program.field_of_study}
                          {program.specialization && (
                            <span> • {program.specialization}</span>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-2">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDateRange(program.start_date, program.end_date, program.is_current)}
                          </span>
                          {program.location && (
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {program.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(program)}
                          className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(program.id!)}
                          disabled={saving}
                          className="bg-red-900/40 border-red-700/70 hover:bg-red-900 text-red-300 hover:text-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {program.description && (
                      <p className="text-sm text-gray-300 mt-3 leading-relaxed">{program.description}</p>
                    )}

                    {program.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                          Achievements
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {program.achievements.slice(0, 4).map((achievement, achievementIndex) => (
                            <Badge key={achievementIndex} className="bg-gray-800 text-gray-200 border-gray-700 pointer-events-none">
                              {achievement}
                            </Badge>
                          ))}
                          {program.achievements.length > 4 && (
                            <Badge className="bg-gray-700 text-gray-300 border-gray-600 pointer-events-none">
                              +{program.achievements.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {program.activities.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                          Activities & Societies
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {program.activities.slice(0, 5).map((activity, activityIndex) => (
                            <Badge key={activityIndex} variant="secondary" className="bg-gray-800 text-gray-200 border-gray-700 pointer-events-none">
                              {activity}
                            </Badge>
                          ))}
                          {program.activities.length > 5 && (
                            <Badge className="bg-gray-700 text-gray-300 border-gray-600 pointer-events-none">
                              +{program.activities.length - 5} more
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
      {filteredEducations.length === 0 && (
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
            <GraduationCap className="w-12 h-12 text-blue-500" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No education found
          </h3>
          <p className="text-gray-400 mb-6">
            {filter ? 'Try adjusting your search filters.' : 'Get started by adding your educational background.'}
          </p>
          {!filter && (
            <Button
              onClick={() => {
                setEditingEducation(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Education
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============= EDUCATION FORM COMPONENT =============

interface EducationFormProps {
  education: EducationData;
  onSave: (education: EducationData) => void;
  onCancel: () => void;
  saving: boolean;
}

function EducationForm({ education, onSave, onCancel, saving }: EducationFormProps) {
  const [formData, setFormData] = useState<EducationData>(education);
  const [newAchievement, setNewAchievement] = useState('');
  const [newActivity, setNewActivity] = useState('');

  const handleInputChange = (field: keyof EducationData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddToArray = (field: 'achievements' | 'activities', value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const handleRemoveFromArray = (field: 'achievements' | 'activities', index: number) => {
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
              <CardTitle className="flex items-center gap-3 text-2xl">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <GraduationCap className="h-6 w-6 text-white" />
                </motion.div>
                <span className="text-white">
                  {education.id ? 'Edit Education' : 'Add New Education'}
                </span>
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                {education.id ? 'Update educational background details' : 'Add a new educational achievement'}
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
                <Label className="text-sm font-medium text-white">
                  Institution <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.institution}
                  onChange={(e) => handleInputChange('institution', e.target.value)}
                  placeholder="e.g., Stanford University, MIT"
                  required
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Degree <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.degree}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  placeholder="e.g., Bachelor of Science, Master of Arts"
                  required
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Field of Study
                </Label>
                <Input
                  value={formData.field_of_study}
                  onChange={(e) => handleInputChange('field_of_study', e.target.value)}
                  placeholder="e.g., Computer Science, Business Administration"
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Specialization
                </Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  placeholder="e.g., Machine Learning, Finance"
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Minor Subject
                </Label>
                <Input
                  value={formData.minor_subject}
                  onChange={(e) => handleInputChange('minor_subject', e.target.value)}
                  placeholder="e.g., Mathematics, Psychology"
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Location
                </Label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Stanford, CA"
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  GPA
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa || ''}
                  onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 3.85"
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Grade/Class
                </Label>
                <Input
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  placeholder="e.g., Magna Cum Laude, First Class"
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                />
              </div>

            </div>

            {/* Date Range & Current Studies */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    required
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white">
                    End Date {formData.is_current && <span className="text-gray-500">(Present)</span>}
                  </Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    disabled={formData.is_current}
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Current Studies Toggle */}
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
                  I am currently studying here
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your studies, focus areas, or notable coursework..."
                className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white min-h-[100px]"
              />
            </div>

            {/* Institution Logo */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">
                Institution Logo
              </Label>
              <UniversalUpload
                uploadType="institution_logo"
                // Use the raw education ID; for new records we pass an empty string
                // so the file can upload without attempting a DB row update.
                entityId={education.id || ''}
                value={formData.institution_logo_url}
                onChange={(url: string) => handleInputChange('institution_logo_url', url)}
                enableCrop={true}
                cropAspect={1}
              />
            </div>

            {/* Achievements */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-white">
                Academic Achievements
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="e.g., Dean's List, Summa Cum Laude, Research Award"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('achievements', newAchievement, setNewAchievement))}
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddToArray('achievements', newAchievement, setNewAchievement)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
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
                      <span className="text-sm text-white flex-1">{achievement}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromArray('achievements', index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-white">
                Activities & Organizations
              </Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    placeholder="e.g., Student Government, Computer Science Club, Debate Team"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('activities', newActivity, setNewActivity))}
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddToArray('activities', newActivity, setNewActivity)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-white flex-1">{activity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromArray('activities', index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
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
                disabled={saving || !formData.institution || !formData.degree || !formData.start_date}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {education.id ? 'Update Education' : 'Create Education'}
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

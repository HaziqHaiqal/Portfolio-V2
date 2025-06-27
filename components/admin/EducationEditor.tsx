'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@utils/supabase/client';

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
  const [message, setMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadEducations();
  }, []);

  const loadEducations = async () => {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading educations:', error);
        setMessage('Error loading educations');
        return;
      }

      setEducations(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error loading educations');
    } finally {
      setLoading(false);
    }
  };

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
        setMessage('Error deleting education');
        return;
      }

      setMessage('Education deleted successfully!');
      await loadEducations();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error deleting education');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (educationData: EducationData) => {
    setSaving(true);
    setMessage('');

    try {
      if (editingEducation?.id) {
        // Update existing education
        const { error } = await supabase
          .from('education')
          .update({
            ...educationData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEducation.id);

        if (error) {
          console.error('Error updating education:', error);
          setMessage('Error updating education');
          return;
        }

        setMessage('Education updated successfully!');
      } else {
        // Create new education
        const { error } = await supabase
          .from('education')
          .insert([educationData]);

        if (error) {
          console.error('Error creating education:', error);
          setMessage('Error creating education');
          return;
        }

        setMessage('Education created successfully!');
      }

      setShowForm(false);
      setEditingEducation(null);
      await loadEducations();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving education');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading education...</p>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">Education Management</h2>
        <button
          onClick={() => {
            setEditingEducation(null);
            setShowForm(true);
          }}
          className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30"
        >
          Add New Education
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.includes('Error')
            ? 'bg-red-500/20 text-red-400 border-red-400/30'
            : 'bg-green-500/20 text-green-400 border-green-400/30'
          }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {educations.map((education) => (
          <div key={education.id} className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{education.degree}</h3>
                <p className="text-blue-400 font-medium">{education.institution}</p>
                <p className="text-gray-400 text-sm">
                  {education.field_of_study}
                  {education.specialization && ` • ${education.specialization}`}
                </p>
                <p className="text-gray-400 text-sm">
                  {education.start_date} - {education.is_current ? 'Present' : education.end_date}
                  {education.location && ` • ${education.location}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(education)}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(education.id!)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </div>

            {education.description && (
              <p className="text-gray-300 text-sm mb-3">{education.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-400 font-medium mb-1">Academic Info</p>
                {education.gpa > 0 && <p className="text-gray-400">GPA: {education.gpa}</p>}
                {education.grade && <p className="text-gray-400">Grade: {education.grade}</p>}
                {education.minor_subject && <p className="text-gray-400">Minor: {education.minor_subject}</p>}
              </div>

              <div>
                <p className="text-green-400 font-medium mb-1">Achievements ({education.achievements?.length || 0})</p>
                {education.achievements?.slice(0, 2).map((achievement, index) => (
                  <p key={index} className="text-gray-400 truncate">• {achievement}</p>
                ))}
                {(education.achievements?.length || 0) > 2 && (
                  <p className="text-gray-500">+{(education.achievements?.length || 0) - 2} more</p>
                )}
              </div>

              <div>
                <p className="text-green-400 font-medium mb-1">Activities ({education.activities?.length || 0})</p>
                {education.activities?.slice(0, 2).map((activity, index) => (
                  <p key={index} className="text-gray-400 truncate">• {activity}</p>
                ))}
                {(education.activities?.length || 0) > 2 && (
                  <p className="text-gray-500">+{(education.activities?.length || 0) - 2} more</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {educations.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No education records found. Add your first education!</p>
        </div>
      )}
    </div>
  );
}

interface EducationFormProps {
  education: EducationData;
  onSave: (education: EducationData) => void;
  onCancel: () => void;
  saving: boolean;
}

function EducationForm({ education, onSave, onCancel, saving }: EducationFormProps) {
  const [formData, setFormData] = useState<EducationData>(education);

  const handleInputChange = (field: keyof EducationData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'achievements' | 'activities', value: string) => {
    const array = value.split('\n').map(item => item.trim()).filter(item => item);
    handleInputChange(field, array);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">
          {education.id ? 'Edit Education' : 'Add New Education'}
        </h2>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors border border-gray-400/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors border border-green-400/30 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Education'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Basic Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Institution *</label>
              <input
                type="text"
                required
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Degree *</label>
              <input
                type="text"
                required
                value={formData.degree}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                placeholder="Bachelor of Science, Master of Arts, etc."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Field of Study</label>
              <input
                type="text"
                value={formData.field_of_study}
                onChange={(e) => handleInputChange('field_of_study', e.target.value)}
                placeholder="Computer Science, Engineering, etc."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                placeholder="Software Engineering, Data Science, etc."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Minor Subject</label>
              <input
                type="text"
                value={formData.minor_subject}
                onChange={(e) => handleInputChange('minor_subject', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Institution Logo URL</label>
              <input
                type="url"
                value={formData.institution_logo_url}
                onChange={(e) => handleInputChange('institution_logo_url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Academic Details
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  disabled={formData.is_current}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={(e) => {
                  handleInputChange('is_current', e.target.checked);
                  if (e.target.checked) {
                    handleInputChange('end_date', '');
                  }
                }}
                className="rounded border-gray-600 text-green-400 focus:ring-green-400"
              />
              <span className="text-green-400">Currently studying here</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.gpa || ''}
                  onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Grade</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  placeholder="A, B+, First Class, etc."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Sort Order</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your studies"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
          Additional Information
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Achievements <span className="text-gray-400">(one per line)</span>
            </label>
            <textarea
              rows={5}
              value={formData.achievements.join('\n')}
              onChange={(e) => handleArrayChange('achievements', e.target.value)}
              placeholder="Dean's List&#10;Magna Cum Laude&#10;Outstanding Student Award"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Activities <span className="text-gray-400">(one per line)</span>
            </label>
            <textarea
              rows={5}
              value={formData.activities.join('\n')}
              onChange={(e) => handleArrayChange('activities', e.target.value)}
              placeholder="Computer Science Club President&#10;Debate Team Member&#10;Volunteer Teaching Assistant"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
} 
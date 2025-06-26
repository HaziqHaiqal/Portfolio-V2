'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

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
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading experiences:', error);
        setMessage('Error loading experiences');
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
      setMessage('Error loading experiences');
    } finally {
      setLoading(false);
    }
  };

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
        setMessage('Error deleting experience');
        return;
      }

      setMessage('Experience deleted successfully!');
      await loadExperiences();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error deleting experience');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (experienceData: ExperienceData) => {
    setSaving(true);
    setMessage('');

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
          setMessage('Error updating experience');
          return;
        }

        setMessage('Experience updated successfully!');
      } else {
        // Create new experience
        const { error } = await supabase
          .from('experience')
          .insert([experienceData]);

        if (error) {
          console.error('Error creating experience:', error);
          setMessage('Error creating experience');
          return;
        }

        setMessage('Experience created successfully!');
      }

      setShowForm(false);
      setEditingExperience(null);
      await loadExperiences();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving experience');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading experiences...</p>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">Experience Management</h2>
        <button
          onClick={() => {
            setEditingExperience(null);
            setShowForm(true);
          }}
          className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30"
        >
          Add New Experience
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.includes('Error') 
            ? 'bg-red-500/20 text-red-400 border-red-400/30'
            : 'bg-green-500/20 text-green-400 border-green-400/30'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {experiences.map((experience) => (
          <div key={experience.id} className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{experience.position}</h3>
                <p className="text-blue-400 font-medium">{experience.company}</p>
                <p className="text-gray-400 text-sm">
                  {experience.start_date} - {experience.is_current ? 'Present' : experience.end_date}
                  {experience.location && ` • ${experience.location}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(experience)}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(experience.id!)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </div>

            {experience.description && (
              <p className="text-gray-300 text-sm mb-3">{experience.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-400 font-medium mb-1">Responsibilities ({experience.responsibilities?.length || 0})</p>
                {experience.responsibilities?.slice(0, 2).map((resp, index) => (
                  <p key={index} className="text-gray-400 truncate">• {resp}</p>
                ))}
                {(experience.responsibilities?.length || 0) > 2 && (
                  <p className="text-gray-500">+{(experience.responsibilities?.length || 0) - 2} more</p>
                )}
              </div>

              <div>
                <p className="text-green-400 font-medium mb-1">Technologies ({experience.technologies?.length || 0})</p>
                <div className="flex flex-wrap gap-1">
                  {experience.technologies?.slice(0, 3).map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                  {(experience.technologies?.length || 0) > 3 && (
                    <span className="text-gray-500 text-xs">+{(experience.technologies?.length || 0) - 3}</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-green-400 font-medium mb-1">Achievements ({experience.achievements?.length || 0})</p>
                {experience.achievements?.slice(0, 2).map((achievement, index) => (
                  <p key={index} className="text-gray-400 truncate">• {achievement}</p>
                ))}
                {(experience.achievements?.length || 0) > 2 && (
                  <p className="text-gray-500">+{(experience.achievements?.length || 0) - 2} more</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {experiences.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No experiences found. Add your first work experience!</p>
        </div>
      )}
    </div>
  );
}

interface ExperienceFormProps {
  experience: ExperienceData;
  onSave: (experience: ExperienceData) => void;
  onCancel: () => void;
  saving: boolean;
}

function ExperienceForm({ experience, onSave, onCancel, saving }: ExperienceFormProps) {
  // Normalize the experience data to ensure all fields have proper types
  const normalizeExperienceData = (data: ExperienceData): ExperienceData => {
    return {
      ...initialExperienceData,
      ...data,
      // Ensure all string fields are strings, not null
      company: data.company || '',
      position: data.position || '',
      company_logo_url: data.company_logo_url || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      location: data.location || '',
      description: data.description || '',
      // Ensure arrays are arrays
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      technologies: Array.isArray(data.technologies) ? data.technologies : [],
      achievements: Array.isArray(data.achievements) ? data.achievements : [],
      // Ensure boolean is boolean
      is_current: Boolean(data.is_current),
      // Ensure number is number
      sort_order: data.sort_order || 0,
    };
  };

  const [formData, setFormData] = useState<ExperienceData>(normalizeExperienceData(experience));

  const handleInputChange = (field: keyof ExperienceData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: 'responsibilities' | 'technologies' | 'achievements', value: string) => {
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
          {experience.id ? 'Edit Experience' : 'Add New Experience'}
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
            {saving ? 'Saving...' : 'Save Experience'}
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
              <label className="block text-sm font-medium text-green-400 mb-2">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Position *</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Company Logo URL</label>
              <input
                type="url"
                value={formData.company_logo_url}
                onChange={(e) => handleInputChange('company_logo_url', e.target.value)}
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
              <span className="text-green-400">This is my current position</span>
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
          </div>
        </div>

        {/* Description & Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Description & Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your role and responsibilities"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Responsibilities <span className="text-gray-400">(one per line)</span>
              </label>
              <textarea
                rows={5}
                value={formData.responsibilities.join('\n')}
                onChange={(e) => handleArrayChange('responsibilities', e.target.value)}
                placeholder={`Led a team of 5 developers\nImplemented new CI/CD pipeline\nReduced deployment time by 50%`}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Technologies <span className="text-gray-400">(one per line)</span>
              </label>
              <textarea
                rows={4}
                value={formData.technologies.join('\n')}
                onChange={(e) => handleArrayChange('technologies', e.target.value)}
                placeholder={`React\nNode.js\nPostgreSQL\nAWS`}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Achievements <span className="text-gray-400">(one per line)</span>
              </label>
              <textarea
                rows={4}
                value={formData.achievements.join('\n')}
                onChange={(e) => handleArrayChange('achievements', e.target.value)}
                placeholder={`Increased user engagement by 40%\nReduced server costs by 30%\nWon team excellence award`}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
} 
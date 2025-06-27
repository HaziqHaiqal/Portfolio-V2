'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@utils/supabase/client';

interface InterestData {
  id?: string;
  name: string;
  description: string;
  icon_emoji: string;
  category: string;
  proficiency_level: string;
  years_involved: number;
  is_featured: boolean;
  sort_order: number;
}

const initialInterestData: InterestData = {
  name: '',
  description: '',
  icon_emoji: '',
  category: '',
  proficiency_level: '',
  years_involved: 0,
  is_featured: false,
  sort_order: 0,
};

export default function InterestsEditor() {
  const [interests, setInterests] = useState<InterestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingInterest, setEditingInterest] = useState<InterestData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const loadInterests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading interests:', error);
        setMessage('Error loading interests');
        return;
      }

      setInterests(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error loading interests');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadInterests();
  }, [loadInterests]);

  const handleEdit = (interest: InterestData) => {
    setEditingInterest(interest);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interest?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('interests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting interest:', error);
        setMessage('Error deleting interest');
        return;
      }

      setMessage('Interest deleted successfully!');
      await loadInterests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error deleting interest');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (interestData: InterestData) => {
    setSaving(true);
    setMessage('');

    try {
      if (editingInterest?.id) {
        // Update existing interest
        const { error } = await supabase
          .from('interests')
          .update({
            ...interestData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingInterest.id);

        if (error) {
          console.error('Error updating interest:', error);
          setMessage('Error updating interest');
          return;
        }

        setMessage('Interest updated successfully!');
      } else {
        // Create new interest
        const { error } = await supabase
          .from('interests')
          .insert([interestData]);

        if (error) {
          console.error('Error creating interest:', error);
          setMessage('Error creating interest');
          return;
        }

        setMessage('Interest created successfully!');
      }

      setShowForm(false);
      setEditingInterest(null);
      await loadInterests();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving interest');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading interests...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <InterestForm
        interest={editingInterest || initialInterestData}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingInterest(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">Interests Management</h2>
        <button
          onClick={() => {
            setEditingInterest(null);
            setShowForm(true);
          }}
          className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30"
        >
          Add New Interest
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interests.map((interest) => (
          <div key={interest.id} className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {interest.icon_emoji && (
                  <span className="text-2xl">{interest.icon_emoji}</span>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{interest.name}</h3>
                  {interest.category && (
                    <p className="text-green-400 text-sm">{interest.category}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(interest)}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(interest.id!)}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
                  disabled={saving}
                >
                  Delete
                </button>
              </div>
            </div>

            {interest.description && (
              <p className="text-gray-300 text-sm">{interest.description}</p>
            )}

            <div className="space-y-2 text-sm">
              {interest.proficiency_level && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Proficiency:</span>
                  <span className="text-white">{interest.proficiency_level}</span>
                </div>
              )}
              
              {interest.years_involved > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Years involved:</span>
                  <span className="text-white">{interest.years_involved} years</span>
                </div>
              )}

              {interest.is_featured && (
                <div className="flex justify-end">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                    Featured
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {interests.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No interests found. Add your first interest!</p>
        </div>
      )}
    </div>
  );
}

interface InterestFormProps {
  interest: InterestData;
  onSave: (interest: InterestData) => void;
  onCancel: () => void;
  saving: boolean;
}

function InterestForm({ interest, onSave, onCancel, saving }: InterestFormProps) {
  const [formData, setFormData] = useState<InterestData>(interest);

  const handleInputChange = (field: keyof InterestData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">
          {interest.id ? 'Edit Interest' : 'Add New Interest'}
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
            {saving ? 'Saving...' : 'Save Interest'}
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
              <label className="block text-sm font-medium text-green-400 mb-2">Interest Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              >
                <option value="">Select a category</option>
                <option value="Creative">Creative</option>
                <option value="Sports">Sports</option>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Gaming">Gaming</option>
                <option value="Travel">Travel</option>
                <option value="Reading">Reading</option>
                <option value="Learning">Learning</option>
                <option value="Fitness">Fitness</option>
                <option value="Hobbies">Hobbies</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Icon Emoji</label>
              <input
                type="text"
                value={formData.icon_emoji}
                onChange={(e) => handleInputChange('icon_emoji', e.target.value)}
                placeholder="🎵 🎮 📚 ⚽ 🎨"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your interest"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="rounded border-gray-600 text-green-400 focus:ring-green-400"
              />
              <span className="text-green-400">Featured interest</span>
            </div>
          </div>
        </div>

        {/* Experience & Proficiency */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Experience & Proficiency
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Proficiency Level</label>
              <select
                value={formData.proficiency_level}
                onChange={(e) => handleInputChange('proficiency_level', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              >
                <option value="">Select proficiency level</option>
                <option value="Beginner">Beginner</option>
                <option value="Novice">Novice</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
                <option value="Passionate">Passionate</option>
                <option value="Enthusiast">Enthusiast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Years Involved</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.years_involved}
                onChange={(e) => handleInputChange('years_involved', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            {/* Preview */}
            <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-green-400 mb-3">Preview</h4>
              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {formData.icon_emoji && (
                      <span className="text-2xl">{formData.icon_emoji}</span>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{formData.name || 'Interest Name'}</h3>
                      {formData.category && (
                        <p className="text-green-400 text-sm">{formData.category}</p>
                      )}
                    </div>
                  </div>
                </div>

                {formData.description && (
                  <p className="text-gray-300 text-sm">{formData.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  {formData.proficiency_level && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Proficiency:</span>
                      <span className="text-white">{formData.proficiency_level}</span>
                    </div>
                  )}
                  
                  {formData.years_involved > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Years involved:</span>
                      <span className="text-white">{formData.years_involved} years</span>
                    </div>
                  )}

                  {formData.is_featured && (
                    <div className="flex justify-end">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
} 
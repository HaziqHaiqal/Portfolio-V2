'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface SkillData {
  id?: string;
  name: string;
  category: string;
  proficiency_level: number;
  proficiency_percentage: number;
  icon_emoji: string;
  color_from: string;
  color_to: string;
  years_experience: number;
  is_featured: boolean;
  sort_order: number;
}

const initialSkillData: SkillData = {
  name: '',
  category: '',
  proficiency_level: 1,
  proficiency_percentage: 50,
  icon_emoji: '',
  color_from: '',
  color_to: '',
  years_experience: 0,
  is_featured: false,
  sort_order: 0,
};

export default function SkillsEditor() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading skills:', error);
        setMessage('Error loading skills');
        return;
      }

      setSkills(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error loading skills');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (skill: SkillData) => {
    setEditingSkill(skill);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting skill:', error);
        setMessage('Error deleting skill');
        return;
      }

      setMessage('Skill deleted successfully!');
      await loadSkills();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error deleting skill');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (skillData: SkillData) => {
    setSaving(true);
    setMessage('');

    try {
      if (editingSkill?.id) {
        // Update existing skill
        const { error } = await supabase
          .from('skills')
          .update({
            ...skillData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSkill.id);

        if (error) {
          console.error('Error updating skill:', error);
          setMessage('Error updating skill');
          return;
        }

        setMessage('Skill updated successfully!');
      } else {
        // Create new skill
        const { error } = await supabase
          .from('skills')
          .insert([skillData]);

        if (error) {
          console.error('Error creating skill:', error);
          setMessage('Error creating skill');
          return;
        }

        setMessage('Skill created successfully!');
      }

      setShowForm(false);
      setEditingSkill(null);
      await loadSkills();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error saving skill');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading skills...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <SkillForm
        skill={editingSkill || initialSkillData}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditingSkill(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-400">Skills Management</h2>
        <button
          onClick={() => {
            setEditingSkill(null);
            setShowForm(true);
          }}
          className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-400/30"
        >
          Add New Skill
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {skill.icon_emoji && <span className="text-xl">{skill.icon_emoji}</span>}
                <h3 className="text-lg font-semibold text-white truncate">{skill.name}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(skill)}
                  className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(skill.id!)}
                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-xs"
                  disabled={saving}
                >
                  Del
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Category:</span>
                <span className="text-green-400">{skill.category}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Proficiency:</span>
                  <span className="text-white">{skill.proficiency_percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: `${skill.proficiency_percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Experience:</span>
                <span className="text-white">{skill.years_experience} years</span>
              </div>

              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                  Level {skill.proficiency_level}
                </span>
                {skill.is_featured && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                    Featured
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No skills found. Add your first skill!</p>
        </div>
      )}
    </div>
  );
}

interface SkillFormProps {
  skill: SkillData;
  onSave: (skill: SkillData) => void;
  onCancel: () => void;
  saving: boolean;
}

function SkillForm({ skill, onSave, onCancel, saving }: SkillFormProps) {
  const [formData, setFormData] = useState<SkillData>(skill);

  const handleInputChange = (field: keyof SkillData, value: any) => {
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
          {skill.id ? 'Edit Skill' : 'Add New Skill'}
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
            {saving ? 'Saving...' : 'Save Skill'}
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
              <label className="block text-sm font-medium text-green-400 mb-2">Skill Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              >
                <option value="">Select a category</option>
                <option value="Programming Languages">Programming Languages</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps</option>
                <option value="Mobile">Mobile</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Cloud">Cloud</option>
                <option value="Tools">Tools</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Icon Emoji</label>
              <input
                type="text"
                value={formData.icon_emoji}
                onChange={(e) => handleInputChange('icon_emoji', e.target.value)}
                placeholder="⚛️ 🔥 💻 🚀"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Color From</label>
                <input
                  type="text"
                  value={formData.color_from}
                  onChange={(e) => handleInputChange('color_from', e.target.value)}
                  placeholder="#3B82F6"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Color To</label>
                <input
                  type="text"
                  value={formData.color_to}
                  onChange={(e) => handleInputChange('color_to', e.target.value)}
                  placeholder="#8B5CF6"
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

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                className="rounded border-gray-600 text-green-400 focus:ring-green-400"
              />
              <span className="text-green-400">Featured skill</span>
            </div>
          </div>
        </div>

        {/* Proficiency */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-green-400 border-b border-green-400/30 pb-2">
            Proficiency & Experience
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Proficiency Level (1-5) *
              </label>
              <select
                required
                value={formData.proficiency_level}
                onChange={(e) => handleInputChange('proficiency_level', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              >
                <option value={1}>1 - Beginner</option>
                <option value={2}>2 - Novice</option>
                <option value={3}>3 - Intermediate</option>
                <option value={4}>4 - Advanced</option>
                <option value={5}>5 - Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Proficiency Percentage (0-100) *
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.proficiency_percentage}
                  onChange={(e) => handleInputChange('proficiency_percentage', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>0%</span>
                  <span className="text-white font-medium">{formData.proficiency_percentage}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">Years of Experience</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.years_experience}
                onChange={(e) => handleInputChange('years_experience', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
              />
            </div>

            {/* Preview */}
            <div className="mt-8 p-4 bg-gray-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-green-400 mb-3">Preview</h4>
              <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {formData.icon_emoji && <span className="text-xl">{formData.icon_emoji}</span>}
                  <h3 className="text-lg font-semibold text-white">{formData.name || 'Skill Name'}</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-green-400">{formData.category || 'Category'}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Proficiency:</span>
                      <span className="text-white">{formData.proficiency_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${formData.proficiency_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Experience:</span>
                    <span className="text-white">{formData.years_experience} years</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                      Level {formData.proficiency_level}
                    </span>
                    {formData.is_featured && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
} 
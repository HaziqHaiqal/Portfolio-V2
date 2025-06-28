'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Edit,
  Trash2,
  X,
  Star,
  StarOff,
  Zap,
  Loader2,
  Check,
  AlertCircle,
  Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Switch } from '@components/ui/switch';
import { Badge } from '@components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';

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
  color_from: '#3B82F6',
  color_to: '#8B5CF6',
  years_experience: 0,
  is_featured: false,
  sort_order: 0,
};

const skillCategories = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Tools',
  'Soft Skills',
  'Other'
];

const skillColors = [
  { name: 'Blue to Purple', from: '#3B82F6', to: '#8B5CF6' },
  { name: 'Green to Teal', from: '#10B981', to: '#14B8A6' },
  { name: 'Purple to Pink', from: '#8B5CF6', to: '#EC4899' },
  { name: 'Orange to Red', from: '#F97316', to: '#EF4444' },
  { name: 'Indigo to Purple', from: '#6366F1', to: '#A855F7' },
  { name: 'Emerald to Cyan', from: '#059669', to: '#0891B2' },
];

export default function SkillsEditor() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const supabase = createClient();

  const loadSkills = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading skills:', error);
        setMessage({ type: 'error', text: 'Error loading skills' });
        return;
      }

      setSkills(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error loading skills' });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

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
        setMessage({ type: 'error', text: 'Error deleting skill' });
        return;
      }

      setMessage({ type: 'success', text: 'Skill deleted successfully!' });
      await loadSkills();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error deleting skill' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (skillData: SkillData) => {
    setSaving(true);
    setMessage(null);

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
          setMessage({ type: 'error', text: 'Error updating skill' });
          return;
        }

        setMessage({ type: 'success', text: 'Skill updated successfully!' });
      } else {
        // Create new skill
        const { error } = await supabase
          .from('skills')
          .insert([skillData]);

        if (error) {
          console.error('Error creating skill:', error);
          setMessage({ type: 'error', text: 'Error creating skill' });
          return;
        }

        setMessage({ type: 'success', text: 'Skill created successfully!' });
      }

      setShowForm(false);
      setEditingSkill(null);
      await loadSkills();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error saving skill' });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (skill: SkillData) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({ is_featured: !skill.is_featured })
        .eq('id', skill.id);

      if (error) {
        console.error('Error toggling featured:', error);
        return;
      }

      await loadSkills();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(filter.toLowerCase()) ||
                         skill.category.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || skill.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
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
            <Zap className="w-4 h-4" />
            Loading skills data...
          </motion.div>
        </motion.div>
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
            <Zap size={24} />
            skills.manage()
          </motion.div>
          <p className="text-gray-400 font-mono">
            <span className="text-blue-500">{'// '}</span>
            Manage your technical skills and expertise levels.
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={() => {
              setEditingSkill(null);
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Skill
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
            className={`p-4 rounded-lg border ${
              message.type === 'success' 
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

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex-1">
          <Input
            placeholder="Search skills..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-700 focus:border-blue-500 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Categories</SelectItem>
              {skillCategories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Skills Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {filteredSkills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gray-800 border-gray-700 hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25">
              {/* Featured Badge */}
              {skill.is_featured && (
                <motion.div
                  className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1 rounded-full shadow-lg"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Star className="w-3 h-3" />
                </motion.div>
              )}

              {/* Gradient Background */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  background: `linear-gradient(135deg, ${skill.color_from}, ${skill.color_to})`
                }}
              />

              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {skill.icon_emoji && (
                      <span className="text-2xl">{skill.icon_emoji}</span>
                    )}
                    <div>
                      <CardTitle className="text-lg font-bold text-white">
                        {skill.name}
                      </CardTitle>
                      <Badge 
                        className="mt-1 bg-gray-700 text-gray-300 border-gray-600"
                      >
                        {skill.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                {/* Proficiency Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Proficiency</span>
                    <span className="font-medium text-white">{skill.proficiency_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${skill.color_from}, ${skill.color_to})`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.proficiency_percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Experience</span>
                  <span className="font-medium text-white">
                    {skill.years_experience} year{skill.years_experience !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeatured(skill)}
                    disabled={saving}
                    className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                  >
                    {skill.is_featured ? (
                      <StarOff className="w-3 h-3 mr-1" />
                    ) : (
                      <Star className="w-3 h-3 mr-1" />
                    )}
                    {skill.is_featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(skill)}
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(skill.id!)}
                    disabled={saving}
                    className="bg-red-900/50 border-red-700 hover:bg-red-900 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
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
            <Zap className="w-12 h-12 text-blue-500" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No skills found
          </h3>
          <p className="text-gray-400 mb-6">
            {filter || (categoryFilter && categoryFilter !== 'all') ? 'Try adjusting your search filters.' : 'Get started by adding your first skill.'}
          </p>
          {!filter && (!categoryFilter || categoryFilter === 'all') && (
            <Button 
              onClick={() => {
                setEditingSkill(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Skill
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============= SKILL FORM COMPONENT =============

interface SkillFormProps {
  skill: SkillData;
  onSave: (skill: SkillData) => void;
  onCancel: () => void;
  saving: boolean;
}

function SkillForm({ skill, onSave, onCancel, saving }: SkillFormProps) {
  const [formData, setFormData] = useState<SkillData>(skill);

  const handleInputChange = (field: keyof SkillData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                    <Zap className="h-6 w-6 text-white" />
                  </motion.div>
                  {skill.id ? 'Edit Skill' : 'Add New Skill'}
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  {skill.id ? 'Update skill information and proficiency' : 'Add a new skill to your portfolio'}
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Skill Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., React.js, Python, Design"
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {skillCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon_emoji" className="text-white">Icon Emoji</Label>
                  <Input
                    id="icon_emoji"
                    value={formData.icon_emoji}
                    onChange={(e) => handleInputChange('icon_emoji', e.target.value)}
                    placeholder="⚛️"
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_experience" className="text-white">Years of Experience</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600 focus:border-blue-500 text-white"
                  />
                </div>
              </div>

              {/* Proficiency */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="proficiency_percentage" className="text-white">
                    Proficiency Level: {formData.proficiency_percentage}%
                  </Label>
                  <input
                    id="proficiency_percentage"
                    type="range"
                    min="0"
                    max="100"
                    value={formData.proficiency_percentage}
                    onChange={(e) => handleInputChange('proficiency_percentage', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Beginner</span>
                    <span>Intermediate</span>
                    <span>Expert</span>
                  </div>
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label className="text-white">Color Scheme</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skillColors.map((color, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      onClick={() => {
                        handleInputChange('color_from', color.from);
                        handleInputChange('color_to', color.to);
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.color_from === color.from && formData.color_to === color.to
                          ? 'border-blue-500 bg-gray-700'
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className="w-full h-8 rounded"
                        style={{
                          background: `linear-gradient(135deg, ${color.from}, ${color.to})`
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-1">{color.name}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <Label htmlFor="is_featured" className="text-white font-medium">Featured Skill</Label>
                  <p className="text-sm text-gray-400">Display this skill prominently</p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {skill.id ? 'Update Skill' : 'Create Skill'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </motion.div>
  );
} 
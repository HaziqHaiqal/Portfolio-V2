'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Star,
  StarOff,
  Heart,
  Terminal,
  Sparkles,
  Loader2,
  ChevronRight,
  Award,
  TrendingUp,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Switch } from '@components/ui/switch';
import { Badge } from '@components/ui/badge';
import { Textarea } from '@components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';

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
  proficiency_level: 'Beginner',
  years_involved: 0,
  is_featured: false,
  sort_order: 0,
};

const interestCategories = [
  'Technology',
  'Sports',
  'Arts & Culture',
  'Music',
  'Travel',
  'Reading',
  'Gaming',
  'Fitness',
  'Cooking',
  'Photography',
  'Outdoor Activities',
  'Learning',
  'Community',
  'Other'
];

const proficiencyLevels = [
  'Beginner',
  'Intermediate', 
  'Advanced',
  'Expert'
];

export default function InterestsEditor() {
  const [interests, setInterests] = useState<InterestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingInterest, setEditingInterest] = useState<InterestData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const supabase = createClient();

  const loadInterests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading interests:', error);
        setMessage({ type: 'error', text: 'Error loading interests' });
        return;
      }

      setInterests(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error loading interests' });
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
        setMessage({ type: 'error', text: 'Error deleting interest' });
        return;
      }

      setMessage({ type: 'success', text: 'Interest deleted successfully!' });
      await loadInterests();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error deleting interest' });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (interestData: InterestData) => {
    setSaving(true);
    setMessage(null);

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
          setMessage({ type: 'error', text: 'Error updating interest' });
          return;
        }

        setMessage({ type: 'success', text: 'Interest updated successfully!' });
      } else {
        // Create new interest
        const { error } = await supabase
          .from('interests')
          .insert([interestData]);

        if (error) {
          console.error('Error creating interest:', error);
          setMessage({ type: 'error', text: 'Error creating interest' });
          return;
        }

        setMessage({ type: 'success', text: 'Interest created successfully!' });
      }

      setShowForm(false);
      setEditingInterest(null);
      await loadInterests();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error saving interest' });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (interest: InterestData) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('interests')
        .update({ is_featured: !interest.is_featured })
        .eq('id', interest.id);

      if (error) {
        console.error('Error updating interest:', error);
        setMessage({ type: 'error', text: 'Error updating interest' });
        return;
      }

      await loadInterests();
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error updating interest' });
    } finally {
      setSaving(false);
    }
  };

  const filteredInterests = interests.filter(interest => {
    const matchesSearch = interest.name.toLowerCase().includes(filter.toLowerCase()) ||
                         interest.description.toLowerCase().includes(filter.toLowerCase()) ||
                         interest.category.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = !categoryFilter || interest.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
              <Heart className="w-4 h-4" />
              Loading interests data...
            </motion.div>
          </div>
        </motion.div>
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
              <Heart size={24} />
              interests.manage()
            </motion.div>
            <p className="text-gray-400 font-mono">
              <span className="text-blue-500">{'// '}</span>
              Manage your personal interests and hobbies.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              onClick={() => {
                setEditingInterest(null);
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Interest
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

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4 md:grid-cols-3"
        >
          <div>
            <Label className="text-sm font-medium text-white mb-2">Search Interests</Label>
            <Input
              placeholder="Search by name, description, or category..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-white mb-2">Filter by Category</Label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-700 focus:border-blue-500 rounded-md px-3 py-2 text-white"
            >
              <option value="">All Categories</option>
              {interestCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              {filteredInterests.length} interest{filteredInterests.length !== 1 ? 's' : ''} found
            </Badge>
          </div>
        </motion.div>

        {/* Interests Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {filteredInterests.map((interest, index) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-gray-800 border-gray-700 hover:border-blue-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25">
                {/* Featured Badge */}
                {interest.is_featured && (
                  <motion.div
                    className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1 rounded-full shadow-lg"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Star className="w-3 h-3" />
                  </motion.div>
                )}

                {/* Gradient Background */}
                <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500" />

                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {interest.icon_emoji && (
                        <span className="text-2xl">{interest.icon_emoji}</span>
                      )}
                      <div>
                        <CardTitle className="text-lg font-bold text-white">
                          {interest.name}
                        </CardTitle>
                        <Badge 
                          className="mt-1 bg-gray-700 text-gray-300 border-gray-600"
                        >
                          {interest.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-4">
                  {/* Description */}
                  {interest.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {interest.description}
                    </p>
                  )}

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Proficiency</span>
                      <Badge 
                        variant="outline"
                        className={`${
                          interest.proficiency_level === 'Expert' ? 'border-green-300 text-green-600' :
                          interest.proficiency_level === 'Advanced' ? 'border-blue-300 text-blue-600' :
                          interest.proficiency_level === 'Intermediate' ? 'border-yellow-300 text-yellow-600' :
                          'border-gray-300 text-gray-600'
                        }`}
                      >
                        {interest.proficiency_level}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Experience</span>
                      <span className="font-medium text-white">
                        {interest.years_involved} year{interest.years_involved !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(interest)}
                      disabled={saving}
                      className="flex-1 bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                    >
                      {interest.is_featured ? (
                        <StarOff className="w-3 h-3 mr-1" />
                      ) : (
                        <Star className="w-3 h-3 mr-1" />
                      )}
                      {interest.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(interest)}
                      className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(interest.id!)}
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
        {filteredInterests.length === 0 && (
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
              <Heart className="w-12 h-12 text-purple-500" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No interests found
            </h3>
            <p className="text-gray-400 mb-6">
              {filter || categoryFilter ? 'Try adjusting your search filters.' : 'Get started by adding your first interest.'}
            </p>
            {!filter && !categoryFilter && (
              <Button 
                onClick={() => {
                  setEditingInterest(null);
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Interest
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
  );
}

// ============= INTEREST FORM COMPONENT =============

interface InterestFormProps {
  interest: InterestData;
  onSave: (interest: InterestData) => void;
  onCancel: () => void;
  saving: boolean;
}

function InterestForm({ interest, onSave, onCancel, saving }: InterestFormProps) {
  const [formData, setFormData] = useState<InterestData>(interest);

  const handleInputChange = (field: keyof InterestData, value: string | number | boolean) => {
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
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Heart className="h-6 w-6 text-white" />
                  </motion.div>
                  <span className="text-white">
                    {interest.id ? 'Edit Interest' : 'Add New Interest'}
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  {interest.id ? 'Update interest details and information' : 'Add a new interest to your profile'}
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
                    Interest Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Photography, Hiking, Music"
                    required
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                    required
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {interestCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">
                    Icon Emoji
                  </Label>
                  <Input
                    value={formData.icon_emoji}
                    onChange={(e) => handleInputChange('icon_emoji', e.target.value)}
                    placeholder="📸 🎵 🏔️"
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-white">
                    Years Involved
                  </Label>
                  <Input
                    type="number"
                    value={formData.years_involved}
                    onChange={(e) => handleInputChange('years_involved', parseInt(e.target.value) || 0)}
                    min={0}
                    className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white"
                  />
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
                  placeholder="Describe your interest and what you enjoy about it..."
                  className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white min-h-[100px]"
                />
              </div>

              {/* Proficiency */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-white">
                  Proficiency Level
                </Label>
                <Select
                  value={formData.proficiency_level}
                  onValueChange={(value) => handleInputChange('proficiency_level', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-700 focus:border-blue-500 text-white">
                    <SelectValue placeholder="Select proficiency level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {proficiencyLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-white">
                  Settings
                </Label>
                
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                  />
                  <div>
                    <span className="text-sm font-medium text-white">
                      Featured Interest
                    </span>
                    <p className="text-xs text-gray-400">
                      Display this interest prominently on your profile
                    </p>
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
                  disabled={saving || !formData.name || !formData.category}
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
                      {interest.id ? 'Update Interest' : 'Create Interest'}
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
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Search, Folder } from 'lucide-react';
import { getCategoryInfo } from '@constants/projects';
import type { ProjectProps } from 'types/portfolio';
import ProjectCard from '@components/Card/ProjectCard';

interface ProjectsGridProps {
  projects: ProjectProps[];
  onProjectClick: (project: ProjectProps) => void;
  isDarkMode: boolean;
  showFeaturedOnly?: boolean;
}

const ITEMS_PER_PAGE = 6;

export default function ProjectsGrid({
  projects,
  onProjectClick,
  isDarkMode,
  showFeaturedOnly = false,
}: ProjectsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Generate filter categories based on existing projects
  const FILTER_CATEGORIES = useMemo(() => {
    // Get unique categories from projects
    const uniqueCategories = [...new Set(projects.map((p) => p.category))];

    // Create filter categories only for existing categories
    const existingCategories = uniqueCategories.map((categoryValue) => {
      const categoryInfo = getCategoryInfo(categoryValue);
      return {
        id: categoryInfo.value,
        label: categoryInfo.label,
        icon: categoryInfo.icon,
      };
    });

    return [{ id: 'all', label: 'All', icon: Folder }, ...existingCategories];
  }, [projects]);

  const normalizeCategory = (category: string): string => {
    const categoryInfo = getCategoryInfo(category);
    return categoryInfo.value;
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (showFeaturedOnly) {
      filtered = filtered.filter((p) => p.featured);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.languages.some((lang: string) =>
            lang.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (p) => normalizeCategory(p.category) === selectedCategory
      );
    }

    return filtered;
  }, [projects, searchTerm, selectedCategory, showFeaturedOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to first page when filters change
  useState(() => {
    setCurrentPage(1);
  });

  return (
    <div className="space-y-8">
      {/* Header with Search and Filters */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {/* Search Bar */}
        <div className="relative mx-auto max-w-md">
          <Search
            size={20}
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-2xl border-2 py-3 pl-12 pr-4 transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'border-gray-700 bg-gray-800/50 text-gray-200 placeholder-gray-400'
                : 'border-gray-300 bg-white/50 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Filter Bubbles */}
        <div className="flex flex-wrap justify-center gap-4">
          {FILTER_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-medium shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/25'
                    : isDarkMode
                      ? 'border border-gray-600/50 bg-gray-800/70 text-gray-300 hover:border-blue-400/50 hover:bg-gray-700/70'
                      : 'border border-gray-300/50 bg-white/70 text-gray-700 hover:border-blue-400/50 hover:bg-white/90'
                }`}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  boxShadow: isActive
                    ? '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
                    : isDarkMode
                      ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                      : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Icon size={18} />
                {category.label}
              </motion.button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="text-center">
          <p
            className={`font-mono text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <span className="text-blue-500">const</span> results = [
            <span className="text-green-500">{filteredProjects.length}</span>{' '}
            projects]
            {searchTerm && (
              <span className="mt-1 block">
                <span className="text-purple-500">{'// '}</span>
                filtered by &quot;{searchTerm}&quot;
              </span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${searchTerm}-${currentPage}`}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {paginatedProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project)}
              isDarkMode={isDarkMode}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="mt-12 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-10 w-10 rounded-xl font-medium transition-all duration-300 ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    : 'bg-white/50 text-gray-700 hover:bg-gray-100/50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {page}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

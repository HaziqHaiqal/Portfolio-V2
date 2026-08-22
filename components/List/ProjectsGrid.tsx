'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Search, Folder } from 'lucide-react';
import { getCategoryInfo } from '@constants/projects';
import type { ProjectProps } from 'types/portfolio';
import ProjectCard from '@components/Card/ProjectCard';

interface ProjectsGridProps {
  projects: ProjectProps[];
  showFeaturedOnly?: boolean;
}

const ITEMS_PER_PAGE = 6;

export default function ProjectsGrid({
  projects,
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
      <m.div
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
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-300 bg-white/50 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:placeholder-gray-400"
          />
        </div>

        {/* Filter Bubbles */}
        <div className="flex flex-wrap justify-center gap-4">
          {FILTER_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <m.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-medium shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/25'
                    : 'border border-gray-300/50 bg-white/70 text-gray-700 hover:border-blue-400/50 hover:bg-white/90 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] dark:border-gray-600/50 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:border-blue-400/50 dark:hover:bg-gray-700/70 dark:hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]'
                }`}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  ...(isActive
                    ? { boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)' }
                    : {}),
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Icon size={18} />
                {category.label}
              </m.button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="text-center">
          <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
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
      </m.div>

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        <m.div
          key={`${selectedCategory}-${searchTerm}-${currentPage}`}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {paginatedProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </m.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <m.div
          className="mt-12 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <m.button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-10 w-10 rounded-xl font-medium transition-all duration-300 ${
                currentPage === page
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-gray-100/50 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {page}
            </m.button>
          ))}
        </m.div>
      )}
    </div>
  );
}

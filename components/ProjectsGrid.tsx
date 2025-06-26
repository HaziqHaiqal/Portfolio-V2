"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, ExternalLink, Github, GitBranch, Calendar, Folder } from "lucide-react";
import { getCategoryInfo } from "@lib/constants";

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tech: string;
  year: string;
  status: string;
  gradient: string;
  commits: string;
  languages: string[];
  category: string;
  featured: boolean;
  images?: Array<{
    id: string;
    url: string;
    alt: string;
    caption?: string;
  }>;
  projectUrl?: string;
  githubUrl?: string;
  features?: string[];
  teamSize?: string;
  duration?: string;
  thumbnail_url?: string;
}

interface ProjectsGridProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  isDarkMode: boolean;
  showFeaturedOnly?: boolean;
}

const ITEMS_PER_PAGE = 6;

export default function ProjectsGrid({
  projects,
  onProjectClick,
  isDarkMode,
  showFeaturedOnly = false
}: ProjectsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Generate filter categories based on existing projects
  const FILTER_CATEGORIES = useMemo(() => {
    // Get unique categories from projects
    const uniqueCategories = [...new Set(projects.map(p => p.category))];

    // Create filter categories only for existing categories
    const existingCategories = uniqueCategories.map(categoryValue => {
      const categoryInfo = getCategoryInfo(categoryValue);
      return {
        id: categoryInfo.value,
        label: categoryInfo.label,
        icon: categoryInfo.icon
      };
    });

    return [
      { id: "all", label: "All", icon: Folder },
      ...existingCategories
    ];
  }, [projects]);

  const normalizeCategory = (category: string): string => {
    const categoryInfo = getCategoryInfo(category);
    return categoryInfo.value;
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (showFeaturedOnly) {
      filtered = filtered.filter(p => p.featured);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.languages.some((lang: string) => lang.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => normalizeCategory(p.category) === selectedCategory);
    }

    return filtered;
  }, [projects, searchTerm, selectedCategory, showFeaturedOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
        <div className="relative max-w-md mx-auto">
          <Search size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-500"
            }`} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${isDarkMode
              ? "bg-gray-800/50 border-gray-700 text-gray-200 placeholder-gray-400"
              : "bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500"
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
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg backdrop-blur-sm ${isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/25"
                  : isDarkMode
                    ? "bg-gray-800/70 text-gray-300 hover:bg-gray-700/70 border border-gray-600/50 hover:border-blue-400/50"
                    : "bg-white/70 text-gray-700 hover:bg-white/90 border border-gray-300/50 hover:border-blue-400/50"
                  }`}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  boxShadow: isActive
                    ? "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
                    : isDarkMode
                      ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                      : "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Icon size={18} />
                {category.label}
              </motion.button>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="text-center">
          <p className={`text-sm font-mono ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            <span className="text-blue-500">const</span> results = [
            <span className="text-green-500">{filteredProjects.length}</span> projects]
            {searchTerm && (
              <span className="block mt-1">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
          className="flex justify-center gap-2 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <motion.button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-xl font-medium transition-all duration-300 ${currentPage === page
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : isDarkMode
                  ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  : "bg-white/50 text-gray-700 hover:bg-gray-100/50"
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

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  isDarkMode: boolean;
  index: number;
}

function ProjectCard({ project, onClick, isDarkMode, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`group relative rounded-2xl cursor-pointer overflow-hidden p-0.5 bg-gradient-to-br ${isDarkMode
        ? "from-gray-800 to-gray-700"
        : "from-gray-200 to-gray-100"
        } group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Inner card content */}
      <div className={`h-full rounded-2xl p-6 relative overflow-hidden ${isDarkMode ? "bg-gray-900/90" : "bg-white/90"
        }`}>
        {project.thumbnail_url && (
          <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              layout="fill"
              objectFit="cover"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        {/* Floating elements */}
        <div className="absolute top-4 right-4 flex gap-2">
          {project.featured && (
            <motion.div
              className="w-2 h-2 bg-yellow-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <motion.div
            className={`w-2 h-2 rounded-full ${project.status === "completed" ? "bg-green-400" :
              project.status === "in-progress" ? "bg-yellow-400" : "bg-gray-400"
              }`}
            animate={isHovered ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Project content */}
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {project.title}
            </h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {project.description}
            </p>
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2">
            {project.languages.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className={`text-xs px-2 py-1 rounded-lg font-mono ${isDarkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                {tech}
              </span>
            ))}
            {project.languages.length > 3 && (
              <span className={`text-xs px-2 py-1 rounded-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                +{project.languages.length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar size={12} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{project.year}</span>
              </div>
              {project.commits && (
                <div className="flex items-center gap-1">
                  <GitBranch size={12} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>{project.commits}</span>
                </div>
              )}
            </div>

            {/* Action icons */}
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {project.githubUrl && (
                <motion.a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={12} />
                </motion.a>
              )}
              {project.projectUrl && (
                <motion.a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                </motion.a>
              )}
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
} 
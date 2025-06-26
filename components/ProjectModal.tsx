"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Github, Terminal, Zap, Star, Monitor, Heart, Share, MoreHorizontal, Code, Layers, Image as ImageIcon } from "lucide-react";
import ProjectImageGallery from '@components/ProjectImageGallery';
import { getCategoryInfo } from "@lib/constants";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id?: string;
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

    projectUrl?: string;
    githubUrl?: string;
    features?: string[];
    teamSize?: string;
    duration?: string;
  } | null,
  isDarkMode: boolean;
}

export default function ProjectModal({ isOpen, onClose, project, isDarkMode }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!project) return null;

  const categoryInfo = getCategoryInfo(project.category);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Star size={20} />, color: 'blue' },
    { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={20} />, color: 'purple' },
    { id: 'tech', label: 'Tech', icon: <Code size={20} />, color: 'green' },
    { id: 'details', label: 'Details', icon: <Layers size={20} />, color: 'orange' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center pb-4 md:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ overflow: 'hidden' }}
        >
          {/* Mobile Backdrop */}
          <motion.div
            className={`absolute inset-0 ${isDarkMode ? "bg-black/60" : "bg-black/40"} backdrop-blur-sm`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Mobile App Modal */}
          <motion.div
            className={`relative w-full max-w-md md:max-w-4xl h-[95vh] md:h-[90vh] mx-4 md:mx-0 rounded-3xl overflow-hidden shadow-2xl flex flex-col ${isDarkMode
              ? "bg-gray-900 border-t border-gray-700"
              : "bg-white border-t border-gray-200"
              }`}
            initial={{ y: "100%", scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: "100%", scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.6
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Status Bar */}
            <div className={`md:hidden px-6 py-3 flex items-center justify-between text-sm flex-shrink-0 ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-current opacity-80" />
                  <div className="w-1 h-1 rounded-full bg-current opacity-60" />
                  <div className="w-1 h-1 rounded-full bg-current opacity-40" />
                </div>
                <span className="text-xs font-medium">Portfolio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs">100%</span>
                <div className={`w-6 h-3 rounded-sm border ${isDarkMode ? "border-gray-600" : "border-gray-400"}`}>
                  <div className="w-full h-full bg-green-500 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Pull Handle */}
            <div className="md:hidden flex justify-center pt-2 pb-1 flex-shrink-0">
              <div className={`w-10 h-1 rounded-full ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
            </div>

            {/* Header */}
            <div className={`relative px-6 py-4 flex-shrink-0 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={onClose}
                    className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"} shadow-md`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={18} className={isDarkMode ? "text-gray-300" : "text-gray-700"} />
                  </motion.button>

                  <div>
                    <motion.div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isDarkMode
                        ? "bg-gray-700 text-gray-300 border border-gray-600"
                        : "bg-white text-gray-700 border border-gray-200"
                        }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <categoryInfo.icon size={12} className={`text-${categoryInfo.color}-500`} />
                      {categoryInfo.label}
                    </motion.div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Heart
                      size={18}
                      className={isLiked ? "text-red-500 fill-red-500" : isDarkMode ? "text-gray-400" : "text-gray-500"}
                    />
                  </motion.button>
                  <motion.button
                    className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share size={18} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                  </motion.button>
                  <motion.button
                    className={`p-2 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-white"} shadow-md`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MoreHorizontal size={18} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Title and Action Buttons */}
            <div className="px-6 pt-6 pb-4 flex-shrink-0 flex justify-between items-center">
              <motion.h1
                className={`text-3xl md:text-4xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {project.title}
              </motion.h1>

              {/* Action Buttons */}
              <motion.div
                className={`inline-flex items-center gap-1 p-1 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {/* Globe Button */}
                <motion.button
                  className={`flex items-center justify-center w-16 h-10 rounded-full transition-colors ${
                    project.projectUrl
                      ? isDarkMode
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : 'bg-white text-gray-800 hover:bg-gray-200'
                      : isDarkMode
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={project.projectUrl ? { scale: 1.05 } : {}}
                  whileTap={project.projectUrl ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (project.projectUrl) {
                      window.open(project.projectUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  disabled={!project.projectUrl}
                  aria-label="Visit project website"
                >
                  <Globe size={20} />
                </motion.button>

                {/* GitHub Button */}
                <motion.button
                  className={`flex items-center justify-center w-16 h-10 rounded-full transition-colors ${
                    project.githubUrl
                      ? isDarkMode
                          ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : 'bg-white text-gray-800 hover:bg-gray-200'
                      : isDarkMode
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={project.githubUrl ? { scale: 1.05 } : {}}
                  whileTap={project.githubUrl ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (project.githubUrl) {
                      window.open(project.githubUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  disabled={!project.githubUrl}
                  aria-label="View on GitHub"
                >
                  <Github size={20} />
                </motion.button>
              </motion.div>
            </div>

            {/* Tab Navigation */}
            <div className={`px-6 mb-4 flex-shrink-0 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
              <div className={`flex rounded-2xl p-1 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                      ? isDarkMode
                        ? "bg-white text-gray-900 shadow-md"
                        : "bg-white text-gray-900 shadow-md"
                      : isDarkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                    whileHover={{ scale: activeTab === tab.id ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + tabs.indexOf(tab) * 0.1 }}
                  >
                    {tab.icon}
                    <span className="hidden md:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div
              className="flex-1 overflow-y-auto px-6 pb-20 md:pb-6"
              onWheel={(e) => {
                const element = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = element;

                // Prevent scroll propagation when at boundaries
                if (
                  (e.deltaY < 0 && scrollTop === 0) ||
                  (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight)
                ) {
                  e.preventDefault();
                }
              }}
            >
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <motion.p
                      className={`text-lg leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {project.longDescription || project.description}
                    </motion.p>
                    {/* Tech Stack */}
                    <div>
                      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Technologies Used
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.languages.map((tech, index) => (
                          <motion.span
                            key={index}
                            className={`px-3 py-2 rounded-xl text-sm font-medium ${isDarkMode
                              ? "bg-gray-800 text-gray-200 border border-gray-700"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                              }`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    {project.features && project.features.length > 0 && (
                      <div>
                        <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          Key Features
                        </h3>
                        <div className="space-y-3">
                          {project.features.map((feature, index) => (
                            <motion.div
                              key={index}
                              className={`flex items-start gap-3 p-4 rounded-2xl ${isDarkMode
                                ? "bg-gray-800 border border-gray-700"
                                : "bg-gray-50 border border-gray-200"
                                }`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              whileHover={{ x: 4 }}
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                <Zap size={12} className="text-blue-600" />
                              </div>
                              <p className={`flex-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                {feature}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="space-y-6">
                    <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Project Gallery
                    </h2>

                    {project.id ? (
                      <ProjectImageGallery projectId={project.id} />
                    ) : (
                      <div className={`text-center py-16 rounded-3xl border-2 border-dashed ${isDarkMode ? "border-gray-700 text-gray-500" : "border-gray-300 text-gray-400"}`}>
                        <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No project ID available</p>
                        <p className="text-sm mt-1">Cannot load images without project ID</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tech' && (
                  <div className="space-y-6">
                    <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Technical Details
                    </h2>

                    {/* Primary Tech */}
                    <motion.div
                      className={`p-6 rounded-3xl ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <Terminal size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {project.tech}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Primary Framework
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* All Technologies */}
                    <div>
                      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Full Tech Stack
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {project.languages.map((tech, index) => (
                          <motion.div
                            key={index}
                            className={`p-4 rounded-2xl text-center border ${isDarkMode
                              ? "bg-gray-800 border-gray-700"
                              : "bg-gray-50 border-gray-200"
                              }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -2, scale: 1.02 }}
                          >
                            <p className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                              {tech}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      Project Information
                    </h2>

                    {/* Project Meta */}
                    <motion.div
                      className={`p-6 rounded-3xl ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Project Overview
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Year
                          </span>
                          <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {project.year}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Team Size
                          </span>
                          <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {project.teamSize || "Solo Project"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Duration
                          </span>
                          <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {project.duration || "Ongoing"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            Commits
                          </span>
                          <span className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {project.commits}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      className={`p-6 rounded-3xl ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        About This Project
                      </h3>
                      <p className={`leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {project.longDescription || project.description}
                      </p>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
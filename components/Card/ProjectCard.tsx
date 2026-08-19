"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Github, GitBranch, Calendar } from "lucide-react";
import type { ProjectProps } from "types/portfolio";

interface ProjectCardProps {
  project: ProjectProps;
  onClick: () => void;
  isDarkMode: boolean;
  index: number;
}

export default function ProjectCard({ project, onClick, isDarkMode, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

  const handleClick = () => {
    onClick();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
    setIsHovered(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);
    const deltaTime = Date.now() - touchStart.time;

    // Only trigger click if:
    // 1. Touch duration is reasonable (not too long)
    // 2. Movement is minimal (not scrolling)
    const maxMovement = 10; // pixels
    const maxDuration = 500; // milliseconds

    if (deltaTime < maxDuration && deltaX < maxMovement && deltaY < maxMovement) {
      e.preventDefault();
      onClick();
    }

    setTouchStart(null);
    setIsHovered(false);
  };

  const handleTouchMove = () => {
    // Reset hover state if user is scrolling
    setIsHovered(false);
  };

  return (
    <motion.div
      className={`group relative rounded-2xl cursor-pointer overflow-hidden p-0.5 bg-gradient-to-br ${isDarkMode
        ? "from-gray-800 to-gray-700"
        : "from-gray-200 to-gray-100"
        } group-hover:from-blue-500 group-hover:to-purple-600`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, delay: index * 0.1 },
      }}
      transition={{ type: "tween", duration: 0 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: { duration: 0 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* Inner card content */}
      <div className={`h-full rounded-2xl p-6 relative overflow-hidden ${isDarkMode ? "bg-gray-900/90" : "bg-white/90"
        }`}>
        {project.thumbnail_url && (
          <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              fill
              className="w-full h-full object-cover group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
              priority={index === 0}
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

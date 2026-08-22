'use client';

import { useState } from 'react';
import { m } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Github, GitBranch, Calendar } from 'lucide-react';
import type { ProjectProps } from 'types/portfolio';

interface ProjectCardProps {
  project: ProjectProps;
  onClick: () => void;
  index: number;
}

export default function ProjectCard({
  project,
  onClick,
  index,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const handleClick = () => {
    onClick();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
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

    if (
      deltaTime < maxDuration &&
      deltaX < maxMovement &&
      deltaY < maxMovement
    ) {
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
    <m.div
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-gray-200 to-gray-100 p-0.5 group-hover:from-blue-500 group-hover:to-purple-600 dark:from-gray-800 dark:to-gray-700"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.6, delay: index * 0.1 },
      }}
      transition={{ type: 'tween', duration: 0 }}
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
      <div className="relative h-full overflow-hidden rounded-2xl bg-white/90 p-6 dark:bg-gray-900/90">
        {project.thumbnail_url && (
          <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
            <Image
              src={project.thumbnail_url}
              alt={project.title}
              fill
              className="h-full w-full object-cover group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
          </div>
        )}
        {/* Floating elements */}
        <div className="absolute right-4 top-4 flex gap-2">
          {project.featured && (
            <div className="pulse-dot h-2 w-2 rounded-full bg-yellow-400" />
          )}
          <m.div
            className={`h-2 w-2 rounded-full ${
              project.status === 'completed'
                ? 'bg-green-400'
                : project.status === 'in-progress'
                  ? 'bg-yellow-400'
                  : 'bg-gray-400'
            }`}
            animate={isHovered ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Project content */}
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {project.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              {project.description}
            </p>
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2">
            {project.languages.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="rounded-lg bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {tech}
              </span>
            ))}
            {project.languages.length > 3 && (
              <span className="rounded-lg px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{project.languages.length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar
                  size={12}
                  className="text-gray-500 dark:text-gray-400"
                />
                <span className="text-gray-500 dark:text-gray-400">
                  {project.year}
                </span>
              </div>
              {project.commits && (
                <div className="flex items-center gap-1">
                  <GitBranch
                    size={12}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  <span className="text-gray-500 dark:text-gray-400">
                    {project.commits}
                  </span>
                </div>
              )}
            </div>

            {/* Action icons */}
            <div className="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {project.githubUrl && (
                <m.a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-gray-800 p-1 text-white hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={12} />
                </m.a>
              )}
              {project.projectUrl && (
                <m.a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 p-1 text-white hover:bg-blue-500"
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                </m.a>
              )}
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        <m.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </m.div>
  );
}

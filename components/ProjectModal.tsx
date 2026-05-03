"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Globe,
  Github,
  Clock,
  Calendar,
  Users,
  GitCommit,
} from "lucide-react";
import ProjectImageGallery from "@components/ProjectImageGallery";
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
    thumbnail_url?: string;
  } | null;
  isDarkMode: boolean;
}

interface ThemeTokens {
  panelBg: string;
  panelText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  divider: string;
  cardBg: string;
  cardBorder: string;
  chipBg: string;
  chipBorder: string;
  chipText: string;
  chipHoverBg: string;
  glassBg: string;
  glassBorder: string;
  glassText: string;
  primaryBtnBg: string;
  primaryBtnText: string;
  primaryBtnDisabled: string;
  secondaryBtnBg: string;
  secondaryBtnHoverBg: string;
  secondaryBtnBorder: string;
  secondaryBtnText: string;
  secondaryBtnDisabled: string;
  backdropClass: string;
  // Header gradient stops
  headerStop1: string;
  headerStop2: string;
  headerStop3: string;
  shadowOnImage: string;
}

export default function ProjectModal({
  isOpen,
  onClose,
  project,
  isDarkMode,
}: ProjectModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!project) return null;

  const categoryInfo = getCategoryInfo(project.category);
  const CategoryIcon = categoryInfo.icon;

  // Category-tinted header gradient stop
  const tintDarkMap: Record<string, string> = {
    web: "#1e3a8a",
    mobile: "#065f46",
    art: "#6b21a8",
    game: "#9f1239",
    api: "#9a3412",
    ai: "#9d174d",
    tool: "#854d0e",
    other: "#374151",
  };
  const tintLightMap: Record<string, string> = {
    web: "#dbeafe",
    mobile: "#d1fae5",
    art: "#f3e8ff",
    game: "#ffe4e6",
    api: "#ffedd5",
    ai: "#fce7f3",
    tool: "#fef3c7",
    other: "#e5e7eb",
  };
  const tint = isDarkMode
    ? tintDarkMap[categoryInfo.value] || tintDarkMap.other
    : tintLightMap[categoryInfo.value] || tintLightMap.other;

  const gray900 = "#111827";

  const T: ThemeTokens = isDarkMode
    ? {
        panelBg: "bg-gray-900",
        panelText: "text-white",
        textPrimary: "text-white",
        textSecondary: "text-white/75",
        textMuted: "text-white/55",
        textFaint: "text-white/35",
        divider: "border-white/[0.06]",
        cardBg: "bg-white/[0.04]",
        cardBorder: "border-white/10",
        chipBg: "bg-white/[0.08]",
        chipBorder: "border-white/10",
        chipText: "text-white/90",
        chipHoverBg: "hover:bg-white/[0.12]",
        glassBg: "bg-white/10",
        glassBorder: "border-white/10",
        glassText: "text-white",
        primaryBtnBg: "bg-white text-black hover:bg-white/90 shadow-lg",
        primaryBtnText: "text-black",
        primaryBtnDisabled:
          "bg-white/30 text-black/40 shadow-none cursor-not-allowed",
        secondaryBtnBg: "bg-white/[0.08]",
        secondaryBtnHoverBg: "hover:bg-white/[0.15]",
        secondaryBtnBorder: "border-white/10",
        secondaryBtnText: "text-white",
        secondaryBtnDisabled:
          "bg-white/[0.04] border-white/5 text-white/30 cursor-not-allowed",
        backdropClass: "bg-black/80 backdrop-blur-md",
        headerStop1: tint,
        headerStop2: `rgba(17, 24, 39, 0.65)`,
        headerStop3: gray900,
        shadowOnImage: "shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
      }
    : {
        panelBg: "bg-white",
        panelText: "text-gray-900",
        textPrimary: "text-gray-900",
        textSecondary: "text-gray-700",
        textMuted: "text-gray-500",
        textFaint: "text-gray-400",
        divider: "border-gray-200",
        cardBg: "bg-gray-50",
        cardBorder: "border-gray-200",
        chipBg: "bg-gray-100",
        chipBorder: "border-gray-200",
        chipText: "text-gray-700",
        chipHoverBg: "hover:bg-gray-200",
        glassBg: "bg-white/80",
        glassBorder: "border-gray-200",
        glassText: "text-gray-900",
        primaryBtnBg:
          "bg-gray-900 text-white hover:bg-gray-800 shadow-md",
        primaryBtnText: "text-white",
        primaryBtnDisabled:
          "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed",
        secondaryBtnBg: "bg-white",
        secondaryBtnHoverBg: "hover:bg-gray-50",
        secondaryBtnBorder: "border-gray-200",
        secondaryBtnText: "text-gray-900",
        secondaryBtnDisabled:
          "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed",
        backdropClass: "bg-black/40 backdrop-blur-md",
        headerStop1: tint,
        headerStop2: "rgba(255,255,255,0.5)",
        headerStop3: "#ffffff",
        shadowOnImage: "shadow-[0_20px_60px_rgba(0,0,0,0.15)]",
      };

  const meta = [
    { icon: Calendar, label: project.year },
    { icon: Users, label: project.teamSize || "Solo" },
    { icon: Clock, label: project.duration || "Ongoing" },
    ...(project.commits && project.commits !== "0"
      ? [{ icon: GitCommit, label: project.commits }]
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className={`absolute inset-0 ${T.backdropClass}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className={`relative w-full md:max-w-4xl h-[94vh] md:h-[88vh] md:mx-4 flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl ${T.panelBg}`}
            initial={{ y: "8%", opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "8%", opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient that bleeds from category color into the body */}
            <div
              className="absolute inset-x-0 top-0 h-[55%] pointer-events-none"
              style={{
                background: `linear-gradient(180deg, ${T.headerStop1} 0%, ${T.headerStop2} 55%, ${T.headerStop3} 100%)`,
              }}
            />

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-5 py-3 flex-shrink-0">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${T.glassBg} ${T.glassBorder} ${T.glassText}`}
              >
                <CategoryIcon size={12} />
                {categoryInfo.label}
              </div>
              <motion.button
                onClick={onClose}
                className={`p-2 rounded-full backdrop-blur-md border transition-colors ${T.glassBg} hover:${T.chipHoverBg} ${T.glassBorder} ${T.glassText}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Scrollable */}
            <div
              className="relative z-10 flex-1 overflow-y-auto"
              onWheel={(e) => {
                const el = e.currentTarget;
                const { scrollTop, scrollHeight, clientHeight } = el;
                if (
                  (e.deltaY < 0 && scrollTop === 0) ||
                  (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight)
                ) {
                  e.preventDefault();
                }
              }}
            >
              {/* Header: cover + title */}
              <div className="px-6 md:px-8 py-7 flex flex-col md:flex-row items-end gap-6 md:gap-8">
                <motion.div
                  className={`relative w-full sm:w-80 md:w-80 aspect-[16/10] rounded-xl overflow-hidden flex-shrink-0 ${T.shadowOnImage} ${
                    isDarkMode ? "bg-gray-950/50" : "bg-gray-100"
                  }`}
                  initial={{ y: 20, opacity: 0, scale: 0.96 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {project.thumbnail_url && (
                    <Image
                      src={project.thumbnail_url}
                      alt=""
                      fill
                      sizes="320px"
                      className={`object-cover blur-2xl scale-110 ${
                        isDarkMode ? "opacity-60" : "opacity-40"
                      }`}
                      aria-hidden
                    />
                  )}
                  {project.thumbnail_url ? (
                    <Image
                      src={project.thumbnail_url}
                      alt={project.title}
                      fill
                      sizes="320px"
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${project.gradient}`}
                    />
                  )}
                </motion.div>

                {/* Info */}
                <motion.div
                  className={`flex-1 min-w-0 ${T.textPrimary}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-3 md:mb-4 break-words">
                    {project.title}
                  </h1>
                  <p
                    className={`text-sm md:text-base mb-4 max-w-2xl leading-relaxed ${T.textSecondary}`}
                  >
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                    {meta.map((m, i) => {
                      const MIcon = m.icon;
                      return (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span
                              className={`select-none ${T.textFaint}`}
                            >
                              ·
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 ${T.textMuted}`}
                          >
                            <MIcon size={12} className={T.textFaint} />
                            {m.label}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Action bar */}
              <motion.div
                className="px-6 md:px-8 pb-6 flex flex-wrap items-center gap-3"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <ActionButton
                  href={project.projectUrl}
                  icon={<Globe size={15} />}
                  label="Live Site"
                  variant="primary"
                  T={T}
                />
                <ActionButton
                  href={project.githubUrl}
                  icon={<Github size={15} />}
                  label="Source"
                  variant="secondary"
                  T={T}
                />
              </motion.div>

              {/* Gallery */}
              {project.id && (
                <Section T={T} first>
                  <SectionTitle T={T}>Gallery</SectionTitle>
                  <div
                    className={`rounded-xl border p-3 ${T.cardBg} ${T.cardBorder}`}
                  >
                    <ProjectImageGallery projectId={project.id} compact />
                  </div>
                </Section>
              )}

              {/* About */}
              {project.longDescription && (
                <Section T={T}>
                  <SectionTitle T={T}>About</SectionTitle>
                  <p
                    className={`text-[15px] leading-relaxed max-w-3xl ${T.textSecondary}`}
                  >
                    {project.longDescription}
                  </p>
                </Section>
              )}

              {/* Highlights — simple prose list */}
              {project.features && project.features.length > 0 && (
                <Section T={T}>
                  <SectionTitle T={T}>Highlights</SectionTitle>
                  <div>
                    {project.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        className={`py-5 border-b last:border-b-0 ${T.divider}`}
                        initial={{ opacity: 0, y: 6 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.04 * i }}
                      >
                        <p
                          className={`text-[15px] leading-relaxed ${T.textPrimary}`}
                        >
                          {feature}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Built with */}
              {project.languages.length > 0 && (
                <Section T={T}>
                  <SectionTitle T={T}>Built with</SectionTitle>
                  <div className="flex flex-wrap gap-1.5">
                    {project.languages.map((tech, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${T.chipBg} ${T.chipBorder} ${T.chipText} ${T.chipHoverBg}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Footer meta */}
              <div
                className={`px-6 md:px-8 mt-10 pt-6 pb-10 border-t text-xs ${T.divider} ${T.textFaint}`}
              >
                {project.year} · {categoryInfo.label} ·{" "}
                {project.duration || "Ongoing"}
                {project.teamSize ? ` · ${project.teamSize}` : ""}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  children,
  T,
  first,
}: {
  children: React.ReactNode;
  T: ThemeTokens;
  first?: boolean;
}) {
  return (
    <section
      className={`px-6 md:px-8 ${
        first
          ? "mt-2"
          : `mt-8 pt-8 border-t ${T.divider}`
      }`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  children,
  T,
}: {
  children: React.ReactNode;
  T: ThemeTokens;
}) {
  return (
    <h2
      className={`text-base font-semibold mb-4 tracking-tight ${T.textPrimary}`}
    >
      {children}
    </h2>
  );
}

function ActionButton({
  href,
  icon,
  label,
  variant,
  T,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  variant: "primary" | "secondary";
  T: ThemeTokens;
}) {
  const enabled = Boolean(href);
  const baseClass =
    "flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-colors";
  const enabledClass =
    variant === "primary"
      ? T.primaryBtnBg
      : `${T.secondaryBtnBg} ${T.secondaryBtnHoverBg} backdrop-blur-md border ${T.secondaryBtnBorder} ${T.secondaryBtnText}`;
  const disabledClass =
    variant === "primary" ? T.primaryBtnDisabled : T.secondaryBtnDisabled;

  if (!enabled) {
    return (
      <button
        disabled
        className={`${baseClass} ${disabledClass}`}
        aria-label={`${label} (unavailable)`}
        title="Not available"
      >
        {icon}
        {label}
      </button>
    );
  }
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClass} ${enabledClass}`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      {label}
    </motion.a>
  );
}

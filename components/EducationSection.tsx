import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Calendar } from "lucide-react";
import { Education } from "@lib/supabase";
import { useTheme } from '@components/providers/ThemeProvider';

interface EducationSectionProps {
  education: Education[] | null | undefined;
}

const EducationSection = ({ education }: EducationSectionProps) => {
  const { isDarkMode } = useTheme();

  if (!education || education.length === 0) return null;

  // Sort by start_date descending (most recent first)
  const sortedEducation = [...education].sort((a, b) => 
    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <section
      id="education"
      className="py-32 px-6 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - same style as Experience */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-xl mb-8 shadow-xl"
            whileHover={{ scale: 1.05 }}
          >
            <GraduationCap size={24} />
            education.certificates()
          </motion.div>
          <p
            className={`text-xl leading-relaxed max-w-3xl mx-auto font-mono ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            <span className="text-amber-500">$</span> cat ~/academic/achievements.txt
          </p>
        </motion.div>

        {/* Certificate Cards */}
        <div className="max-w-4xl mx-auto space-y-8">
          {sortedEducation.map((edu, idx) => (
            <motion.div
              key={idx}
              className={`relative p-8 md:p-10 rounded-lg border-2 ${
                isDarkMode 
                  ? 'bg-gray-800/50 border-amber-600/30' 
                  : 'bg-amber-50/50 border-amber-200'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              style={{
                backgroundImage: isDarkMode 
                  ? 'radial-gradient(circle at 100% 0%, rgba(251, 191, 36, 0.05) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)' 
                  : 'radial-gradient(circle at 100% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)'
              }}
            >
              {/* Decorative corners */}
              <div className={`absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 ${isDarkMode ? 'border-amber-600/50' : 'border-amber-300'}`} />
              <div className={`absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 ${isDarkMode ? 'border-amber-600/50' : 'border-amber-300'}`} />
              <div className={`absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 ${isDarkMode ? 'border-amber-600/50' : 'border-amber-300'}`} />
              <div className={`absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 ${isDarkMode ? 'border-amber-600/50' : 'border-amber-300'}`} />
              
              <div className="text-center">
                {/* Icon */}
                <GraduationCap className={`mx-auto mb-4 ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`} size={44} />
                
                {/* Institution */}
                <p className={`text-sm uppercase tracking-widest mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {edu.institution}
                </p>
                
                {/* Degree */}
                <h3 className={`text-2xl md:text-3xl font-serif font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {edu.degree}
                </h3>
                
                {/* Specialization */}
                {edu.specialization && (
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Specialization in {edu.specialization}
                    {edu.minor_subject && ` • Minor in ${edu.minor_subject}`}
                  </p>
                )}
                
                {/* Date Badge */}
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium mb-4 ${
                  isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Calendar size={14} />
                  {new Date(edu.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                </div>
                
                {/* Grade/Honors */}
                {edu.grade && (
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    🏆 {edu.grade}
                  </p>
                )}

                {/* Activities */}
                {edu.activities && edu.activities.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-dashed border-amber-300/30">
                    <p className={`text-xs uppercase tracking-wider mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Activities & Involvement
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {edu.activities.map((activity, actIdx) => (
                        <span
                          key={actIdx}
                          className={`text-xs px-3 py-1 rounded-full ${
                            isDarkMode 
                              ? 'bg-gray-700/50 text-gray-400' 
                              : 'bg-gray-200/50 text-gray-600'
                          }`}
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;

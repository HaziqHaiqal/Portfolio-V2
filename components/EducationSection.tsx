import { m } from 'framer-motion';
import { GraduationCap, Calendar } from 'lucide-react';
import { Education } from '@lib/supabase';
import SectionHeader from '@components/Common/SectionHeader';

interface EducationSectionProps {
  education: Education[] | null | undefined;
}

const EducationSection = ({ education }: EducationSectionProps) => {
  if (!education || education.length === 0) return null;

  // Sort by start_date descending (most recent first)
  const sortedEducation = [...education].sort(
    (a, b) =>
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <section id="education" className="relative overflow-hidden px-6 py-32">
      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeader
          icon={GraduationCap}
          label="education.certificates()"
          title="Education"
          accentClass="text-yellow-500"
          gradientClass="from-yellow-600 to-yellow-400"
        />

        {/* Certificate Cards */}
        <div className="mx-auto max-w-4xl space-y-8">
          {sortedEducation.map((edu, idx) => (
            <m.div
              key={idx}
              className="education-card relative rounded-3xl border border-gray-200 bg-white/70 p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800/70 md:p-10"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              {/* Decorative corners */}
              <div className="absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-amber-300 dark:border-amber-600/50" />
              <div className="absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-amber-300 dark:border-amber-600/50" />
              <div className="absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-amber-300 dark:border-amber-600/50" />
              <div className="absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-amber-300 dark:border-amber-600/50" />

              <div className="text-center">
                {/* Icon */}
                <GraduationCap
                  className="mx-auto mb-4 text-amber-600 dark:text-amber-500"
                  size={44}
                />

                {/* Institution */}
                <p className="mb-3 text-sm uppercase tracking-widest text-gray-600 dark:text-gray-400">
                  {edu.institution}
                </p>

                {/* Degree */}
                <h3 className="mb-3 font-serif text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                  {edu.degree}
                </h3>

                {/* Specialization */}
                {edu.specialization && (
                  <p className="mb-4 text-sm text-gray-500">
                    Specialize in {edu.specialization}
                    {edu.minor_subject && ` • Minor in ${edu.minor_subject}`}
                  </p>
                )}

                {/* Date Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2 text-sm font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                  <Calendar size={14} />
                  {new Date(edu.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  -{' '}
                  {edu.end_date
                    ? new Date(edu.end_date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Present'}
                </div>

                {/* Grade/Honors */}
                {edu.grade && (
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    🏆 {edu.grade}
                  </p>
                )}

                {/* Activities */}
                {edu.activities && edu.activities.length > 0 && (
                  <div className="mt-6 border-t border-dashed border-amber-300/30 pt-6">
                    <p className="mb-3 text-xs uppercase tracking-wider text-gray-500">
                      Activities & Involvement
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {edu.activities.map((activity, actIdx) => (
                        <span
                          key={actIdx}
                          className="rounded-full bg-gray-200/50 px-3 py-1 text-xs text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EducationSection;

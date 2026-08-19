import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme, useThemeClasses } from '@components/Provider/ThemeProvider';
import { useUIStore } from '@lib/stores';
import { useCurrentTime } from '@hooks/useCommon';

/**
 * Responsive navigation bar with mobile hamburger menu.
 */
const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const classes = useThemeClasses();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, openContact } =
    useUIStore();

  const { currentTime, mounted } = useCurrentTime();

  const navItems = [
    {
      href: '#home',
      label: 'Home',
      hoverTextClass: 'hover:text-blue-600',
      underlineClass: 'bg-blue-600',
    },
    {
      href: '#experience',
      label: 'Experience',
      hoverTextClass: 'hover:text-rose-600',
      underlineClass: 'bg-rose-600',
    },
    {
      href: '#education',
      label: 'Education',
      hoverTextClass: 'hover:text-yellow-600',
      underlineClass: 'bg-yellow-600',
    },
    {
      href: '#projects',
      label: 'Projects',
      hoverTextClass: 'hover:text-purple-600',
      underlineClass: 'bg-purple-600',
    },
    {
      href: '#contact',
      label: 'Contact',
      hoverTextClass: 'hover:text-green-600',
      underlineClass: 'bg-green-600',
    },
  ] as const;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 transform md:block">
        <motion.div
          className={`rounded-full border px-8 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${classes.navbar}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  // Contact lives in the floating terminal modal, not on the page.
                  if (item.href === '#contact') {
                    openContact();
                    return;
                  }
                  const targetId = item.href.replace('#', '');
                  const element = document.getElementById(targetId);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`${item.hoverTextClass} group relative font-medium transition-all duration-300 ${classes.text.secondary}`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 w-0 ${item.underlineClass} transition-all duration-300 group-hover:w-full`}
                />
              </a>
            ))}
            <div className={`h-6 w-px ${classes.border.muted}`} />
            <div
              className={`whitespace-nowrap font-mono text-xs ${classes.text.muted}`}
              suppressHydrationWarning
            >
              {mounted ? currentTime.toLocaleTimeString() : '--:--:--'}
            </div>
            <motion.button
              onClick={toggleDarkMode}
              className={`rounded-full p-2 transition-all duration-300 ${
                isDarkMode
                  ? 'text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300'
                  : 'text-gray-700 hover:bg-orange-500/10 hover:text-orange-500'
              }`}
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed left-4 right-4 top-4 z-50 md:hidden">
        <motion.div
          className={`rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 ${classes.navbar}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            {/* Time */}
            <div
              className={`whitespace-nowrap font-mono text-xs ${classes.text.muted}`}
              suppressHydrationWarning
            >
              {mounted ? currentTime.toLocaleTimeString() : '--:--:--'}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={toggleDarkMode}
                className={`rounded-full p-2 transition-all duration-300 ${
                  isDarkMode
                    ? 'text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300'
                    : 'text-gray-700 hover:bg-orange-500/10 hover:text-orange-500'
                }`}
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={
                  isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
                }
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <motion.button
                onClick={toggleMobileMenu}
                className={`rounded-full p-2 transition-all duration-300 ${classes.text.secondary} ${classes.hover.bg}`}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="mt-4 border-t border-gray-200/20 pt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-3">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        closeMobileMenu();
                        // Contact lives in the floating terminal modal.
                        if (item.href === '#contact') {
                          openContact();
                          return;
                        }
                        setTimeout(() => {
                          const targetId = item.href.replace('#', '');
                          const element = document.getElementById(targetId);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className={`block rounded-lg px-3 py-2 font-medium transition-all duration-300 ${classes.text.secondary} ${classes.hover.bg}`}
                      initial={{ opacity: 0, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </nav>
    </>
  );
};

export default NavBar;

import { m, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@components/Provider/ThemeProvider';
import { themeClasses } from '@constants/theme';
import { useUIStore } from '@lib/stores';
import { useCurrentTime } from '@hooks/useCommon';

/**
 * Responsive navigation bar with mobile hamburger menu.
 */
const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
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
        <div
          className={`enter-down rounded-full border px-8 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${themeClasses.navbar}`}
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
                className={`${item.hoverTextClass} group relative font-medium transition-all duration-300 ${themeClasses.text.secondary}`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 w-0 ${item.underlineClass} transition-all duration-300 group-hover:w-full`}
                />
              </a>
            ))}
            <div className={`h-6 w-px ${themeClasses.border.muted}`} />
            <div
              className={`whitespace-nowrap font-mono text-xs ${themeClasses.text.muted}`}
              suppressHydrationWarning
            >
              {mounted ? currentTime.toLocaleTimeString() : '--:--:--'}
            </div>
            <m.button
              onClick={toggleDarkMode}
              className={`rounded-full p-2 text-gray-700 transition-all duration-300 hover:bg-orange-500/10 hover:text-orange-500 dark:text-yellow-400 dark:hover:bg-yellow-400/10 dark:hover:text-yellow-300`}
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </m.button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed left-4 right-4 top-4 z-50 md:hidden">
        <div
          className={`enter-down rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 ${themeClasses.navbar}`}
        >
          <div className="flex items-center justify-between">
            {/* Time */}
            <div
              className={`whitespace-nowrap font-mono text-xs ${themeClasses.text.muted}`}
              suppressHydrationWarning
            >
              {mounted ? currentTime.toLocaleTimeString() : '--:--:--'}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <m.button
                onClick={toggleDarkMode}
                className={`rounded-full p-2 text-gray-700 transition-all duration-300 hover:bg-orange-500/10 hover:text-orange-500 dark:text-yellow-400 dark:hover:bg-yellow-400/10 dark:hover:text-yellow-300`}
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={
                  isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
                }
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </m.button>

              <m.button
                onClick={toggleMobileMenu}
                className={`rounded-full p-2 transition-all duration-300 ${themeClasses.text.secondary} ${themeClasses.hover.bg}`}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </m.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <m.div
                className="mt-4 border-t border-gray-200/20 pt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col gap-1">
                  {navItems.map((item, index) => (
                    <m.a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        closeMobileMenu();
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
                      className={`block rounded-lg px-3 py-2.5 font-medium transition-all duration-300 ${themeClasses.text.secondary} ${themeClasses.hover.bg}`}
                      initial={{ opacity: 0, x: 0 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {item.label}
                    </m.a>
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default NavBar;

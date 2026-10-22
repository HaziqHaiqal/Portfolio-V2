'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '@components/Provider/ThemeProvider';
import { themeClasses } from '@constants/theme';
import { useUIStore } from '@lib/stores';
import { useCurrentTime } from '@hooks/useCommon';

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.035,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      delayChildren: 0.02,
      staggerChildren: 0.035,
    },
  },
};

const mobileItemVariants = {
  closed: { opacity: 0, y: -8, transition: { duration: 0.15 } },
  open: { opacity: 1, y: 0, transition: { duration: 0.15 } },
};

const NAV_ITEMS = [
  {
    href: '/',
    label: 'About',
    hoverTextClass: 'hover:text-blue-600',
    underlineClass: 'bg-blue-600',
    decorationClass: 'decoration-blue-600',
  },
  {
    href: '/projects',
    label: 'Projects',
    hoverTextClass: 'hover:text-purple-600',
    underlineClass: 'bg-purple-600',
    decorationClass: 'decoration-purple-600',
  },
  {
    href: '/services',
    label: 'Services',
    hoverTextClass: 'hover:text-green-600',
    underlineClass: 'bg-green-600',
    decorationClass: 'decoration-green-600',
  },
  {
    href: '/contact',
    label: 'Contact',
    hoverTextClass: 'hover:text-yellow-600',
    underlineClass: 'bg-yellow-600',
    decorationClass: 'decoration-yellow-600',
  },
] as const;

function Brand() {
  return (
    <span
      className={`whitespace-nowrap font-bold tracking-tight ${themeClasses.text.primary}`}
    >
      Haziq<span className="text-green-600">.</span>
    </span>
  );
}

const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  const { currentTime, mounted } = useCurrentTime();
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav className="fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 transform md:block">
        <div
          className={`enter-down rounded-full border px-6 py-4 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:px-8 ${themeClasses.navbar}`}
        >
          <div className="flex items-center gap-5 lg:gap-8">
            <Brand />
            <div className={`h-6 w-px ${themeClasses.border.muted}`} />
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`${item.hoverTextClass} group relative whitespace-nowrap font-medium transition-all duration-300 ${themeClasses.text.secondary}`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 ${active ? 'w-full' : 'w-0'} ${item.underlineClass} transition-all duration-300 group-hover:w-full`}
                  />
                </Link>
              );
            })}
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

      <nav className="fixed left-4 right-4 top-4 z-50 md:hidden">
        <div
          className={`enter-down rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl transition-all duration-300 ${themeClasses.navbar}`}
        >
          <div className="flex items-center justify-between">
            <Brand />

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
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                className={`rounded-full p-2 transition-all duration-300 ${themeClasses.text.secondary} ${themeClasses.hover.bg}`}
                whileTap={{ scale: 0.9 }}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </m.button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isMobileMenuOpen && (
              <m.div
                className="mt-4 overflow-hidden border-t border-gray-200/20 pt-3"
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <div className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <m.div key={item.href} variants={mobileItemVariants}>
                        <Link
                          href={item.href}
                          onClick={closeMobileMenu}
                          aria-current={active ? 'page' : undefined}
                          className={`block rounded-lg px-3 py-2.5 font-medium transition-all duration-300 ${themeClasses.text.secondary} ${themeClasses.hover.bg}`}
                        >
                          <span
                            className={
                              active
                                ? `underline decoration-2 underline-offset-[6px] ${item.decorationClass}`
                                : undefined
                            }
                          >
                            {item.label}
                          </span>
                        </Link>
                      </m.div>
                    );
                  })}
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

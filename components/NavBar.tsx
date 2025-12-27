import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme, useThemeClasses } from "@components/providers/ThemeProvider";
import { useUIStore } from "@lib/stores";

/**
 * Responsive navigation bar with mobile hamburger menu.
 */
const NavBar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const classes = useThemeClasses();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { href: "#home", label: "Home", hoverTextClass: "hover:text-blue-600", underlineClass: "bg-blue-600" },
    { href: "#experience", label: "Experience", hoverTextClass: "hover:text-yellow-600", underlineClass: "bg-yellow-600" },
    { href: "#education", label: "Education", hoverTextClass: "hover:text-emerald-600", underlineClass: "bg-emerald-600" },
    { href: "#projects", label: "Projects", hoverTextClass: "hover:text-purple-600", underlineClass: "bg-purple-600" },
    { href: "#contact", label: "Contact", hoverTextClass: "hover:text-green-600", underlineClass: "bg-green-600" },
  ] as const;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 hidden md:block">
        <motion.div
          className={`backdrop-blur-xl border rounded-full px-8 py-4 shadow-2xl transition-all duration-300 ${classes.navbar}`}
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
                  const targetId = item.href.replace('#', '');
                  const element = document.getElementById(targetId);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`${item.hoverTextClass} transition-all duration-300 font-medium relative group ${classes.text.secondary}`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${item.underlineClass} transition-all duration-300 group-hover:w-full`} />
              </a>
            ))}
            <div className={`w-px h-6 ${classes.border.muted}`} />
            <div className={`text-xs font-mono ${classes.text.muted}`} suppressHydrationWarning>
              {mounted ? currentTime.toLocaleTimeString() : "--:--:--"}
            </div>
            <motion.button
              onClick={toggleDarkMode}
              className={`transition-all duration-300 p-2 rounded-full ${
                isDarkMode 
                  ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10" 
                  : "text-gray-700 hover:text-orange-500 hover:bg-orange-500/10"
              }`}
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>
        </motion.div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <motion.div
          className={`backdrop-blur-xl border rounded-2xl px-4 py-3 shadow-2xl transition-all duration-300 ${classes.navbar}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            {/* Time */}
            <div className={`text-xs font-mono ${classes.text.muted}`} suppressHydrationWarning>
              {mounted ? currentTime.toLocaleTimeString() : "--:--:--"}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={toggleDarkMode}
                className={`transition-all duration-300 p-2 rounded-full ${
                  isDarkMode 
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10" 
                    : "text-gray-700 hover:text-orange-500 hover:bg-orange-500/10"
                }`}
                whileHover={{ rotate: 180, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              <motion.button
                onClick={toggleMobileMenu}
                className={`transition-all duration-300 p-2 rounded-full ${classes.text.secondary} ${classes.hover.bg}`}
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
                className="mt-4 pt-4 border-t border-gray-200/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
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
                        setTimeout(() => {
                          const targetId = item.href.replace('#', '');
                          const element = document.getElementById(targetId);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        }, 100);
                      }}
                      className={`block py-2 px-3 rounded-lg transition-all duration-300 font-medium ${classes.text.secondary} ${classes.hover.bg}`}
                      initial={{ opacity: 0, x: 0}}
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
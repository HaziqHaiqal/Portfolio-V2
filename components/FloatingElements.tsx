import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@components/providers/ThemeProvider';

const FloatingElements = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className="fixed inset-0 pointer-events-none">
      <motion.div
        className={`absolute top-20 left-10 text-6xl ${isDarkMode ? "text-blue-300" : "text-blue-200"}`}
        animate={{ rotate: 360, y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {"{"}
      </motion.div>
      <motion.div
        className={`absolute top-40 right-20 text-4xl ${isDarkMode ? "text-purple-300" : "text-purple-200"}`}
        animate={{ rotate: -360, y: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        &lt;/&gt;
      </motion.div>
      <motion.div
        className={`absolute bottom-20 right-10 text-3xl ${isDarkMode ? "text-green-300" : "text-green-200"} opacity-30`}
        animate={{ rotate: 180, y: [0, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        🚀
      </motion.div>
    </div>
  );
};

export default FloatingElements; 
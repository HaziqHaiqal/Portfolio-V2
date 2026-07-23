import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Mail,
  Linkedin,
  Github,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "@components/providers/ThemeProvider";
import SectionHeader from "@components/SectionHeader";
import type { Profile } from "@components/HeroSection";

interface NetworkSectionProps {
  profile: Partial<Profile> | null;
}

const commandList = ["email", "linkedin", "github", "clear", "help"];
const quickActionCommands = commandList.filter((cmd) => cmd !== "clear"); // Clear is shown elsewhere

// Command icons mapping
const commandIcons = {
  email: Mail,
  linkedin: Linkedin,
  github: Github,
  clear: Trash2,
  help: HelpCircle,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const round3 = (value: number) => Math.round(value * 1000) / 1000;

const NetworkSection = ({ profile }: NetworkSectionProps) => {
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<
    { id: number; content: React.ReactNode }[]
  >([]);
  const [historyIdCounter, setHistoryIdCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const [floatingElements] = useState<
    {
      id: number;
      x: number;
      y: number;
      size: number;
      duration: number;
      delay: number;
    }[]
  >(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: round3(seededRandom(i * 2 + 1) * 100),
      y: round3(seededRandom(i * 3 + 7) * 100),
      size: round3(100 + seededRandom(i * 5 + 13) * 100),
      duration: round3(15 + seededRandom(i * 7 + 17) * 10),
      delay: i * 2,
    })),
  );

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  const commandActions: { [key: string]: () => React.ReactNode } = {
    email: () => {
      return (
        <div className="flex items-center gap-3">
          <span className="text-blue-500">✉️</span>
          <span className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
            Opening your email client...
          </span>
        </div>
      );
    },
    linkedin: () => {
      return (
        <div className="flex items-center gap-3">
          <span className="text-blue-600">💼</span>
          <span className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
            Opening LinkedIn...
          </span>
        </div>
      );
    },
    github: () => {
      return (
        <div className="flex items-center gap-3">
          <span className={isDarkMode ? "text-gray-300" : "text-gray-800"}>
            🐙
          </span>
          <span className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
            Opening GitHub...
          </span>
        </div>
      );
    },
    clear: () => {
      return (
        <div className="flex items-center gap-3">
          <span className="text-purple-500">✨</span>
          <span
            className={`${isDarkMode ? "text-purple-400" : "text-purple-600"} font-medium`}
          >
            Terminal cleared.
          </span>
        </div>
      );
    },
    help: () => {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-blue-500">📖</span>
            <span
              className={`font-semibold ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
            >
              Available Commands:
            </span>
          </div>
          <div className="ml-8 space-y-2 text-sm">
            <div
              className={`grid grid-cols-1 gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              <div>
                <span className="text-green-500 font-mono">email</span> - Open
                email client
              </div>
              <div>
                <span className="text-green-500 font-mono">linkedin</span> -
                Open LinkedIn profile
              </div>
              <div>
                <span className="text-green-500 font-mono">github</span> - Open
                GitHub profile
              </div>
              <div>
                <span className="text-green-500 font-mono">clear</span> - Clear
                terminal history
              </div>
              <div>
                <span className="text-green-500 font-mono">help</span> - Show
                this help message
              </div>
            </div>
          </div>
          <div
            className={`ml-8 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            💡 Tip: You can also use the quick action buttons above!
          </div>
        </div>
      );
    },
  };

  const handleCommand = (command: string) => {
    const commandLower = command.trim().toLowerCase();

    if (commandLower === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    const newId = historyIdCounter;
    setHistoryIdCounter((prev) => prev + 2);

    const newHistory = [...history];

    // Add command entry with improved styling
    newHistory.push({
      id: newId,
      content: (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 py-1"
        >
          <span
            className={`font-bold text-lg ${isDarkMode ? "text-green-400" : "text-green-600"}`}
          >
            ❯
          </span>
          <span
            className={`font-mono ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
          >
            {command}
          </span>
        </motion.div>
      ),
    });

    let responseNode: React.ReactNode | null = null;
    if (commandLower in commandActions) {
      responseNode = commandActions[commandLower]();

      // Run navigation side effects here (in the event handler) rather
      // than inside the JSX-returning actions. The mailto: must fire
      // synchronously within the click so the browser keeps user
      // activation and hands off to the OS mail app.
      if (commandLower === "email") {
        window.location.assign(
          `mailto:${profile?.email || "woodyz.dev@gmail.com"}`,
        );
      } else if (commandLower === "linkedin") {
        window.open("https://linkedin.com/in/mhaziqhaiqal", "_blank");
      } else if (commandLower === "github") {
        window.open("https://github.com/haziqhaiqal", "_blank");
      }
    } else if (commandLower !== "") {
      responseNode = (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-red-500">❌</span>
            <span className="text-red-500">
              Command not found: &quot;{commandLower}&quot;
            </span>
          </div>
          <div
            className={`text-xs ml-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Available commands:{" "}
            <span
              className={isDarkMode ? "text-yellow-400" : "text-yellow-600"}
            >
              {commandList.join(", ")}
            </span>
          </div>
        </div>
      );
    }

    // Add response entry with improved styling
    if (responseNode) {
      newHistory.push({
        id: newId + 1,
        content: (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="ml-8 py-1"
          >
            <>{responseNode}</>
          </motion.div>
        ),
      });
    }

    setHistory(newHistory);
    setInput("");
  };

  const handleQuickAction = (cmd: string) => {
    handleCommand(cmd);
    inputRef.current?.focus();
  };

  const contactData = [
    { key: "name", value: "Muhammad Haziq Haiqal" },
    { key: "email", value: profile?.email || "woodyz.dev@gmail.com" },
  ];

  return (
    <section id="contact" className={`py-32 px-6 relative overflow-hidden`}>
      {/* Floating background elements - Memoized */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className={`absolute rounded-full ${isDarkMode ? "bg-blue-500/10" : "bg-blue-500/20"}`}
            initial={{ x: `${element.x}vw`, y: `${element.y}vh`, scale: 0 }}
            animate={{ scale: [0, 1, 0], rotate: 360 }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
            }}
            style={{ width: `${element.size}px`, height: `${element.size}px` }}
          />
        ))}
      </div>
      <div className="max-w-3xl mx-auto relative">
        <SectionHeader
          icon={Terminal}
          label="network.connect()"
          title="Let's Connect"
          accentClass="text-green-500"
          gradientClass="from-green-600 to-green-400"
        />

        <motion.div
          className={`rounded-xl border shadow-2xl overflow-hidden backdrop-blur-sm ${isDarkMode ? "bg-gray-800/80 border-gray-700/60" : "bg-white/80 border-gray-200/60"}`}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div
            className={`px-4 py-3 border-b flex items-center justify-between ${isDarkMode ? "border-gray-700/60" : "border-gray-200/60"}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div
              className={`text-xs font-mono ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              zsh • network-terminal
            </div>
          </div>

          <div className="p-6 font-mono">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`pl-4 space-y-2 rounded-lg p-4 text-sm mb-6 ${isDarkMode ? "bg-black/30 border border-gray-700/50" : "bg-gray-50/80 border border-gray-200/50"}`}
            >
              <div
                className={`text-xs font-bold mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                <span className="text-blue-500 mr-1">📋</span> Contact
                Information
              </div>
              {contactData.map((item) => (
                <motion.div
                  key={item.key}
                  variants={itemVariants}
                  className="flex items-center gap-2"
                >
                  <span
                    className={
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }
                  >
                    &quot;{item.key}&quot;
                  </span>
                  :
                  <span
                    className={isDarkMode ? "text-green-400" : "text-green-600"}
                  >
                    &quot;{item.value}&quot;
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <div className="mb-6">
              <div
                className={`text-sm font-mono mb-3 flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                <span className="text-yellow-500">⚡</span>
                <span className="font-semibold">Quick Actions</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActionCommands.map((cmd) => {
                  const IconComponent =
                    commandIcons[cmd as keyof typeof commandIcons];

                  // Brand-specific color mapping
                  const getIconColor = (command: string) => {
                    switch (command) {
                      case "email":
                        return isDarkMode ? "text-blue-400" : "text-blue-600";
                      case "linkedin":
                        return isDarkMode ? "text-blue-400" : "text-blue-600";
                      case "github":
                        return isDarkMode ? "text-gray-300" : "text-gray-800";
                      case "clear":
                        return isDarkMode
                          ? "text-purple-400"
                          : "text-purple-600";
                      case "help":
                        return isDarkMode
                          ? "text-yellow-400"
                          : "text-yellow-600";
                      default:
                        return isDarkMode ? "text-blue-400" : "text-blue-600";
                    }
                  };

                  return (
                    <motion.button
                      key={cmd}
                      onClick={() => handleQuickAction(cmd)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-mono transition-all duration-200 ${isDarkMode ? "bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600/50 text-gray-200 hover:text-white" : "bg-gray-100/80 hover:bg-gray-200/80 border border-gray-200 text-gray-700 hover:text-gray-900"} shadow-sm hover:shadow-md`}
                    >
                      <IconComponent
                        size={16}
                        className={`${getIconColor(cmd)} transition-colors`}
                      />
                      <span className="capitalize">{cmd}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div
              className={`mb-4 rounded-lg border overflow-hidden ${isDarkMode ? "bg-black/20 border-gray-700/30" : "bg-gray-50/30 border-gray-200/30"}`}
              onClick={() => inputRef.current?.focus()}
            >
              <div
                ref={historyRef}
                className="h-56 overflow-y-auto space-y-1 text-sm font-mono p-3"
              >
                <AnimatePresence mode="popLayout">
                  {history.map((item) => (
                    <div key={item.id}>{item.content}</div>
                  ))}
                </AnimatePresence>
                {history.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`space-y-1 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                  >
                    <div>
                      # Type a command or use a quick action to start
                      connecting...
                    </div>
                    <div>
                      # Try typing &quot;
                      <span className="text-yellow-500">help</span>
                      &quot; to see all available commands
                    </div>
                  </motion.div>
                )}
              </div>

              <div
                className={`flex items-center gap-3 px-3 py-2 border-t ${isDarkMode ? "border-gray-700/30" : "border-gray-200/30"}`}
              >
                <span
                  className={`font-bold text-xl ${isDarkMode ? "text-green-400" : "text-green-600"}`}
                >
                  ❯
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCommand(input);
                  }}
                  placeholder='Type a command or "help" to see all commands...'
                  className={`flex-1 min-w-0 bg-transparent outline-none border-none font-mono caret-green-500 ${isDarkMode ? "text-gray-200 placeholder:text-gray-500" : "text-gray-800 placeholder:text-gray-400"}`}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAction("clear");
                  }}
                  className={`p-2 rounded-lg transition-all ${isDarkMode ? "hover:bg-gray-700 text-gray-500 hover:text-red-400" : "hover:bg-gray-200 text-gray-400 hover:text-red-500"}`}
                  title="Clear terminal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NetworkSection;

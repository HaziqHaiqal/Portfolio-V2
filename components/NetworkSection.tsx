import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Mail, Phone, MapPin, Linkedin, Github, Trash2, HelpCircle } from "lucide-react";
import { useTheme } from "./providers/ThemeProvider";
import EmailModal from "./EmailModal";
import type { Profile } from "./HeroSection";

interface NetworkSectionProps {
    profile: Partial<Profile> | null;
}

const commandList = ['email', 'call', 'whatsapp', 'location', 'linkedin', 'github', 'clear', 'help'];

// WhatsApp Icon Component (since Lucide doesn't have it)
const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.864 3.687" />
    </svg>
);

// Command icons mapping
const commandIcons = {
    email: Mail,
    call: Phone,
    whatsapp: WhatsAppIcon,
    location: MapPin,
    linkedin: Linkedin,
    github: Github,
    clear: Trash2,
    help: HelpCircle
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

const BlinkingCursor = () => {
    const { isDarkMode } = useTheme();
    return (
        <motion.div
            className={`w-0.5 h-5 ${isDarkMode ? 'bg-green-400' : 'bg-green-600'}`}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
    );
};

const NetworkSection = ({ profile }: NetworkSectionProps) => {
    const { isDarkMode } = useTheme();
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<{ id: number; content: React.ReactNode }[]>([]);
    const [historyIdCounter, setHistoryIdCounter] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);

    // Memoize floating elements to prevent re-calculation on every render
    const floatingElements = useMemo(() => {
        return [...Array(5)].map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 100 + Math.random() * 100,
            duration: 15 + Math.random() * 10,
            delay: i * 2
        }));
    }, []);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [history]);

    const commandActions: { [key: string]: () => React.ReactNode } = {
        email: () => {
            // Try the modal first, fallback to mailto if needed
            setTimeout(() => {
                setIsEmailModalOpen(true);
            }, 500);
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-blue-500">✉️</span>
                        <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Opening email composer...</span>
                    </div>
                    <div className={`text-xs ml-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        If the form doesn't work, you can also email directly:
                        <a
                            href="mailto:woodyz.dev@gmail.com"
                            className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} underline hover:no-underline ml-1`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            woodyz.dev@gmail.com
                        </a>
                    </div>
                </div>
            );
        },
        call: () => {
            const phone = profile?.phone || "017-7492150";
            const tel = `+60177492150`;
            setTimeout(() => window.open(`tel:${tel}`), 500);
            return (
                <div className="flex items-center gap-3">
                    <span className="text-green-500">📞</span>
                    <span>Calling: <a href={`tel:${tel}`} className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} underline hover:no-underline transition-all`}>{phone}</a></span>
                </div>
            );
        },
        whatsapp: () => {
            const phone = profile?.phone || "017-7492150";
            const tel = `+60177492150`;
            setTimeout(() => window.open(`https://wa.me/${tel}`), 500);
            return (
                <div className="flex items-center gap-3">
                    <span className="text-green-500">📱</span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Opening WhatsApp...</span>
                </div>
            );
        },
        location: () => {
            const location = profile?.location || "Damansara, Malaysia";
            const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}`;
            setTimeout(() => window.open(mapUrl), 500);
            return (
                <div className="flex items-center gap-3">
                    <span className="text-red-500">📍</span>
                    <span>Opening maps: <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} underline hover:no-underline transition-all`}>{location}</a></span>
                </div>
            );
        },
        linkedin: () => {
            const url = 'https://linkedin.com/in/mhaziqhaiqal';
            setTimeout(() => window.open(url, '_blank'), 500);
            return (
                <div className="flex items-center gap-3">
                    <span className="text-blue-600">💼</span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Opening LinkedIn...</span>
                </div>
            );
        },
        github: () => {
            const url = 'https://github.com/haziqhaiqal';
            setTimeout(() => window.open(url, '_blank'), 500);
            return (
                <div className="flex items-center gap-3">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>🐙</span>
                    <span className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Opening GitHub...</span>
                </div>
            );
        },
        clear: () => {
            setHistory([]);
            return (
                <div className="flex items-center gap-3">
                    <span className="text-purple-500">✨</span>
                    <span className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} font-medium`}>Terminal cleared.</span>
                </div>
            );
        },
        help: () => {
            return (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-blue-500">📖</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Available Commands:</span>
                    </div>
                    <div className="ml-8 space-y-2 text-sm">
                        <div className={`grid grid-cols-1 gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <div><span className="text-green-500 font-mono">email</span> - Open email client</div>
                            <div><span className="text-green-500 font-mono">call</span> - Make a phone call</div>
                            <div><span className="text-green-500 font-mono">whatsapp</span> - Open WhatsApp chat</div>
                            <div><span className="text-green-500 font-mono">location</span> - View location on maps</div>
                            <div><span className="text-green-500 font-mono">linkedin</span> - Open LinkedIn profile</div>
                            <div><span className="text-green-500 font-mono">github</span> - Open GitHub profile</div>
                            <div><span className="text-green-500 font-mono">clear</span> - Clear terminal history</div>
                            <div><span className="text-green-500 font-mono">help</span> - Show this help message</div>
                        </div>
                    </div>
                    <div className={`ml-8 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        💡 Tip: You can also use the quick action buttons above!
                    </div>
                </div>
            );
        },
    };

    const handleCommand = (command: string) => {
        const commandLower = command.trim().toLowerCase();

        if (commandLower === 'clear') {
            setHistory([]);
            setInput('');
            return;
        }

        const newId = historyIdCounter;
        setHistoryIdCounter(prev => prev + 2);

        let newHistory = [...history];

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
                    <span className={`font-bold text-lg ${isDarkMode ? "text-green-400" : "text-green-600"}`}>❯</span>
                    <span className={`font-mono ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{command}</span>
                </motion.div>
            )
        });

        let responseNode;
        if (commandLower in commandActions) {
            responseNode = commandActions[commandLower]();
        } else if (commandLower !== "") {
            responseNode = (
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-red-500">❌</span>
                        <span className="text-red-500">Command not found: "{commandLower}"</span>
                    </div>
                    <div className={`text-xs ml-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Available commands: <span className={isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}>{commandList.join(', ')}</span>
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
                        {responseNode as any}
                    </motion.div>
                )
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
        { key: "email", value: profile?.email || 'woodyz.dev@gmail.com' },
        { key: "phone", value: profile?.phone || '017-7492150' },
        { key: "location", value: profile?.location || 'Damansara, Malaysia' },
    ];

    return (
        <section id="contact" className={`py-32 px-6 relative overflow-hidden`}>
            {/* Floating background elements - Memoized */}
            <div className="absolute inset-0 pointer-events-none">
                {floatingElements.map((element) => (
                    <motion.div
                        key={element.id}
                        className={`absolute rounded-full ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-500/20'}`}
                        initial={{ x: `${element.x}vw`, y: `${element.y}vh`, scale: 0 }}
                        animate={{ scale: [0, 1, 0], rotate: 360 }}
                        transition={{ duration: element.duration, repeat: Infinity, delay: element.delay }}
                        style={{ width: `${element.size}px`, height: `${element.size}px` }}
                    />
                ))}
            </div>
            <div className="max-w-3xl mx-auto relative">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full font-bold text-lg mb-4 shadow-lg">
                        <Terminal size={20} />
                        network.connect()
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
                        Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Connect</span>
                    </h2>
                </motion.div>

                <motion.div
                    className={`rounded-xl border shadow-2xl overflow-hidden backdrop-blur-sm ${isDarkMode ? "bg-gray-800/80 border-gray-700/60" : "bg-white/80 border-gray-200/60"}`}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <div className={`px-4 py-3 border-b flex items-center justify-between ${isDarkMode ? "border-gray-700/60" : "border-gray-200/60"}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>zsh • network-terminal</div>
                    </div>

                    <div className="p-6 font-mono">
                        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`pl-4 space-y-2 rounded-lg p-4 text-sm mb-6 ${isDarkMode ? "bg-black/30 border border-gray-700/50" : "bg-gray-50/80 border border-gray-200/50"}`}>
                            <div className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <span className="text-blue-500 mr-1">📋</span> Contact Information
                            </div>
                            {contactData.map(item => (
                                <motion.div key={item.key} variants={itemVariants} className="flex items-center gap-2">
                                    <span className={isDarkMode ? "text-purple-400" : "text-purple-600"}>"{item.key}"</span>:
                                    <span className={isDarkMode ? "text-green-400" : "text-green-600"}>"{item.value}"</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="mb-6">
                            <div className={`text-sm font-mono mb-3 flex items-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                <span className="text-yellow-500">⚡</span>
                                <span className="font-semibold">Quick Actions</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {commandList.map((cmd) => {
                                    const IconComponent = commandIcons[cmd as keyof typeof commandIcons];

                                    // Brand-specific color mapping
                                    const getIconColor = (command: string) => {
                                        switch (command) {
                                            case 'email':
                                                return isDarkMode ? 'text-blue-400' : 'text-blue-600';
                                            case 'call':
                                                return isDarkMode ? 'text-green-400' : 'text-green-600';
                                            case 'whatsapp':
                                                return isDarkMode ? 'text-green-400' : 'text-green-600';
                                            case 'location':
                                                return isDarkMode ? 'text-red-400' : 'text-red-600';
                                            case 'linkedin':
                                                return isDarkMode ? 'text-blue-400' : 'text-blue-600';
                                            case 'github':
                                                return isDarkMode ? 'text-gray-300' : 'text-gray-800';
                                            case 'clear':
                                                return isDarkMode ? 'text-purple-400' : 'text-purple-600';
                                            case 'help':
                                                return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
                                            default:
                                                return isDarkMode ? 'text-blue-400' : 'text-blue-600';
                                        }
                                    };

                                    return (
                                        <motion.button
                                            key={cmd}
                                            onClick={() => handleQuickAction(cmd)}
                                            whileHover={{ scale: 1.05, y: -2 }}
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

                        <div ref={historyRef} className={`h-56 overflow-y-auto space-y-1 text-sm font-mono mb-4 pr-2 rounded-lg p-3 ${isDarkMode ? 'bg-black/20 border border-gray-700/30' : 'bg-gray-50/30 border border-gray-200/30'}`}>
                            <AnimatePresence mode="popLayout">
                                {history.map((item) => (
                                    <div key={item.id}>{item.content}</div>
                                ))}
                            </AnimatePresence>
                            {history.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`text-sm space-y-2 py-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-500">💡</span>
                                        <span>Type a command or use a quick action to start connecting...</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-yellow-500">⌨️</span>
                                        <span>Try typing "<span className="font-mono text-yellow-500">help</span>" to see all available commands</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className={`flex items-center gap-3 pt-3 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`} onClick={() => inputRef.current?.focus()}>
                            <span className={`font-bold text-xl ${isDarkMode ? "text-green-400" : "text-green-600"}`}>❯</span>
                            <div className="flex-1 relative flex items-center">
                                <span className={`font-mono whitespace-pre ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{input}</span>
                                {isFocused && <BlinkingCursor />}
                                {!input && !isFocused && (
                                    <span className={`absolute left-0 pointer-events-none font-mono ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                        Type a command or "help" to see all commands...
                                    </span>
                                )}
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCommand(input);
                                }}
                                className="absolute -left-[9999px]"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Email Modal */}
            <EmailModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                recipientEmail="woodyz.dev@gmail.com"
            />
        </section>
    );
};

export default NetworkSection; 
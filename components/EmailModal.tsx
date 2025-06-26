import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mail, User, MessageSquare } from "lucide-react";
import { useTheme } from "@components/providers/ThemeProvider";

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientEmail: string;
}

const EmailModal = ({ isOpen, onClose, recipientEmail }: EmailModalProps) => {
    const { isDarkMode } = useTheme();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    to: recipientEmail
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                setTimeout(() => {
                    onClose();
                    setFormData({ name: "", email: "", subject: "", message: "" });
                    setSubmitStatus('idle');
                }, 2000);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`px-6 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                            Send Email
                                        </h2>
                                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                            To: {recipientEmail}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                                        }`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    <User className="w-4 h-4 inline mr-2" />
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    placeholder="Enter your name"
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Your Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    placeholder="your.email@example.com"
                                />
                            </div>

                            {/* Subject Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    <MessageSquare className="w-4 h-4 inline mr-2" />
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    placeholder="What's this about?"
                                />
                            </div>

                            {/* Message Field */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${isDarkMode
                                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    placeholder="Write your message here..."
                                />
                            </div>

                            {/* Status Messages */}
                            {submitStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-green-500 text-sm"
                                >
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Email sent successfully!
                                </motion.div>
                            )}

                            {submitStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 text-red-500 text-sm"
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    Failed to send email. Please try again.
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${isSubmitting
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
                                    } text-white shadow-lg hover:shadow-xl`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Email
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmailModal; 
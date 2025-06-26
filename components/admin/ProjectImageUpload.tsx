'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import Image from 'next/image';
import { uploadProjectImage, deleteProjectImage, type ProjectImage } from '../../lib/imageUpload';

interface ProjectImageUploadProps {
  projectId: string;
  onImagesUpdate?: (images: ProjectImage[]) => void;
}

export default function ProjectImageUpload({ projectId, onImagesUpdate }: ProjectImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select an image file');
      setUploadStatus('error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image must be less than 5MB');
      setUploadStatus('error');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Generate default alt text from filename
    const defaultAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setAltText(defaultAlt);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !altText.trim()) {
      setErrorMessage('Please select a file and provide alt text');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const result = await uploadProjectImage(projectId, file, altText, caption || undefined);
      
      if (result.success) {
        setUploadStatus('success');
        setPreview(null);
        setAltText('');
        setCaption('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Notify parent component if callback provided
        if (onImagesUpdate && result.data) {
          // You might want to fetch all images here to update the parent
          // For now, we'll just pass the new image
        }
      } else {
        setErrorMessage(result.error || 'Upload failed');
        setUploadStatus('error');
      }
    } catch (error) {
      setErrorMessage('Unexpected error occurred');
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setAltText('');
    setCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="p-6 bg-gray-800 border border-gray-600 rounded-2xl">
      <h4 className="text-lg font-semibold text-green-400 mb-6">
        Add Project Image
      </h4>

      {/* File Input */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        
        {!preview ? (
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-300">
              Click to upload image
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PNG, JPG up to 5MB
            </span>
          </label>
        ) : (
          <div className="relative">
            <Image
              src={preview}
              alt="Preview"
              width={300}
              height={200}
              className="w-full h-48 object-cover rounded-xl"
            />
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      {preview && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Alt Text *
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-800 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-400 mb-2">
              Caption (Optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption for this image"
              rows={2}
              className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-800 text-white resize-none"
            />
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 bg-green-900/20 text-green-400 rounded-lg border border-green-400/30"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Image uploaded successfully!</span>
        </motion.div>
      )}

      {uploadStatus === 'error' && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 bg-red-900/20 text-red-400 rounded-lg border border-red-400/30"
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </motion.div>
      )}

      {/* Upload Button */}
      {preview && (
        <motion.button
          onClick={handleUpload}
          disabled={uploading || !altText.trim()}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
            uploading || !altText.trim()
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
          }`}
          whileHover={{ scale: uploading || !altText.trim() ? 1 : 1.02 }}
          whileTap={{ scale: uploading || !altText.trim() ? 1 : 0.98 }}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          ) : (
            'Upload Image'
          )}
        </motion.button>
      )}
    </div>
  );
} 
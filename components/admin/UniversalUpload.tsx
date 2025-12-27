'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, FileText, Trash2, Crop as CropIcon, ExternalLink, AlertCircle, Link2 } from 'lucide-react';
import Image from 'next/image';
import UniversalImage from './UniversalImage';
import {
  uploadFile,
  deleteFile,
  getFiles,
  UPLOAD_CONFIGS,
  validateFile,
  type UploadResult,
  type DeleteResult,
  type UploadedFile
} from '@lib/fileManager';
import ImageCropModal from './ImageCropModal';

// ============= TYPES =============

interface UniversalUploadProps {
  // Core properties
  uploadType: keyof typeof UPLOAD_CONFIGS;
  entityId: string;

  // Single file mode (like profile image, resume, thumbnails)
  value?: string;
  onChange?: (url: string) => void;

  // Collection mode (like project images)
  onCollectionUpdate?: (files: UploadedFile[]) => void;

  // UI customization
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;

  // Crop functionality
  enableCrop?: boolean;
  cropAspect?: number;

  // Mode selection
  allowUrlInput?: boolean;
}

// ============= COMPONENT =============

export default function UniversalUpload({
  uploadType,
  entityId,
  value,
  onChange,
  onCollectionUpdate,
  label,
  description,
  placeholder,
  required = false,
  enableCrop = false,
  cropAspect = 1,
  allowUrlInput = false
}: UniversalUploadProps) {

  // ============= STATE =============

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [showMetaFields, setShowMetaFields] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============= CONFIGURATION =============

  const config = UPLOAD_CONFIGS[uploadType];
  const isCollectionMode = config.fieldName === 'project_collection'; // Project images use collection mode
  const isImageUpload = config.allowedTypes.some(type => type.startsWith('image/'));

  // ============= HELPER FUNCTIONS =============

  const isImageFile = (file: File) => file.type.startsWith('image/');
  const isImageUrl = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  const getAcceptAttribute = () => {
    return config.allowedTypes.join(',');
  };

  const getTypeDescription = () => {
    const types = config.allowedTypes.map(type => {
      if (type.startsWith('image/')) return type.replace('image/', '').toUpperCase();
      if (type === 'application/pdf') return 'PDF';
      return type;
    }).join(', ');

    const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
    return `${types} • Max ${maxSizeMB}MB`;
  };

  // ============= FILE HANDLING =============

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file, config);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      setUploadStatus('error');
      return;
    }

    // Store the selected file
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Generate default alt text for images and show meta fields
    if (isImageFile(file)) {
      const defaultAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setAltText(defaultAlt);
      setShowMetaFields(true);
    }

    setUploadStatus('idle');
    setErrorMessage('');
    setCroppedImageFile(null);
  };

  const handleUpload = async () => {
    const file = croppedImageFile || selectedFile;
    if (!file) {
      setErrorMessage('Please select a file');
      setUploadStatus('error');
      return;
    }

    // Validate alt text for images
    if (isImageFile(file) && !altText.trim()) {
      setErrorMessage('Alt text is required for images');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const result: UploadResult = await uploadFile(
        file,
        uploadType,
        entityId,
        isImageFile(file) ? altText : undefined,
        isImageFile(file) ? caption || undefined : undefined
      );

      if (result.success && result.data) {
        setUploadStatus('success');
        clearPreview();

        if (isCollectionMode && onCollectionUpdate) {
          // Refresh collection for project images
          const updatedFiles = await getFiles('project', entityId, 'project_collection');
          onCollectionUpdate(updatedFiles);
        } else if (onChange) {
          // Update single file reference
          onChange(result.data.url);
        }
      } else {
        setErrorMessage(result.error || 'Upload failed');
        setUploadStatus('error');
      }
    } catch {
      setErrorMessage('Unexpected error occurred');
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      setErrorMessage('Please enter a URL');
      setUploadStatus('error');
      return;
    }

    if (onChange) {
      onChange(urlInput.trim());
      setUrlInput('');
      setUploadStatus('success');
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setAltText('');
    setCaption('');
    setCroppedImageFile(null);
    setSelectedFile(null);
    setShowMetaFields(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const deleteCurrentFile = async () => {
    if (!value) return;

    if (confirm('Delete this file?')) {
      try {
        const result: DeleteResult = await deleteFile(uploadType, entityId);

        if (result.success) {
          onChange?.('');
        } else {
          alert(`Failed to delete file: ${result.error}`);
        }
      } catch (err) {
        alert('Failed to delete file: Unexpected error');
        console.error('Delete error:', err);
      }
    }
  };

  // ============= CROP FUNCTIONALITY =============

  const handleCropImage = () => {
    if (preview) {
      setShowCropModal(true);
    }
  };

  const handleCropComplete = (croppedImageBlob: Blob) => {
    const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', {
      type: 'image/jpeg',
    });

    setCroppedImageFile(croppedFile);

    // Update preview with cropped version
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedFile);

    setShowCropModal(false);
  };

  // ============= RENDER =============

  return (
    <div className="space-y-6">
      {/* Header */}
      {label && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Mode Toggle */}
      {allowUrlInput && !isCollectionMode && (
        <div className="flex items-center bg-gray-800/50 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${inputMode === 'upload'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${inputMode === 'url'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <Link2 className="w-4 h-4" />
            URL
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {/* Current File Display */}
        {!isCollectionMode && value && !preview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-xl bg-gray-800/50 border border-gray-700 inline-block max-w-full"
          >
            {isImageUrl(value) ? (
              <div className="relative">
                <UniversalImage
                  src={value}
                  alt="Current file"
                  width={uploadType === 'company_logo' ? 200 : 0}
                  height={uploadType === 'company_logo' ? 200 : 0}
                  className={`w-auto h-auto object-contain bg-gray-900 ${
                    uploadType === 'company_logo' ? 'max-w-[200px] max-h-[200px]' : 'max-h-[60vh]'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button
                  type="button"
                  onClick={deleteCurrentFile}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">File attached</p>
                    <p className="text-xs text-gray-400">Click to view</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={deleteCurrentFile}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* URL Input Mode */}
        {allowUrlInput && inputMode === 'url' && !isCollectionMode ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={placeholder || "https://example.com/image.jpg"}
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-green-400/50 focus:outline-none focus:ring-1 focus:ring-green-400/20 transition-all"
              />
              <motion.button
                type="button"
                onClick={handleUrlSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                Add
              </motion.button>
            </div>

            {value && (
              <div className="flex items-center gap-2 p-3 bg-gray-800/30 rounded-lg">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-green-400 transition-colors truncate"
                >
                  {value}
                </a>
              </div>
            )}
          </div>
        ) : (
          /* Upload Mode */
          <div className="space-y-4">
            {/* File Upload Area */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptAttribute()}
                onChange={handleFileSelect}
                className="hidden"
                id={`file-upload-${uploadType}-${entityId}`}
                key={`file-input-${preview ? 'with-preview' : 'empty'}`}
              />

              {!preview ? (
                <motion.label
                  htmlFor={`file-upload-${uploadType}-${entityId}`}
                  className="relative block w-full p-8 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer group hover:border-green-400/50 transition-all"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                      <Upload className="w-6 h-6 text-green-400" />
                    </div>
                    <p className="text-white font-medium mb-1">
                      Click to upload {isImageUpload ? 'image' : 'file'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {getTypeDescription()}
                    </p>
                  </div>
                </motion.label>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative rounded-xl overflow-hidden bg-gray-800 inline-block ${
                    uploadType === 'company_logo' ? 'max-w-[200px]' : 'max-w-full'
                  }`}
                >
                  <Image
                    src={preview}
                    alt="Preview"
                    width={uploadType === 'company_logo' ? 200 : 400}
                    height={uploadType === 'company_logo' ? 200 : 250}
                    className={`object-contain bg-gray-900 ${
                      uploadType === 'company_logo' ? 'w-[200px] h-[200px]' : 'w-full max-h-64'
                    }`}
                  />

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {enableCrop && preview && isImageUrl(preview) && (
                      <motion.button
                        type="button"
                        onClick={handleCropImage}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                        title="Crop image"
                      >
                        <CropIcon className="w-4 h-4" />
                      </motion.button>
                    )}
                    <motion.button
                      type="button"
                      onClick={clearPreview}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Meta Fields for Images */}
            <AnimatePresence>
              {showMetaFields && preview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Alt Text
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Describe the image for accessibility"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-green-400/50 focus:outline-none focus:ring-1 focus:ring-green-400/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Caption
                        <span className="text-sm text-gray-400 ml-2">(Optional)</span>
                      </label>
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a caption for this image"
                        rows={2}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-green-400/50 focus:outline-none focus:ring-1 focus:ring-green-400/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Button */}
            <AnimatePresence>
              {preview && (
                <motion.button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading || (showMetaFields && !altText.trim())}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={uploading ? {} : { scale: 1.02 }}
                  whileTap={uploading ? {} : { scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-xl font-medium transition-all ${uploading || (showMetaFields && !altText.trim())
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                    }`}
                  style={uploading ? { pointerEvents: 'none' } : {}}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    'Upload File'
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {uploadStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-4 bg-green-500/10 text-green-400 rounded-xl border border-green-400/20"
          >
            <div className="p-1 bg-green-400 rounded-full">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">File uploaded successfully!</span>
          </motion.div>
        )}

        {uploadStatus === 'error' && errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-400/20"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Crop Modal */}
      {showCropModal && preview && (
        <ImageCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          onSave={handleCropComplete}
          imageSrc={preview}
          aspect={cropAspect}
        />
      )}
    </div>
  );
} 
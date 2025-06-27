'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Check, FileText, ImageIcon, Trash2, Crop as CropIcon, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { 
  uploadFile, 
  deleteFile, 
  getFiles,
  UPLOAD_CONFIGS,
  validateFile,
  type UploadResult,
  type DeleteResult,
  type UploadedFile 
} from '../../lib/fileManager';
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ============= CONFIGURATION =============
  
  const config = UPLOAD_CONFIGS[uploadType];
  const isCollectionMode = config.fieldName === 'image'; // Project images use collection mode
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
    return `${types} up to ${maxSizeMB}MB`;
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Generate default alt text for images
    if (isImageFile(file)) {
      const defaultAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setAltText(defaultAlt);
    }
    
    setUploadStatus('idle');
    setErrorMessage('');
    setCroppedImageFile(null);
  };

  const handleUpload = async () => {
    const file = croppedImageFile || fileInputRef.current?.files?.[0];
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
          const updatedFiles = await getFiles('project', entityId, 'image');
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
    <div className="space-y-4">
      {/* Label and Description */}
      {label && (
        <div>
          <label className="block text-sm font-medium text-green-400 mb-1">
            {label} {required && <span className="text-red-400">*</span>}
          </label>
          {description && (
            <p className="text-xs text-gray-500 mb-3">{description}</p>
          )}
        </div>
      )}

      {/* Mode Selector for URL Input */}
      {allowUrlInput && !isCollectionMode && (
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-4">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'upload'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'url'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Enter URL
          </button>
        </div>
      )}

      {/* URL Input Mode */}
      {allowUrlInput && inputMode === 'url' && !isCollectionMode ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={placeholder || "https://example.com/image.jpg"}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              Add
            </button>
          </div>
          
          {/* Current URL Display */}
          {value && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <ExternalLink className="w-4 h-4" />
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-green-400 transition-colors truncate"
              >
                {value}
              </a>
            </div>
          )}
        </div>
      ) : (
        /* Upload Mode */
        <div className="space-y-4">
          {/* Current file display */}
          {!isCollectionMode && value && !preview && (
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isImageUrl(value) ? (
                    <ImageIcon className="w-4 h-4 text-green-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-sm text-gray-300">Current file</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteCurrentFile();
                  }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  title="Delete current file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {isImageUrl(value) && (
                <div className="mt-2">
                  <Image
                    src={value}
                    alt="Current file"
                    width={200}
                    height={120}
                    className="w-full max-w-xs h-24 object-cover rounded"
                  />
                </div>
              )}
            </div>
          )}

          {/* File Input */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptAttribute()}
              onChange={handleFileSelect}
              className="hidden"
              id={`file-upload-${uploadType}-${entityId}`}
            />
            
            {!preview ? (
              <label
                htmlFor={`file-upload-${uploadType}-${entityId}`}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-300">
                  Click to upload {isImageUpload ? 'image' : 'file'}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {getTypeDescription()}
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
                {/* Crop button */}
                {enableCrop && isImageUrl(preview) && (
                  <button
                    type="button"
                    onClick={handleCropImage}
                    className="absolute top-2 left-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    title="Crop image"
                  >
                    <CropIcon className="w-4 h-4" />
                  </button>
                )}
                {/* Clear button */}
                <button
                  type="button"
                  onClick={clearPreview}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Form Fields for Images */}
          {preview && fileInputRef.current?.files?.[0] && isImageFile(fileInputRef.current.files[0]) && (
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
              <span className="text-sm font-medium">File uploaded successfully!</span>
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
              type="button"
              onClick={handleUpload}
              disabled={uploading || (fileInputRef.current?.files?.[0] && isImageFile(fileInputRef.current.files[0]) && !altText.trim())}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                uploading || (fileInputRef.current?.files?.[0] && isImageFile(fileInputRef.current.files[0]) && !altText.trim())
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
              }`}
              whileHover={{ scale: (uploading || (fileInputRef.current?.files?.[0] && isImageFile(fileInputRef.current.files[0]) && !altText.trim())) ? 1 : 1.02 }}
              whileTap={{ scale: (uploading || (fileInputRef.current?.files?.[0] && isImageFile(fileInputRef.current.files[0]) && !altText.trim())) ? 1 : 0.98 }}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                'Upload File'
              )}
            </motion.button>
          )}
        </div>
      )}

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
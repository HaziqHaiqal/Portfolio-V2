import { createClient } from '@utils/supabase/client';

// ============= TYPES =============

export interface UploadedFile {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
}

export interface UploadConfig {
  entityType: 'profile' | 'project' | 'experience' | 'education';
  entityId: string;
  fieldName: string;
  bucket: string;
  path?: string;
  maxSize: number; // in bytes
  allowedTypes: string[];
}

export interface UploadResult {
  success: boolean;
  data?: UploadedFile;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

// ============= UPLOAD CONFIGURATIONS =============

export const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  // Profile uploads
  profile_image: {
    entityType: 'profile',
    entityId: '', // Set dynamically
    fieldName: 'profile_image',
    bucket: 'profile-images',
    path: 'avatars',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  
  resume: {
    entityType: 'profile',
    entityId: '', // Set dynamically
    fieldName: 'resume',
    bucket: 'documents',
    path: 'resumes',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf']
  },

  // Project uploads
  project_thumbnail: {
    entityType: 'project',
    entityId: '', // Set dynamically
    fieldName: 'thumbnail',
    bucket: 'project-thumbnails',
    path: 'thumbnails',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },

  project_image: {
    entityType: 'project',
    entityId: '', // Set dynamically
    fieldName: 'image',
    bucket: 'project-images',
    path: '', // Will use entityId as path
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },

  // Experience uploads
  company_logo: {
    entityType: 'experience',
    entityId: '', // Set dynamically
    fieldName: 'company_logo',
    bucket: 'profile-images',
    path: 'company-logos',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  },

  // Education uploads
  institution_logo: {
    entityType: 'education',
    entityId: '', // Set dynamically
    fieldName: 'institution_logo',
    bucket: 'profile-images',
    path: 'institution-logos',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  }
};

// ============= CORE FUNCTIONS =============

/**
 * Validate file against upload configuration
 */
export function validateFile(file: File, config: UploadConfig): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
    return { valid: false, error: `File must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    const typeNames = config.allowedTypes.map(type => {
      if (type.startsWith('image/')) return type.replace('image/', '').toUpperCase();
      if (type === 'application/pdf') return 'PDF';
      return type;
    }).join(', ');
    return { valid: false, error: `Only ${typeNames} files are allowed` };
  }

  return { valid: true };
}

/**
 * Upload file to Supabase Storage and save metadata
 */
export async function uploadFile(
  file: File,
  uploadType: string,
  entityId: string,
  altText?: string,
  caption?: string
): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    // Get upload configuration
    const config = { ...UPLOAD_CONFIGS[uploadType] };
    if (!config) {
      return { success: false, error: `Unknown upload type: ${uploadType}` };
    }
    
    config.entityId = entityId;

    // Validate file
    const validation = validateFile(file, config);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const fileName = `${config.path ? config.path + '/' : ''}${timestamp}-${random}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(config.bucket)
      .getPublicUrl(fileName);

    // Save metadata to uploads table
    const { data: dbData, error: dbError } = await supabase
      .from('uploads')
      .insert({
        entity_type: config.entityType,
        entity_id: config.entityId,
        field_name: config.fieldName,
        file_url: publicUrl,
        alt_text: altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption: caption,
        file_name: fileName,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        bucket_name: config.bucket,
        sort_order: 0
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from(config.bucket).remove([fileName]);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    // Update main entity table if needed (for single file fields)
    if (config.fieldName !== 'image') { // 'image' is for collections like project images
      await updateEntityTable(config.entityType, config.entityId, config.fieldName, publicUrl);
    }

    return {
      success: true,
      data: {
        id: dbData.id,
        url: publicUrl,
        alt: altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption: caption,
        fileName: fileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    };
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error}` };
  }
}

/**
 * Delete file from storage, database, and clear entity reference
 */
export async function deleteFile(
  uploadType: string,
  entityId: string
): Promise<DeleteResult> {
  try {
    const supabase = createClient();
    
    // Get upload configuration
    const config = { ...UPLOAD_CONFIGS[uploadType] };
    if (!config) {
      return { success: false, error: `Unknown upload type: ${uploadType}` };
    }
    
    config.entityId = entityId;

    // Find the file in uploads table
    const { data: fileData, error: fetchError } = await supabase
      .from('uploads')
      .select('id, file_url, bucket_name, file_name')
      .eq('entity_type', config.entityType)
      .eq('entity_id', config.entityId)
      .eq('field_name', config.fieldName)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No file found, just clear the entity field
        if (config.fieldName !== 'image') {
          await clearEntityField(config.entityType, config.entityId, config.fieldName);
        }
        return { success: true };
      }
      return { success: false, error: `Failed to find file: ${fetchError.message}` };
    }

    // Delete from uploads table
    const { error: dbError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', fileData.id);

    if (dbError) {
      return { success: false, error: `Database deletion failed: ${dbError.message}` };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(fileData.bucket_name)
      .remove([fileData.file_name]);

    if (storageError) {
      console.warn('Storage deletion failed:', storageError.message);
    }

    // Clear entity field if needed
    if (config.fieldName !== 'image') {
      await clearEntityField(config.entityType, config.entityId, config.fieldName);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error}` };
  }
}

/**
 * Delete specific file by ID (for collections like project images)
 */
export async function deleteFileById(fileId: string): Promise<DeleteResult> {
  try {
    const supabase = createClient();
    
    // Get file details
    const { data: fileData, error: fetchError } = await supabase
      .from('uploads')
      .select('file_url, bucket_name, file_name')
      .eq('id', fileId)
      .single();

    if (fetchError) {
      return { success: false, error: `Failed to fetch file: ${fetchError.message}` };
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      return { success: false, error: `Database deletion failed: ${dbError.message}` };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(fileData.bucket_name)
      .remove([fileData.file_name]);

    if (storageError) {
      console.warn('Storage deletion failed:', storageError.message);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error}` };
  }
}

/**
 * Get files for an entity
 */
export async function getFiles(
  entityType: string,
  entityId: string,
  fieldName?: string
): Promise<UploadedFile[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('uploads')
    .select('id, file_url, alt_text, caption, file_name, original_name, file_type, file_size')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  
  if (fieldName) {
    query = query.eq('field_name', fieldName);
  }
  
  const { data, error } = await query.order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching files:', error);
    return [];
  }

  return data.map(file => ({
    id: file.id,
    url: file.file_url,
    alt: file.alt_text || 'Uploaded file',
    caption: file.caption,
    fileName: file.file_name,
    originalName: file.original_name,
    fileType: file.file_type,
    fileSize: file.file_size
  }));
}

// ============= HELPER FUNCTIONS =============

/**
 * Update entity table with file URL
 */
async function updateEntityTable(
  entityType: string,
  entityId: string,
  fieldName: string,
  fileUrl: string
): Promise<void> {
  const supabase = createClient();
  
  const tableMap: Record<string, string> = {
    profile: 'profile',
    project: 'projects',
    experience: 'experience',
    education: 'education'
  };

  const fieldMap: Record<string, string> = {
    profile_image: 'profile_image_url',
    resume: 'resume_url',
    thumbnail: 'thumbnail_url',
    company_logo: 'company_logo_url',
    institution_logo: 'institution_logo_url'
  };

  const table = tableMap[entityType];
  const column = fieldMap[fieldName];

  if (table && column) {
    const { error } = await supabase
      .from(table)
      .update({ [column]: fileUrl })
      .eq('id', entityId);

    if (error) {
      console.warn(`Failed to update ${table} table:`, error);
    }
  }
}

/**
 * Clear entity table field
 */
async function clearEntityField(
  entityType: string,
  entityId: string,
  fieldName: string
): Promise<void> {
  const supabase = createClient();
  
  const tableMap: Record<string, string> = {
    profile: 'profile',
    project: 'projects',
    experience: 'experience',
    education: 'education'
  };

  const fieldMap: Record<string, string> = {
    profile_image: 'profile_image_url',
    resume: 'resume_url',
    thumbnail: 'thumbnail_url',
    company_logo: 'company_logo_url',
    institution_logo: 'institution_logo_url'
  };

  const table = tableMap[entityType];
  const column = fieldMap[fieldName];

  if (table && column) {
    const { error } = await supabase
      .from(table)
      .update({ [column]: null })
      .eq('id', entityId);

    if (error) {
      console.warn(`Failed to clear ${table} field:`, error);
    }
  }
}

// ============= CONVENIENCE FUNCTIONS =============

// Profile functions
export const uploadProfileImage = (entityId: string, file: File) => 
  uploadFile(file, 'profile_image', entityId);

export const uploadResume = (entityId: string, file: File) => 
  uploadFile(file, 'resume', entityId);

export const deleteProfileImage = (entityId: string) => 
  deleteFile('profile_image', entityId);

export const deleteResume = (entityId: string) => 
  deleteFile('resume', entityId);

// Project functions
export const uploadProjectThumbnail = (entityId: string, file: File) => 
  uploadFile(file, 'project_thumbnail', entityId);

export const uploadProjectImage = (entityId: string, file: File, altText: string, caption?: string) => 
  uploadFile(file, 'project_image', entityId, altText, caption);

export const deleteProjectThumbnail = (entityId: string) => 
  deleteFile('project_thumbnail', entityId);

export const deleteProjectImage = (fileId: string) => 
  deleteFileById(fileId);

export const getProjectImages = (projectId: string) => 
  getFiles('project', projectId, 'image');

// Experience functions
export const uploadCompanyLogo = (entityId: string, file: File) => 
  uploadFile(file, 'company_logo', entityId);

export const deleteCompanyLogo = (entityId: string) => 
  deleteFile('company_logo', entityId);

// Education functions
export const uploadInstitutionLogo = (entityId: string, file: File) => 
  uploadFile(file, 'institution_logo', entityId);

export const deleteInstitutionLogo = (entityId: string) => 
  deleteFile('institution_logo', entityId);

// Legacy compatibility - for gradual migration
export type { UploadedFile as ProjectImage }; 
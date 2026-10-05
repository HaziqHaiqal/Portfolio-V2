import { createBrowserSupabase } from '@lib/supabase/browser';

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
  entityType: 'profile' | 'project' | 'experience' | 'education' | 'company';
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

export const UPLOAD_CONFIGS: Record<string, UploadConfig> = {
  profile_image: {
    entityType: 'profile',
    entityId: '',
    fieldName: 'profile_image',
    bucket: 'profile-images',
    path: 'avatars',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },

  resume: {
    entityType: 'profile',
    entityId: '',
    fieldName: 'resume',
    bucket: 'documents',
    path: 'resumes',
    maxSize: 10 * 1024 * 1024,
    allowedTypes: ['application/pdf'],
  },

  project_thumbnail: {
    entityType: 'project',
    entityId: '',
    fieldName: 'project_thumbnail',
    bucket: 'project-thumbnails',
    path: 'thumbnails',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  project_image: {
    entityType: 'project',
    entityId: '',
    fieldName: 'project_collection',
    bucket: 'project-images',
    path: '',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },

  company_logo: {
    entityType: 'company',
    entityId: '',
    fieldName: 'company_logo',
    bucket: 'profile-images',
    path: 'company-logos',
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },

  institution_logo: {
    entityType: 'education',
    entityId: '',
    fieldName: 'institution_logo',
    bucket: 'profile-images',
    path: 'institution-logos',
    maxSize: 2 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  },
};

export function validateFile(
  file: File,
  config: UploadConfig
): { valid: boolean; error?: string } {
  if (file.size > config.maxSize) {
    const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
    return { valid: false, error: `File must be less than ${maxSizeMB}MB` };
  }

  if (!config.allowedTypes.includes(file.type)) {
    const typeNames = config.allowedTypes
      .map((type) => {
        if (type.startsWith('image/'))
          return type.replace('image/', '').toUpperCase();
        if (type === 'application/pdf') return 'PDF';
        return type;
      })
      .join(', ');
    return { valid: false, error: `Only ${typeNames} files are allowed` };
  }

  return { valid: true };
}

export async function uploadFile(
  file: File,
  uploadType: string,
  entityId: string,
  altText?: string,
  caption?: string
): Promise<UploadResult> {
  try {
    const supabase = createBrowserSupabase();

    const config = { ...UPLOAD_CONFIGS[uploadType] };
    if (!config) {
      return { success: false, error: `Unknown upload type: ${uploadType}` };
    }

    config.entityId = entityId;

    const validation = validateFile(file, config);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const fileName = `${config.path ? config.path + '/' : ''}${timestamp}-${random}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(config.bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(config.bucket).getPublicUrl(fileName);

    const { data: dbData, error: dbError } = await supabase
      .from('uploads')
      .insert({
        entity_type: config.entityType,
        entity_id: config.entityId,
        field_name: config.fieldName,
        file_url: publicUrl,
        alt_text:
          altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption: caption,
        file_name: fileName,
        original_name: file.name,
        file_type: file.type,
        file_size: file.size,
        bucket_name: config.bucket,
        sort_order: 0,
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from(config.bucket).remove([fileName]);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    if (config.fieldName !== 'project_collection') {
      await updateEntityTable(
        config.entityType,
        config.entityId,
        config.fieldName,
        publicUrl
      );
    }

    return {
      success: true,
      data: {
        id: dbData.id,
        url: publicUrl,
        alt:
          altText || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        caption: caption,
        fileName: fileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
    };
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error}` };
  }
}

export async function deleteFile(
  uploadType: string,
  entityId: string
): Promise<DeleteResult> {
  try {
    const supabase = createBrowserSupabase();

    const config = { ...UPLOAD_CONFIGS[uploadType] };
    if (!config) {
      return { success: false, error: `Unknown upload type: ${uploadType}` };
    }

    config.entityId = entityId;

    const { data: fileData, error: fetchError } = await supabase
      .from('uploads')
      .select('id, file_url, bucket_name, file_name')
      .eq('entity_type', config.entityType)
      .eq('entity_id', config.entityId)
      .eq('field_name', config.fieldName)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        if (config.fieldName !== 'project_collection') {
          await clearEntityField(
            config.entityType,
            config.entityId,
            config.fieldName
          );
        }
        return { success: true };
      }
      return {
        success: false,
        error: `Failed to find file: ${fetchError.message}`,
      };
    }

    const { error: dbError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', fileData.id);

    if (dbError) {
      return {
        success: false,
        error: `Database deletion failed: ${dbError.message}`,
      };
    }

    const { error: storageError } = await supabase.storage
      .from(fileData.bucket_name)
      .remove([fileData.file_name]);

    if (storageError) {
      console.warn('Storage deletion failed:', storageError.message);
    }

    if (config.fieldName !== 'project_collection') {
      await clearEntityField(
        config.entityType,
        config.entityId,
        config.fieldName
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error}` };
  }
}

export async function deleteFileById(fileId: string): Promise<DeleteResult> {
  try {
    const supabase = createBrowserSupabase();

    const { data: fileData, error: fetchError } = await supabase
      .from('uploads')
      .select('file_url, bucket_name, file_name')
      .eq('id', fileId)
      .single();

    if (fetchError) {
      return {
        success: false,
        error: `Failed to fetch file: ${fetchError.message}`,
      };
    }

    const { error: dbError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      return {
        success: false,
        error: `Database deletion failed: ${dbError.message}`,
      };
    }

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

export async function getFiles(
  entityType: string,
  entityId: string,
  fieldName?: string
): Promise<UploadedFile[]> {
  const supabase = createBrowserSupabase();

  let query = supabase
    .from('uploads')
    .select(
      'id, file_url, alt_text, caption, file_name, original_name, file_type, file_size'
    )
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

  return data.map((file) => ({
    id: file.id,
    url: file.file_url,
    alt: file.alt_text || 'Uploaded file',
    caption: file.caption,
    fileName: file.file_name,
    originalName: file.original_name,
    fileType: file.file_type,
    fileSize: file.file_size,
  }));
}

async function updateEntityTable(
  entityType: string,
  entityId: string,
  fieldName: string,
  fileUrl: string
): Promise<void> {
  const supabase = createBrowserSupabase();

  const tableMap: Record<string, string> = {
    profile: 'profile',
    project: 'projects',
    experience: 'experience',
    education: 'education',
    company: 'companies',
  };

  const fieldMap: Record<string, string> = {
    profile_image: 'profile_image_url',
    resume: 'resume_url',
    project_thumbnail: 'thumbnail_url',
    company_logo: 'logo_url',
    institution_logo: 'logo_url',
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

async function clearEntityField(
  entityType: string,
  entityId: string,
  fieldName: string
): Promise<void> {
  const supabase = createBrowserSupabase();

  const tableMap: Record<string, string> = {
    profile: 'profile',
    project: 'projects',
    experience: 'experience',
    education: 'education',
    company: 'companies',
  };

  const fieldMap: Record<string, string> = {
    profile_image: 'profile_image_url',
    resume: 'resume_url',
    project_thumbnail: 'thumbnail_url',
    company_logo: 'logo_url',
    institution_logo: 'logo_url',
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

export const getProjectImages = (projectId: string) =>
  getFiles('project', projectId, 'project_collection');

export type { UploadedFile as ProjectImage };

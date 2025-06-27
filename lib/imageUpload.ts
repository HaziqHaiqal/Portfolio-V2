import { createClient } from '@utils/supabase/client';

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
}

/**
 * Upload an image file to Supabase Storage and save metadata to database
 */
export async function uploadProjectImage(
  projectId: string,
  file: File,
  altText: string,
  caption?: string
): Promise<{ success: boolean; data?: ProjectImage; error?: string }> {
  try {
    const supabase = createClient();
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage error: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName);

    // Save image metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('project_images')
      .insert({
        project_id: projectId,
        image_url: publicUrl,
        alt_text: altText,
        caption: caption,
        sort_order: 0
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('project-images').remove([fileName]);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    return {
      success: true,
      data: {
        id: dbData.id,
        url: publicUrl,
        alt: altText,
        caption: caption
      }
    };
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error}` };
  }
}

/**
 * Get all images for a project
 */
export async function getProjectImages(projectId: string): Promise<ProjectImage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('project_images')
    .select('id, image_url, alt_text, caption')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching project images:', error);
    return [];
  }

  return data.map(img => ({
    id: img.id,
    url: img.image_url,
    alt: img.alt_text || 'Project image',
    caption: img.caption
  }));
}

/**
 * Delete an image from both storage and database
 */
export async function deleteProjectImage(imageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    // First get the image details to find the storage path
    const { data: imageData, error: fetchError } = await supabase
      .from('project_images')
      .select('image_url')
      .eq('id', imageId)
      .single();

    if (fetchError) {
      return { success: false, error: `Failed to fetch image: ${fetchError.message}` };
    }

    // Extract filename from URL for storage deletion
    const url = imageData.image_url;
    const fileName = url.split('/').slice(-2).join('/'); // Get project_id/filename.ext

    // Delete from database
    const { error: dbError } = await supabase
      .from('project_images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      return { success: false, error: `Database deletion failed: ${dbError.message}` };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-images')
      .remove([fileName]);

    if (storageError) {
      console.warn('Storage deletion failed:', storageError.message);
      // Don't return error here as DB deletion succeeded
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Unexpected error: ${error}` };
  }
} 
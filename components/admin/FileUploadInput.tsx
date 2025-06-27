// Legacy component - redirects to UniversalUpload
// This component is kept for backward compatibility

import UniversalUpload from './UniversalUpload';
import { UPLOAD_CONFIGS } from '../../lib/fileManager';

interface FileUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  acceptedTypes: 'image' | 'pdf' | 'both';
  uploadType: 'profile_image' | 'resume' | 'project_thumbnail' | 'company_logo' | 'institution_logo';
  entityId: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  enableCrop?: boolean;
  cropAspect?: number;
}

export default function FileUploadInput(props: FileUploadInputProps) {
  // Map the old uploadType to the new standardized keys
  const uploadTypeMap: Record<string, keyof typeof UPLOAD_CONFIGS> = {
    profile_image: 'profile_image',
    resume: 'resume',
    project_thumbnail: 'project_thumbnail',
    company_logo: 'company_logo',
    institution_logo: 'institution_logo'
  };

  const standardizedUploadType = uploadTypeMap[props.uploadType];

  return (
    <UniversalUpload
      uploadType={standardizedUploadType}
      entityId={props.entityId}
      value={props.value}
      onChange={props.onChange}
      label={props.label}
      description={props.description}
      placeholder={props.placeholder}
      required={props.required}
      enableCrop={props.enableCrop}
      cropAspect={props.cropAspect}
      allowUrlInput={true} // Keep the URL input feature for backward compatibility
    />
  );
} 
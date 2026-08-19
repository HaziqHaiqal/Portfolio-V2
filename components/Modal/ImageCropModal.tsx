'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageBlob: Blob) => void;
  imageSrc: string;
  aspect: number;
}

export default function ImageCropModal({
  isOpen,
  onClose,
  onSave,
  imageSrc,
  aspect,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  // Function to generate the cropped image
  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: Crop): Promise<Blob | null> => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return Promise.resolve(null);
      }

      const pixelRatio = window.devicePixelRatio;
      canvas.width = crop.width * pixelRatio;
      canvas.height = crop.height * pixelRatio;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Canvas is empty');
              return;
            }
            resolve(blob);
          },
          'image/png',
          1
        );
      });
    },
    []
  );

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  }

  const handleSaveCrop = async () => {
    if (imgRef.current && crop?.width && crop?.height) {
      const croppedImageBlob = await getCroppedImg(imgRef.current, crop);
      if (croppedImageBlob) {
        onSave(croppedImageBlob);
        onClose();
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-gray-800 p-6 md:max-w-xl md:p-8">
        <h2 className="mb-6 text-xl font-bold text-green-400">Crop Image</h2>
        <div className="flex justify-center rounded-lg bg-black/50 p-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            aspect={aspect}
            minWidth={100}
            minHeight={100}
            className="max-w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Crop preview"
              className="max-h-[60vh]"
            />
          </ReactCrop>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-600/50 px-6 py-2 text-gray-300 transition-colors hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveCrop}
            className="rounded-lg bg-green-500 px-6 py-2 text-white transition-colors hover:bg-green-600"
          >
            Save Crop
          </button>
        </div>
      </div>
    </div>
  );
}

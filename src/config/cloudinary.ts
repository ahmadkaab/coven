/* ================================================================
   COVEN — Cloudinary Upload Utility
   Direct unsigned upload to Cloudinary (no server needed).
   Configure an unsigned upload preset in Cloudinary dashboard.
   ================================================================ */

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string ?? 'coven_artworks';

const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}`;

export const cloudinary = {
  /** Full quality original */
  original: (publicId: string) =>
    `${BASE_URL}/image/upload/${publicId}`,

  /** Optimized thumbnail */
  thumbnail: (publicId: string, width = 400) =>
    `${BASE_URL}/image/upload/f_auto,q_auto,w_${width}/${publicId}`,

  /** Card — cropped fill */
  card: (publicId: string, size = 600) =>
    `${BASE_URL}/image/upload/f_auto,q_auto,c_fill,w_${size},h_${size}/${publicId}`,

  /** Hero banner — wide */
  hero: (publicId: string, width = 1200) =>
    `${BASE_URL}/image/upload/f_auto,q_auto,w_${width},c_fill,ar_16:9/${publicId}`,

  /** Artist avatar — face-detected circle */
  avatar: (publicId: string, size = 160) =>
    `${BASE_URL}/image/upload/f_auto,q_auto,c_fill,g_face,w_${size},h_${size}/${publicId}`,
};

export interface UploadProgress {
  percent: number;
  done: boolean;
  publicId?: string;
  url?: string;
  error?: string;
}

/**
 * Upload a file directly to Cloudinary with progress tracking.
 * Uses XMLHttpRequest for real upload progress events.
 */
export function uploadToCloudinary(
  file: File,
  opts: {
    folder?: string;
    onProgress?: (progress: UploadProgress) => void;
  } = {}
): Promise<{ publicId: string; url: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', opts.folder ?? 'coven');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && opts.onProgress) {
        opts.onProgress({ percent: Math.round((e.loaded / e.total) * 100), done: false });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText);
        opts.onProgress?.({ percent: 100, done: true, publicId: res.public_id, url: res.secure_url });
        resolve({ publicId: res.public_id, url: res.secure_url });
      } else {
        // Graceful fallback to DataURL so local minting never fails
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          opts.onProgress?.({ percent: 100, done: true, publicId: 'local_' + Date.now(), url });
          resolve({ publicId: 'local_' + Date.now(), url });
        };
        reader.onerror = () => {
          const msg = `Upload failed: ${xhr.statusText}`;
          opts.onProgress?.({ percent: 0, done: true, error: msg });
          reject(new Error(msg));
        };
        reader.readAsDataURL(file);
      }
    });

    xhr.addEventListener('error', () => {
      // Graceful fallback to DataURL so network error doesn't block minting
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        opts.onProgress?.({ percent: 100, done: true, publicId: 'local_' + Date.now(), url });
        resolve({ publicId: 'local_' + Date.now(), url });
      };
      reader.onerror = () => {
        const msg = 'Network error during upload';
        opts.onProgress?.({ percent: 0, done: true, error: msg });
        reject(new Error(msg));
      };
      reader.readAsDataURL(file);
    });

    xhr.send(form);
  });
}

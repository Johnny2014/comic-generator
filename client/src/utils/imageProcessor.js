import heic2any from 'heic2any';
import { MAX_FILE_SIZE } from '../constants';

/**
 * Convert HEIC file to JPEG Blob
 */
export async function convertHeicToJpeg(file) {
    try {
        const blob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
        });
        // heic2any returns a single blob or an array of blobs
        return Array.isArray(blob) ? blob[0] : blob;
    } catch (err) {
        console.error('HEIC conversion failed:', err);
        throw new Error('HEIC 格式转换失败，请尝试其他格式');
    }
}

/**
 * Load an image from a File or Blob into an HTMLImageElement
 */
export function loadImage(source) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = typeof source === 'string' ? source : URL.createObjectURL(source);

        img.onload = () => resolve({ img, url });
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = url;
    });
}

/**
 * Resize and crop image to fit a target aspect ratio if needed
 * (Mostly used for generating thumbnails or preparing for Canvas)
 */
export function getContainRatio(imgWidth, imgHeight, containerWidth, containerHeight) {
    const wRatio = containerWidth / imgWidth;
    const hRatio = containerHeight / imgHeight;
    return Math.min(wRatio, hRatio);
}

export function getCoverRatio(imgWidth, imgHeight, containerWidth, containerHeight) {
    const wRatio = containerWidth / imgWidth;
    const hRatio = containerHeight / imgHeight;
    return Math.max(wRatio, hRatio);
}

/**
 * Process uploaded file: validation, HEIC conversion, and loading
 */
export async function processImageFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`文件太大 (最大 20MB)`);
    }

    let finalFile = file;
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';

    if (isHeic) {
        finalFile = await convertHeicToJpeg(file);
    }

    const { img, url: blobUrl } = await loadImage(finalFile);
    return {
        img,
        blobUrl,
        name: file.name,
        type: finalFile.type,
        size: finalFile.size,
        width: img.width,
        height: img.height
    };
}

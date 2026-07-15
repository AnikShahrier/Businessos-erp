import { Injectable } from '@nestjs/common';
import { cloudinary } from '../config/cloudinary.config';

@Injectable()
export class UploadService {
  /**
   * Upload a file to Cloudinary
   * @param file - The file buffer from multer
   * @param folder - Cloudinary folder path (e.g., 'businessos/avatars')
   * @returns The uploaded file URL and public_id
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'businessos/uploads'
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      // Upload to Cloudinary using upload_stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto', // Automatically detect file type
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      // Pipe the file buffer to Cloudinary
      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId - The Cloudinary public_id
   */
  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  /**
   * Generate an optimized image URL
   * @param url - Original Cloudinary URL
   * @param options - Transformation options
   */
  getOptimizedUrl(
    url: string,
    options: { width?: number; height?: number; quality?: number } = {}
  ): string {
    // Cloudinary URLs can be transformed by inserting parameters
    // Example: https://res.cloudinary.com/.../image/upload/w_300,h_300,q_auto/...
    
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    
    if (transformations.length === 0) return url;
    
    // Insert transformations into URL
    return url.replace(
      '/upload/',
      `/upload/${transformations.join(',')}/`
    );
  }
}
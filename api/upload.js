import { v2 as cloudinary } from 'cloudinary';
import busboy from 'busboy';
import { Writable } from 'stream';
import sharp from 'sharp';
import Settings from './_models/Settings.js';
import connectDB from './_lib/db.js';
import { protect, admin } from './_middleware/auth.js';
import { getPath } from './_lib/utils.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  await connectDB();
  
  const { method, url } = req;
  
  let path = url.split('?')[0];
  if (path.startsWith('/api/upload')) {
    path = path.substring('/api/upload'.length);
  }

  // Banner upload
  if (method === 'POST' && (path === '/banner' || path === '/api/banner' || path === '/upload/banner')) {
    const contentLength = parseInt(req.headers['content-length'] || 0);
    if (contentLength > MAX_FILE_SIZE) {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }
    
    return new Promise((resolve) => {
      const bb = busboy({ headers: req.headers });
      let fileBuffer = null;
      let filename = '';
      let fileField = '';

      bb.on('file', (fieldname, file, info) => {
        fileField = fieldname;
        filename = info.filename;
        
        const chunks = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on('finish', async () => {
        if (!fileBuffer) {
          resolve(res.status(400).json({ message: 'No file uploaded' }));
          return;
        }

        if (fileField !== 'banner') {
          resolve(res.status(400).json({ message: 'Invalid field name' }));
          return;
        }

        try {
          const optimizedBuffer = await sharp(fileBuffer)
            .resize(1920, 600, { fit: 'cover' })
            .webp({ quality: 90, effort: 6 })
            .toBuffer();

          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
              folder: 'tutor/banner',
              resource_type: 'image'
            }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
            
            uploadStream.end(optimizedBuffer);
          });

          await Settings.findOneAndUpdate(
            { key: 'banner' },
            { value: result.secure_url },
            { upsert: true }
          );

          resolve(res.json({
            url: result.secure_url
          }));
        } catch (error) {
          console.error('Upload error:', error);
          resolve(res.status(500).json({ message: error.message }));
        }
      });

      bb.on('error', (error) => {
        console.error('Busboy error:', error);
        resolve(res.status(400).json({ message: error.message }));
      });

      req.pipe(bb);
    });
  }

  // Get banner
  if (method === 'GET' && (path === '/banner' || path === '/api/banner')) {
    const settings = await Settings.findOne({ key: 'banner' });
    return res.json({ url: settings?.value || '' });
  }

  // Delete banner
  if (method === 'DELETE' && (path === '/banner' || path === '/api/banner')) {
    const authError = await protect(req, res);
    if (authError) return authError;

    const adminError = admin(req, res);
    if (adminError) return adminError;

    await Settings.findOneAndDelete({ key: 'banner' });
    return res.json({ message: 'Banner deleted' });
  }

  // Thumbnail upload
  if (method === 'POST' && (path === '/thumbnail' || path === '/api/thumbnail' || path === '/upload/thumbnail')) {
    const contentLength = parseInt(req.headers['content-length'] || 0);
    if (contentLength > MAX_FILE_SIZE) {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }
    
    return new Promise((resolve) => {
      const bb = busboy({ headers: req.headers });
      let fileBuffer = null;
      let filename = '';
      let fileField = '';

      bb.on('file', (fieldname, file, info) => {
        fileField = fieldname;
        filename = info.filename;
        
        const chunks = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on('finish', async () => {
        if (!fileBuffer) {
          resolve(res.status(400).json({ message: 'No file uploaded' }));
          return;
        }

        if (fileField !== 'thumbnail') {
          resolve(res.status(400).json({ message: 'Invalid field name' }));
          return;
        }

        try {
          const optimizedBuffer = await sharp(fileBuffer)
            .resize(800, 600, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 90, effort: 6 })
            .toBuffer();

          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
              folder: 'tutor',
              resource_type: 'image'
            }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
            
            uploadStream.end(optimizedBuffer);
          });

          resolve(res.json({
            url: result.secure_url
          }));
        } catch (error) {
          console.error('Upload error:', error);
          resolve(res.status(500).json({ message: error.message }));
        }
      });

      bb.on('error', (error) => {
        console.error('Busboy error:', error);
        resolve(res.status(400).json({ message: error.message }));
      });

      req.pipe(bb);
    });
  }

  // Notes/PDF upload
  if (method === 'POST' && (path === '/notes' || path === '/api/notes' || path === '/upload/notes')) {
    const contentLength = parseInt(req.headers['content-length'] || 0);
    if (contentLength > MAX_FILE_SIZE) {
      return res.status(400).json({ message: 'File size exceeds 10MB limit' });
    }
    
    return new Promise((resolve) => {
      const bb = busboy({ headers: req.headers });
      let fileBuffer = null;
      let fileField = '';

      bb.on('file', (fieldname, file, info) => {
        fileField = fieldname;
        
        const chunks = [];
        file.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      bb.on('finish', async () => {
        if (!fileBuffer) {
          resolve(res.status(400).json({ message: 'No file uploaded' }));
          return;
        }

        if (fileField !== 'notes') {
          resolve(res.status(400).json({ message: 'Invalid field name' }));
          return;
        }

        try {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
              folder: 'tutor/notes',
              resource_type: 'raw',
              format: 'pdf'
            }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
            
            uploadStream.end(fileBuffer);
          });

          resolve(res.json({
            url: result.secure_url,
            filename: result.original_filename
          }));
        } catch (error) {
          console.error('Upload error:', error);
          resolve(res.status(500).json({ message: error.message }));
        }
      });

      bb.on('error', (error) => {
        console.error('Busboy error:', error);
        resolve(res.status(400).json({ message: error.message }));
      });

      req.pipe(bb);
    });
  }

  return res.status(404).json({ message: 'Endpoint not found' });
}

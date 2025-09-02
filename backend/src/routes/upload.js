import express from 'express';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';
import upload from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Healthcheck para Cloudinary
router.get('/health', (req, res) => {
  const isConfigured = !!(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
  return res.json({ success: true, data: { cloudinaryConfigured: isConfigured } });
});

// Upload de uma única imagem
router.post('/image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const isConfigured = !!(
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
    );

    if (!isConfigured) {
      return res.status(500).json({ success: false, message: 'Cloudinary não configurado no servidor' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Arquivo não enviado' });
    }

    const folder = req.query.folder || 'amii/products';

    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload();

    return res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao fazer upload', error: error.message });
  }
});

// Exclusão de imagem por publicId
router.delete('/image/:publicId', protect, admin, async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.uploader.destroy(publicId);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao deletar imagem', error: error.message });
  }
});

export default router;

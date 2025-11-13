// backend/src/config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
// (Không cần import fileUpload ở đây nếu đã import ở index.js)

// Khởi tạo Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Middleware để xử lý upload file lên Cloudinary
 */
const uploadAvatar = async (req, res, next) => {
    // Kiểm tra xem có file nào được gửi lên không
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.avatar) {
        return res.status(400).json({ msg: 'No avatar file was uploaded.' });
    }

    const file = req.files.avatar; // 'avatar' là key formData từ frontend
    
    try {
        // Tải ảnh lên Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'finmate_avatars', // Thư mục lưu trữ trên Cloudinary
            format: 'webp' 
        });

        // SỬA LỖI TẠI ĐÂY:
        // Gắn URL trực tiếp vào req, không dùng req.body
        req.avatarURL = result.secure_url;
        
        // Chuyển sang controller để lưu URL vào DB
        next();
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        return res.status(500).json({ msg: 'File upload failed.' });
    }
};

module.exports = { cloudinary, uploadAvatar };
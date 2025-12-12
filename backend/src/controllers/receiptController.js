const Tesseract = require('tesseract.js');
const { cloudinary } = require('../config/cloudinaryConfig');

const scanReceipt = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên hình ảnh hóa đơn' });
    }

    const file = req.files.file;

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'finmate_receipts',
        format: 'webp'
    });

    const imageUrl = result.secure_url;

    const { data: { text } } = await Tesseract.recognize(
      imageUrl,
      'vie+eng'
    );

    return res.status(200).json({
      success: true,
      data: text
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi quét hóa đơn',
      error: error.message
    });
  }
};

module.exports = {
  scanReceipt
};
const Tesseract = require('tesseract.js');

const scanReceipt = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Vui lòng cung cấp URL hình ảnh' });
    }

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
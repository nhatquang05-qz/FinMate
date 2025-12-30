const Tesseract = require('tesseract.js');
const { cloudinary } = require('../config/cloudinaryConfig');

const extractDate = text => {
    console.log('--- Bắt đầu trích xuất ngày tháng ---');

    let normalizedText = text.replace(/(\d+)\s*[l|\\|.,]\s*(\d+)\s*[l|\\|.,]\s*(\d+)/g, '$1/$2/$3');
    console.log('Text sau khi chuẩn hóa sơ bộ:', normalizedText);

    const patterns = [
        /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/,

        /\b(\d{1,2})-(\d{1,2})-(\d{4})\b/,

        /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,

        /gày\s*(\d{1,2})\s*t(?:háng)?\.?\s*(\d{1,2})\s*n(?:ăm)?\.?\s*(\d{4}|\d{2})/i,

        /\b(\d{1,2})\s*[\/\-]\s*(\d{1,2})\s*[\/\-]\s*(\d{2})\b/,

        /\b(\d{2})(\d{2})(20\d{2})\b/,
    ];

    for (const regex of patterns) {
        const matches = [...normalizedText.matchAll(new RegExp(regex, 'g'))];

        if (matches.length > 0) {
            console.log(`=> Tìm thấy ${matches.length} kết quả khớp với pattern: ${regex}`);
        }

        for (const match of matches) {
            console.log('   -> Chuỗi khớp:', match[0]);
            let day, month, year;

            if (match[0].toLowerCase().includes('gày')) {
                day = parseInt(match[1], 10);
                month = parseInt(match[2], 10);
                year = parseInt(match[3], 10);
            } else if (regex.source.startsWith('\\b(\\d{4})')) {
                year = parseInt(match[1], 10);
                month = parseInt(match[2], 10);
                day = parseInt(match[3], 10);
            } else {
                day = parseInt(match[1], 10);
                month = parseInt(match[2], 10);
                year = parseInt(match[3], 10);
            }

            if (year < 100) year += 2000;

            console.log(`   -> Parsed: Day=${day}, Month=${month}, Year=${year}`);

            if (
                year >= 2020 &&
                year <= 2100 &&
                month >= 1 &&
                month <= 12 &&
                day >= 1 &&
                day <= 31
            ) {
                const result = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
                console.log(`*** CHỌN NGÀY: ${result} ***`);
                return result;
            } else {
                console.log('   -> Ngày không hợp lệ (logic), bỏ qua.');
            }
        }
    }
    console.log('--- Không tìm thấy ngày nào hợp lệ ---');
    return null;
};

const scanReceipt = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
            return res.status(400).json({ message: 'Vui lòng tải lên hình ảnh hóa đơn' });
        }

        const file = req.files.file;

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'finmate_receipts',
            format: 'webp',
        });

        const imageUrl = result.secure_url;
        console.log('--------------------------------------------------');
        console.log('Đã upload ảnh, bắt đầu OCR URL:', imageUrl);

        const {
            data: { text },
        } = await Tesseract.recognize(imageUrl, 'vie+eng');

        console.log('--- RAW TEXT TỪ OCR (BẮT ĐẦU) ---');
        console.log(text);
        console.log('--- RAW TEXT TỪ OCR (KẾT THÚC) ---');

        const date = extractDate(text);

        return res.status(200).json({
            success: true,
            data: text,
            date: date,
        });
    } catch (error) {
        console.error('Lỗi quét hóa đơn:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi quét hóa đơn',
            error: error.message,
        });
    }
};

module.exports = {
    scanReceipt,
};

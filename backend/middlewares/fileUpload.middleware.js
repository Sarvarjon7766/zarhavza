const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Fayllar saqlanadigan joy
const storagePath = path.join(__dirname, '../uploads/files')

// Papka mavjud bo‘lmasa — yaratamiz
if (!fs.existsSync(storagePath)) {
	fs.mkdirSync(storagePath, { recursive: true })
}

// Multer konfiguratsiyasi
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, storagePath)
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	},
})

// 📄 Faqat hujjat fayllariga ruxsat
const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx']

const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname).toLowerCase()
	if (allowedExtensions.includes(ext)) {
		cb(null, true)
	} else {
		cb(new Error('Faqat PDF, DOC, DOCX, PPT, PPTX fayllarni yuklash mumkin!'), false)
	}
}

// Fayl hajmi limiti (10 MB)
const fileUpload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 },
})

module.exports = fileUpload

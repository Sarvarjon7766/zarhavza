const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 📁 Fayllarni saqlash uchun papka
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir)
}

// ⚙️ Multer sozlamalari
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir)
	},
	filename: (req, file, cb) => {
		const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, uniqueName + path.extname(file.originalname))
	}
})

// 📸 Faqat rasm fayllarni qabul qilish
const fileFilter = (req, file, cb) => {
	const allowed = /jpeg|jpg|png|webp/
	const ext = path.extname(file.originalname).toLowerCase()
	if (allowed.test(ext)) {
		cb(null, true)
	} else {
		cb(new Error("Faqat rasm fayllarga ruxsat berilgan!"), false)
	}
}

// 📥 Middleware: bir nechta rasm yuklash
const uploadPhotos = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
}).array('photos', 10) // maksimum 10 ta rasm

module.exports = uploadPhotos

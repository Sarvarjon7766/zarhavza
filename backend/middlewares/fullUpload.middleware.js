const multer = require("multer")
const path = require("path")
const fs = require("fs")

// 📁 uploads papkasi mavjud bo'lmasa yaratish
const uploadDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true })
}

// ⚙️ Multer storage sozlamalari
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir)
	},
	filename: (req, file, cb) => {
		const unique = Date.now() + "-" + Math.round(Math.random() * 1e9)
		cb(null, unique + path.extname(file.originalname))
	},
})

// 📌 Faqat rasm va videolarga ruxsat beramiz
const fileFilter = (req, file, cb) => {
	// Agar fayl image/ yoki video/ bilan boshlansa → ruxsat
	if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
		cb(null, true)
	} else {
		cb(new Error("Faqat rasm va video fayllar qabul qilinadi!"), false)
	}
}

// ⚡ Multerni ishga tushirish
const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB limit
})

// 📥 20 tagacha fayl qabul qiladigan middleware
const fullUpload = upload.array("photos", 20)

module.exports = fullUpload

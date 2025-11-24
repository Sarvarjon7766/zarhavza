const multer = require("multer")
const path = require("path")
const fs = require("fs")

// 📂 Papkalar mavjud bo‘lmasa — yaratamiz
const createFolderIfNotExists = (folderPath) => {
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true })
	}
}
createFolderIfNotExists("uploads/photos")
createFolderIfNotExists("uploads/files")

// ⚙️ Storage sozlamasi
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (file.fieldname === "photo") {
			cb(null, "uploads/photos")
		} else if (file.fieldname === "file") {
			cb(null, "uploads/files")
		} else {
			cb(new Error("Noto‘g‘ri field nomi"))
		}
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
	},
})

// ✅ Fayl turi tekshiruvi
const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname).toLowerCase()

	if (file.fieldname === "photo") {
		if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return cb(null, true)
		else return cb(new Error("Faqat rasm fayllari yuklanadi!"))
	}

	if (file.fieldname === "file") {
		if ([".pdf", ".doc", ".docx", ".ppt", ".pptx"].includes(ext)) return cb(null, true)
		else return cb(new Error("Faqat PDF, DOC, DOCX, PPT, PPTX fayllar yuklanadi!"))
	}

	cb(new Error("Noto‘g‘ri fayl maydoni!"))
}

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
})

// 🔹 Bitta middleware orqali ikkita faylni qabul qilish
const multiUpload = upload.fields([
	{ name: "photo", maxCount: 1 },
	{ name: "file", maxCount: 1 },
])

module.exports = multiUpload

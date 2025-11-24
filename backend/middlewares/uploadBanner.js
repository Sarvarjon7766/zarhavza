const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Fayl saqlanadigan joy
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const uploadPath = path.join(__dirname, '../uploads/banner')
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true })
		}
		cb(null, uploadPath)
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname)
		const filename = `${file.fieldname}-${Date.now()}${ext}`
		cb(null, filename)
	}
})

// Fayl turlarini tekshirish
const fileFilter = (req, file, cb) => {

	const photoTypes = /jpeg|jpg|png|gif/
	const videoTypes = /mp4|mov|avi|mkv/
	const ext = path.extname(file.originalname).toLowerCase()

	if (file.fieldname === 'photo') {
		
		if (photoTypes.test(ext)) cb(null, true)
		else cb(new Error('Faqat rasm yoki gif fayl yuklang!'))
	} else if (file.fieldname === 'video') {
		if (videoTypes.test(ext)) cb(null, true)
		else cb(new Error('Faqat video fayl yuklang!'))
	} else {
		cb(new Error('Noto‘g‘ri fayl maydoni!'))
	}
}

// Bir nechta fayl uchun konfiguratsiya
const uploadBanner = multer({ storage, fileFilter }).fields([
	{ name: 'photo', maxCount: 1 },
	{ name: 'video', maxCount: 1 }
])

module.exports = uploadBanner

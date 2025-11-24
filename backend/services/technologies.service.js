const technologiesModel = require('../models/technologies.model')
const path = require('path')
const fs = require('fs')
class TechnologiesService {
	async create(data) {
		try {
			const technologies = await technologiesModel.create(data)
			if (technologies) {
				return { success: true, message: "Yangi texnologiyalar qo'shildi." }
			} else {
				return { success: false, message: "Texnologiya qo'shishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async update(id, data) {
		try {
			const technologies = await technologiesModel.findByIdAndUpdate(id, data, { new: true })
			if (technologies) {
				return { success: true, message: "Texnologiya yangilandi." }
			} else {
				return { success: false, message: "texnologiyani yangilashda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async deleted(id) {
		try {
			console.log(id)
			const technologies = await technologiesModel.findById(id)
			if (!technologies) {
				return { success: false, message: "Texnologiya topilmadi" }
			}
			if (technologies.photo) {
				const oldPhotoRelative = technologies.photo.replace(/^\/+/, "")
				const oldFilePath = path.join(__dirname, "../", oldPhotoRelative)
				if (fs.existsSync(oldFilePath)) {
					fs.unlinkSync(oldFilePath)
					console.log("🗑️ Eski rasm o‘chirildi:", oldFilePath)
				} else {
					console.log("⚠️ Rasm topilmadi:", oldFilePath)
				}
			}
			await technologiesModel.findByIdAndDelete(id)

			return { success: true, message: "Texnologiya va uning rasmi o‘chirildi" }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAll(lang) {
		try {
			const technologies = await technologiesModel.find()

			if (!technologies || technologies.length === 0) {
				return { success: false, message: "Texnologiya topilmadi", technologies: [] }
			}

			// 🔤 Tilni tekshiramiz (default: uz)
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"

			// 🧩 Har bir service obyektini tilga qarab qaytaramiz
			const localizedServices = technologies.map((item) => ({
				_id: item._id,
				title: item[`title_${selectedLang}`],
				description: item[`description_${selectedLang}`],
				photo: item.photo,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Texnologiyalar olindi ",
				technologies: localizedServices,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAlll() {
		try {
			const technologies = await technologiesModel.find()
			if (!technologies || technologies.length === 0) {
				return { success: false, message: "Dasturlar topilmadi", technologies: [] }
			}
			return {
				success: true,
				message: "Dasturlar olindi ",
				technologies,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
}
module.exports = new TechnologiesService()
const programModel = require('../models/programs.model')
const path = require('path')
const fs = require('fs')
class ProgramsService {
	async create(data) {
		try {
			const program = await programModel.create(data)
			if (program) {
				return { success: true, message: "Yangi dastur qo'shildi." }
			} else {
				return { success: false, message: "Dastur qo'shishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async update(id, data) {
		try {
			const program = await programModel.findByIdAndUpdate(id, data, { new: true })
			if (program) {
				return { success: true, message: "Yangi dastur qo'shildi." }
			} else {
				return { success: false, message: "Dastur qo'shishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async deleted(id) {
		try {
			const program = await programModel.findById(id)
			if (!program) {
				return { success: false, message: "Dasturlar topilmadi" }
			}
			if (program.photo) {
				const oldPhotoRelative = program.photo.replace(/^\/+/, "")
				const oldFilePath = path.join(__dirname, "../", oldPhotoRelative)
				if (fs.existsSync(oldFilePath)) {
					fs.unlinkSync(oldFilePath)
					console.log("🗑️ Eski rasm o‘chirildi:", oldFilePath)
				} else {
					console.log("⚠️ Rasm topilmadi:", oldFilePath)
				}
			}
			await programModel.findByIdAndDelete(id)

			return { success: true, message: "Dastur va uning rasmi o‘chirildi" }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAll(lang) {
		try {
			const programs = await programModel.find()

			if (!programs || programs.length === 0) {
				return { success: false, message: "Dasturlar topilmadi", programs: [] }
			}

			// 🔤 Tilni tekshiramiz (default: uz)
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"

			// 🧩 Har bir service obyektini tilga qarab qaytaramiz
			const localizedServices = programs.map((item) => ({
				_id: item._id,
				title: item[`title_${selectedLang}`],
				description: item[`description_${selectedLang}`],
				photo: item.photo,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Dasturlar olindi ",
				programs: localizedServices,
			}
		} catch (error) {

		}
	}
	async getAlll() {
		try {
			const programs = await programModel.find()
			if (!programs || programs.length === 0) {
				return { success: false, message: "Dasturlar topilmadi", programs: [] }
			}
			return {
				success: true,
				message: "Dasturlar olindi ",
				programs,
			}
		} catch (error) {

		}
	}
}

module.exports = new ProgramsService()
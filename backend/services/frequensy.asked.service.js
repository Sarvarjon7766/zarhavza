const askedModel = require('../models/frequensy.asked')


class AskedService {
	async create(data) {
		try {
			const asked = await askedModel.create(data)
			if (asked) {
				return { success: true, message: "Savol va javob muvafaqqiyatli qo'shildi" }
			} else {
				return { success: false, message: "Savol qo'shishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAll(lang) {
		try {
			const askeds = await askedModel.find()
			if (!askeds || askeds.length === 0) {
				return { success: false, message: "Xizmatlar topilmadi", askeds: [] }
			}

			// 🔤 Tilni tekshiramiz (default: uz)
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"

			// 🧩 Har bir service obyektini tilga qarab qaytaramiz
			const localizedServices = askeds.map((item) => ({
				_id: item._id,
				question: item[`question_${selectedLang}`],
				ask: item[`ask_${selectedLang}`],
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Xizmatlar olindi",
				askeds: localizedServices,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async update(id, data) {
		try {
			const updatedata = await askedModel.findByIdAndUpdate(id, data, { new: true })
			if (updatedata) {
				return {
					success: true,
					message: "Xizmatlar olindi",
					asked: updatedata,
				}
			} else {
				return { success: false, message: "Yangilashda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async deleted(id) {
		try {
			await askedModel.findByIdAndDelete(id)
			return {
				success: true,
				message: "Xizmatlar olindi",

			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAlll() {
		try {
			const askeds = await askedModel.find()
			if (!askeds || askeds.length === 0) {
				return { success: false, message: "Xizmatlar topilmadi", askeds: [] }
			}
			return {
				success: true,
				message: "Xizmatlar olindi",
				askeds: askeds,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
}
module.exports = new AskedService()
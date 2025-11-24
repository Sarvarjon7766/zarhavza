const opendataModel = require('../models/opendata.model')

class OpenDataService {
	async create(data) {
		try {
			const about = await opendataModel.create(data)
			if (about) {
				return { success: true, message: "Yangi ma'lumot qo'shildi" }
			} else {
				return { success: false, message: "Yangi ma'lumot qo'shishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async update(id, data) {
		try {
			const about = await opendataModel.findByIdAndUpdate(id, data, { new: true })
			if (about) {
				return { success: true, message: "Ma'lumot yangilandi" }
			} else {
				return { success: false, message: "Ma'lumot yangilashda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async deleted(id) {
		try {
			await opendataModel.findByIdAndDelete(id)
			return { success: true, message: "Ma'lumot o'chirildi" }

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAll(lang) {
		try {
			const opendatas = await opendataModel.find()

			if (!opendatas || opendatas.length === 0) {
				return { success: false, message: "Ma'lumotlar topilmadi", opendatas: [] }
			}

			// 🔤 Tilni tekshiramiz (default: uz)
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"
			const localizedServices = opendatas.map((item) => ({
				_id: item._id,
				title: item[`title_${selectedLang}`],
				description: item[`description_${selectedLang}`],
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Ma'lumotlar olindi",
				opendatas: localizedServices,
			}

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAlll() {
		try {
			const opendatas = await opendataModel.find()
			if (!opendatas || opendatas.length === 0) {
				return { success: false, message: "Ma'lumotlar topilmadi", opendatas: [] }
			}
			return {
				success: true,
				message: "Ma'lumotlar olindi",
				opendatas,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}
module.exports = new OpenDataService()
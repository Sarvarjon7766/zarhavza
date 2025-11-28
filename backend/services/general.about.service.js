const generalaboutModel = require('../models/general.about.model')

class GeneralAboutService {
	async create(data) {
		try {
			const about = await generalaboutModel.create(data)
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
			const about = await generalaboutModel.findByIdAndUpdate(id, data, { new: true })
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
			await generalaboutModel.findByIdAndDelete(id)
			return { success: true, message: "Ma'lumot o'chirildi" }

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAll(key, lang) {
		try {
			console.log(key)
			console.log(lang)
			const abouts = await generalaboutModel.find({ key })

			if (!abouts || abouts.length === 0) {
				return { success: false, message: "Ma'lumotlar topilmadi", abouts: [] }
			}

			// 🔤 Tilni tekshiramiz (default: uz)
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"
			const localizedServices = abouts.map((item) => ({
				_id: item._id,
				title: item[`title_${selectedLang}`],
				description: item[`description_${selectedLang}`],
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Ma'lumotlar olindi",
				abouts: localizedServices,
			}

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAlll(key) {
		try {
			const abouts = await generalaboutModel.find({ key })
			if (!abouts || abouts.length === 0) {
				return { success: false, message: "Ma'lumotlar topilmadi", abouts: [] }
			}
			return {
				success: true,
				message: "Ma'lumotlar olindi",
				abouts,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}

}
module.exports = new GeneralAboutService()
const activityModel = require('../models/activity.model')

class ActivityService {
	async create(data) {
		try {
			const about = await activityModel.create(data)
			if (about) {
				return { success: true, message: "Yangi faoliyat qo'shildi" }
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
			const about = await activityModel.findByIdAndUpdate(id, data, { new: true })
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
			await activityModel.findByIdAndDelete(id)
			return { success: true, message: "Ma'lumot o'chirildi" }

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAll(lang) {
		try {
			const activitys = await activityModel.find()

			if (!activitys || activitys.length === 0) {
				return { success: false, message: "Ma'lumotlar topilmadi", activitys: [] }
			}

			// 🔤 Tilni tekshiramiz (default: uz)
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"
			const localizedServices = activitys.map((item) => ({
				_id: item._id,
				title: item[`title_${selectedLang}`],
				description: item[`description_${selectedLang}`],
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Ma'lumotlar olindi",
				activitys: localizedServices,
			}

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAlll() {
		try {
			const activitys = await activityModel.find()
			if (!activitys || activitys.length === 0) {
				return { success: false, message: "Ma'lumotlar topilmadi", activitys: [] }
			}
			return {
				success: true,
				message: "Ma'lumotlar olindi",
				activitys,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}
module.exports = new ActivityService()
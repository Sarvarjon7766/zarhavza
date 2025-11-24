const locationModel = require('../models/location.model')

class LocationService {
	async create(data) {
		try {
			const location = await locationModel.create(data)
			if (location) {
				return { success: true, message: "Yangi lokatsiya yaratildi " }
			} else {
				return { success: false, message: "Lokatsiya qo'shishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async update(id, data) {
		try {
			const location = await locationModel.findByIdAndUpdate(id, data, { new: true })
			console.log(location)
			if (location) {
				return { success: true, message: "Manzil yangilandi" }
			} else {
				return { success: false, message: "Yangilashda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async deleted(id) {
		try {
			await locationModel.findByIdAndDelete(id)
			return { success: true, message: "Manzil o'chirildi " }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAll(lang) {
		try {
			const locations = await locationModel.find()

			if (!locations || locations.length === 0) {
				return { success: false, message: "Lokasiyalar topilmadi", locations: [] }
			}
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"
			const localizedServices = locations.map((item) => ({
				_id: item._id,
				title: item[`title_${selectedLang}`],
				address: item[`address_${selectedLang}`],
				workHours: item[`workHours_${selectedLang}`],
				coord: item.coord,
				phone: item.phone,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Lokatsiyalar olindi",
				locations: localizedServices,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAlll() {
		try {
			const locations = await locationModel.find()

			if (!locations || locations.length === 0) {
				return { success: false, message: "Lokasiyalar topilmadi", locations: [] }
			}
			return {
				success: true,
				message: "Lokatsiyalar olindi",
				locations,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}
module.exports = new LocationService()
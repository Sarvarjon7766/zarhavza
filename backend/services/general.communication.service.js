const generalcommunicationModel = require('../models/general.communication.model')
const fs = require('fs')
const path = require('path')

class GeneralCommunicationService {
	async create(data) {
		try {
			const news = await generalcommunicationModel.create(data)
			if (news) {
				return { success: true, message: "Aloqa ma'lumotlari qo'shildi" }
			} else {
				return { success: false, message: "Aloqa ma'lumotlari qo'shishda xatolik." }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async update(id, data) {
		try {
			const updated = await generalcommunicationModel.findByIdAndUpdate(id, data, { new: true })
			if (updated) {
				return { success: true, message: "Aloqa ma'lumotlari yangilandi", data: updated }
			} else {
				return { success: false, message: "Yangilanishda xatolik yuz berdi" }
			}

		} catch (error) {
			console.error("❌ Xatolik:", error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async deleted(id) {
		try {
			await generalcommunicationModel.findByIdAndDelete(id)
			return { success: true, message: "Aloqa ma'lumotlari o'chirildi" }
		} catch (error) {
			console.error("❌ Xatolik:", error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAll(key, lang) {
		try {
			const communications = await generalcommunicationModel.find({ key })

			if (!communications || communications.length === 0) {
				return { success: false, message: "Aloqa ma'lumotlari topilmadi", communications: [] }
			}

			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"

			const localizedServices = communications.map((item) => ({
				_id: item._id,
				sarlavha: item[`sarlavha_${selectedLang}`],
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Aloqa ma'lumotlari olindi",
				communications: localizedServices,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAlll(key) {
		try {
			const communications = await generalcommunicationModel.find({ key })

			if (!communications || communications.length === 0) {
				return { success: false, message: "Aloqa ma'lumotlari topilmadi", communications: [] }
			}
			return {
				success: true,
				message: "Rahbarlar olindi",
				communications: communications,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}

module.exports = new GeneralCommunicationService()
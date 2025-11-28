const socialnetworkModel = require('../models/social.networks.model')

class SocialNetworksService {
	async create(data) {
		try {
			const network = await socialnetworkModel.create(data)
			if (network) {
				return { success: true, message: "Ijtimoiy tarmoq qo'shildi" }
			} else {
				return { success: false, message: "Ijtimoiy tarmoq qo'shishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async update(id, data) {
		try {
			const network = await socialnetworkModel.findByIdAndUpdate(id, data, { new: true })
			if (network) {
				return { success: true, message: "Ijtimoiy tarmoq yangilandi" }
			} else {
				return { success: false, message: "Ijtimoiy tarmoq yangilashda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async deleted(id) {
		try {
			await socialnetworkModel.findByIdAndDelete(id)
			return { success: true, message: "Ijtimoiy tarmoq o'chirildi" }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAll() {
		try {
			const datas = await socialnetworkModel.find()
			return { success: true, message: "Ijtimoiy tarmoqlar olindi", data: datas }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}
module.exports = new SocialNetworksService()
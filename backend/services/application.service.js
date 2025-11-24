const applicationModel = require('../models/applications.model')

class ApplicationService {
	async create(data) {
		try {
			const application = await applicationModel.create(data)
			if (application) {
				return { success: true, message: "Murojaatingiz muvafaqiyatli yuborildi !!!" }
			} else {
				return { success: false, message: "Murojaat yuborishda xatolik yuk berdi" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAll() {
		try {
			const applications = await applicationModel.find().sort({ _id: -1 })
			if (applications) {
				return { success: true, message: "Murojaatingiz muvafaqiyatli olindi", applications }
			} else {
				return { success: false, message: "Murojaat olishda xatolik yuk berdi", applications: [] }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async updateStatus(id, data) {
		try {
			const application = await applicationModel.findByIdAndUpdate(id, data, { new: true })
			if (application) {
				return { success: true, message: "Murojaatingiz muvafaqiyatli yangilandi", application }
			} else {
				return { success: false, message: "Murojaat olishda xatolik yuk berdi", application: [] }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
}

module.exports = new ApplicationService()
const contactModel = require('../models/contact.model')

class ContactService {
	async create(data) {
		try {
			const contact = await contactModel.create(data)
			if (contact) {
				return { success: true, message: "Yangi Contact qo'shildi." }
			} else {
				return { success: false, message: "Yangi contact qo'shishda xatolik." }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async update(id, data) {
		try {
			const contact = await contactModel.findByIdAndUpdate(id, data, { new: true })
			if (contact) {
				return { success: true, message: "Contact yangilandi." }
			} else {
				return { success: false, message: "Contact yangilashda xatolik." }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async deleted(id, data) {
		try {
			await contactModel.findByIdAndDelete(id)
			return { success: true, message: "Contact o'chirildi." }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAll() {
		try {
			const contacts = await contactModel.find().sort({ _id: -1 })
			if (!contacts || contacts.length === 0) {
				return { success: false, message: "Contactlar", contacts: [] }
			}
			return {
				success: true,
				message: "Contactlar olindi.",
				contacts,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getActive(lang) {
		try {
			const contact = await contactModel.findOne({ isActive: true })

			if (!contact) {
				return { success: false, contact: null, message: "Active contact topilmadi" }
			}

			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"

			const localizedContact = {
				_id: contact._id,
				address: contact[`address_${selectedLang}`],
				workin: contact[`workin_${selectedLang}`],
				phone: contact.phone,
				phone_faks: contact.phone_faks,
				email: contact.email,
				createdAt: contact.createdAt,
				updatedAt: contact.updatedAt,
			}

			return { success: true, contact: localizedContact, message: "Active contact olindi." }

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}

}
module.exports = new ContactService()
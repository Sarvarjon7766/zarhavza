const announcementModel = require('../models/announcement.model')
const fs = require('fs')
const path = require('path')

class AnnouncementService {
	async create(data) {
		try {
			const announcement = await announcementModel.create(data)
			if (announcement) {
				return { success: true, message: "Yangi e'lon qo'shildi" }
			} else {
				return { success: false, message: "E'lon qo'shishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async update(id, data) {
		try {
			const announcement = await announcementModel.findById(id)
			if (!announcement) {
				return { success: false, message: "E'lon topilmadi" }
			}

			let updatedPhotos = announcement.photos || []

			// 🔹 removedPhotos bo'lsa fayllarni o'chirish va qolganlarni ajratish
			if (data.removedPhotos) {
				const removedFiles = Array.isArray(data.removedPhotos)
					? data.removedPhotos
					: [data.removedPhotos]

				for (const filePath of removedFiles) {
					const absolutePath = path.join(__dirname, '..', filePath)
					if (fs.existsSync(absolutePath)) {
						fs.unlinkSync(absolutePath)
						console.log(`✅ Fayl o‘chirildi: ${filePath}`)
					} else {
						console.log(`⚠️ Fayl topilmadi: ${filePath}`)
					}
				}

				updatedPhotos = updatedPhotos.filter(photo => !removedFiles.includes(photo))
				delete data.removedPhotos
			}

			// 🔹 yangi photos bo‘lsa eski rasmlarga qo‘shish
			if (data.photos && data.photos.length) {
				updatedPhotos = [...updatedPhotos, ...data.photos]
			}

			// 🔹 data.photos ni yangilash
			data.photos = updatedPhotos

			// 🔹 yangilash
			const updated = await announcementModel.findByIdAndUpdate(id, data, { new: true })

			if (updated) {
				return { success: true, message: "E'lonlar yangilandi", data: updated }
			} else {
				return { success: false, message: "E'lon xatolik yuz berdi" }
			}

		} catch (error) {
			console.error("❌ Xatolik:", error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async deleted(id) {
		try {
			const announcement = await announcementModel.findById(id)
			if (!announcement) {
				return { success: false, message: "Yangilik topilmadi" }
			}
			if (announcement.photos && announcement.photos.length) {
				for (const photoPath of announcement.photos) {
					const filePath = path.join(__dirname, '..', photoPath)
					fs.unlink(filePath, (err) => {
						if (err) {
							console.error(`❌ Fayl o'chirilmadi: ${filePath}`, err)
						} else {
							console.log(`✅ Fayl o'chirildi: ${filePath}`)
						}
					})
				}
			}
			await announcementModel.findByIdAndDelete(id)
			return { success: true, message: "E'lon va rasmlar o'chirildi" }
		} catch (error) {
			console.error("❌ Xatolik:", error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAll(lang) {
		try {
			const announcements = await announcementModel.find().sort({ _id: -1 })

			if (!announcements || announcements.length === 0) {
				return { success: false, message: "E'lonlar topilmadi", announcements: [] }
			}

			// 🔤 Tilni tekshiramiz (default: uz)
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"

			// 🧩 Har bir service obyektini tilga qarab qaytaramiz
			const localizedServices = announcements.map((item) => ({
				_id: item._id,
				title: item[`title_${selectedLang}`],
				description: item[`description_${selectedLang}`],
				photos: item.photos,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "E'lonlar olindi",
				announcements: localizedServices,
			}
		} catch (error) {

		}
	}
	async getAlll() {
		try {
			const announcements = await announcementModel.find().sort({ _id: -1 })

			if (!announcements || announcements.length === 0) {
				return { success: false, message: "E'lonlar topilmadi", announcements: [] }
			}

			return {
				success: true,
				message: "E'lonlar olindi",
				announcements,
			}
		} catch (error) {

		}
	}
}
module.exports = new AnnouncementService()
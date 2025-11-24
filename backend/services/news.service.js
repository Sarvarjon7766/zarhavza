const newsModel = require('../models/news.model')
const fs = require('fs')
const path = require('path')

class NewsService {
	async create(data) {
		try {
			const news = await newsModel.create(data)
			if (news) {
				return { success: true, message: "Yangilik qo'shildi" }
			} else {
				return { success: false, message: "Yangilik qo'shishda xatolik." }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async update(id, data) {
		try {
			const news = await newsModel.findById(id)
			if (!news) {
				return { success: false, message: "Yangilik topilmadi" }
			}

			let updatedPhotos = news.photos || []

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
			const updated = await newsModel.findByIdAndUpdate(id, data, { new: true })

			if (updated) {
				return { success: true, message: "Yangilik yangilandi", data: updated }
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
			const news = await newsModel.findById(id)
			if (!news) {
				return { success: false, message: "Yangilik topilmadi" }
			}
			if (news.photos && news.photos.length) {
				for (const photoPath of news.photos) {
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
			await newsModel.findByIdAndDelete(id)
			return { success: true, message: "Yangilik va rasmlar o'chirildi" }
		} catch (error) {
			console.error("❌ Xatolik:", error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAll(lang) {
		try {
			const news = await newsModel.find().sort({ _id: -1 })

			if (!news || news.length === 0) {
				return { success: false, message: "Xizmatlar topilmadi", news: [] }
			}

			// 🔤 Tilni tekshiramiz (default: uz)
			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"

			// 🧩 Har bir service obyektini tilga qarab qaytaramiz
			const localizedServices = news.map((item) => ({
				_id: item._id,
				title: item[`title_${selectedLang}`],
				description: item[`description_${selectedLang}`],
				photos: item.photos,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Xizmatlar olindi",
				news: localizedServices,
			}
		} catch (error) {

		}
	}
	async getAlll() {
		try {
			const news = await newsModel.find().sort({ _id: -1 })

			if (!news || news.length === 0) {
				return { success: false, message: "Xizmatlar topilmadi", news: [] }
			}
			return {
				success: true,
				message: "Xizmatlar olindi",
				news: news,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}

module.exports = new NewsService()
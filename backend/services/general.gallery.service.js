const generalgallaryModel = require('../models/general.gallery.model')
const fs = require('fs')
const path = require('path')

class GeneralGalleryService {
	async create(data) {
		try {
			const gallary = await generalgallaryModel.create(data)
			return gallary
				? { success: true, message: "Yangi Rasmlar qo'shildi" }
				: { success: false, message: "Rasmlar qo'shishda xatolik" }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}

	async update(id, data) {
		try {
			const gallary = await generalgallaryModel.findById(id)
			if (!gallary) {
				return { success: false, message: "E'lon topilmadi" }
			}

			let updatedPhotos = gallary.photos || []

			// 🔥 O‘chiriladigan rasmlar
			if (data.removedPhotos) {
				const removedFiles = Array.isArray(data.removedPhotos)
					? data.removedPhotos
					: [data.removedPhotos]

				for (const filePath of removedFiles) {
					const fixed = filePath.replace(/^\//, "") // boshidagi "/" ni olib tashlaydi
					const absolute = path.join(__dirname, "..", fixed)

					try {
						if (fs.existsSync(absolute)) {
							fs.unlinkSync(absolute)
							console.log(`🟢 O‘chirildi: ${absolute}`)
						} else {
							console.log(`⚠️ Fayl topilmadi: ${absolute}`)
						}
					} catch (err) {
						console.log(`❌ O‘chirishda xatolik: ${absolute}`, err)
					}
				}

				updatedPhotos = updatedPhotos.filter(p => !removedFiles.includes(p))
				delete data.removedPhotos
			}

			// 📌 Yangi rasmlar qo‘shish
			if (data.photos && data.photos.length) {
				updatedPhotos = [...updatedPhotos, ...data.photos]
			}

			data.photos = updatedPhotos

			const updated = await generalgallaryModel.findByIdAndUpdate(id, data, { new: true })

			return updated
				? { success: true, message: "E'lonlar yangilandi", data: updated }
				: { success: false, message: "E'lon xatolik yuz berdi" }

		} catch (error) {
			console.error("❌ Xatolik:", error)
			return { success: false, message: "Server xatosi" }
		}
	}

	async deleted(id) {
		try {
			const gallary = await generalgallaryModel.findById(id)
			if (!gallary) {
				return { success: false, message: "Gallarylar topilmadi" }
			}

			for (const photo of gallary.photos) {
				const absolute = path.join(__dirname, "..", photo.replace(/^\//, ""))
				if (fs.existsSync(absolute)) {
					fs.unlinkSync(absolute)
				}
			}

			await generalgallaryModel.findByIdAndDelete(id)
			return { success: true, message: "Gallary va rasmlar o'chirildi" }
		} catch (error) {
			console.error(error)
			return { success: false, message: "Server xatosi" }
		}
	}

	async getAll(key, lang) {
		try {
			const gallarys = await generalgallaryModel.find({ key }).sort({ _id: -1 })

			if (!gallarys.length) {
				return { success: false, message: "Gallary topilmadi", gallarys: [] }
			}

			const langs = ["uz", "ru", "en"]
			const selected = langs.includes(lang) ? lang : "uz"

			const list = gallarys.map(item => ({
				_id: item._id,
				title: item[`title_${selected}`],
				photos: item.photos,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt
			}))

			return { success: true, message: "Gallarylar olindi", gallarys: list }

		} catch (e) {
			console.log(e)
			return { success: false, message: "Server error" }
		}
	}

	async getAlll(key) {
		try {
			const gallarys = await generalgallaryModel.find({ key }).sort({ _id: -1 })

			return gallarys.length
				? { success: true, message: "Gallarylar olindi", gallarys }
				: { success: false, message: "Gallarylar topilmadi", gallarys: [] }
		} catch (e) {
			console.log(e)
			return { success: false, message: "Server error" }
		}
	}
}

module.exports = new GeneralGalleryService()

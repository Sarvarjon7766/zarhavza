const bannerModel = require('../models/banner.model')
const path = require('path')
const fs = require('fs')

class BannerService {
	async create(data) {
		try {
			const bannerdata = await bannerModel.create(data)
			if (bannerdata) {
				return { success: true, message: "Banner ma'lumotlari saqlandi" }
			} else {
				return { success: false, message: "Banner ma'lumotlarini saqlashda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async update(id, data) {
		try {
			const existing = await bannerModel.findById(id)
			if (!existing) return { success: false, message: 'Banner topilmadi' }
			const uploadsDir = path.join(__dirname, '../uploads/banner')
			if (data.photo && existing.photo && existing.photo !== data.photo) {
				const oldPhotoPath = path.join(uploadsDir, path.basename(existing.photo))
				if (fs.existsSync(oldPhotoPath)) {
					fs.unlinkSync(oldPhotoPath)
					console.log(`Eski rasm o‘chirildi: ${oldPhotoPath}`)
				}
			} else if (!data.photo) {
				data.photo = existing.photo
			}
			if (data.video && existing.video && existing.video !== data.video) {
				const oldVideoPath = path.join(uploadsDir, path.basename(existing.video))
				if (fs.existsSync(oldVideoPath)) {
					fs.unlinkSync(oldVideoPath)
					console.log(`Eski video o‘chirildi: ${oldVideoPath}`)
				}
			} else if (!data.video) {
				data.video = existing.video
			}
			const banner = await bannerModel.findByIdAndUpdate(id, data, { new: true })
			return { success: true, message: 'Banner yangilandi', banner }
		} catch (error) {
			console.log(error)
			return { success: false, message: 'Banner yangilashda xatolik yuz berdi' }
		}
	}
	async deleted(id) {
		try {
			const banner = await bannerModel.findById(id)
			if (!banner) {
				return { success: false, message: "Banner topilmadi" }
			}
			const uploadsDir = path.join(__dirname, '../uploads/banner')
			if (banner.photo) {
				const photoPath = path.join(uploadsDir, path.basename(banner.photo))
				if (fs.existsSync(photoPath)) {
					fs.unlinkSync(photoPath)
					console.log(`🖼️ Eski rasm o‘chirildi: ${photoPath}`)
				}
			}
			if (banner.video) {
				const videoPath = path.join(uploadsDir, path.basename(banner.video))
				if (fs.existsSync(videoPath)) {
					fs.unlinkSync(videoPath)
					console.log(`🎥 Eski video o‘chirildi: ${videoPath}`)
				}
			}
			await bannerModel.findByIdAndDelete(id)

			return { success: true, message: "Banner va fayllar muvaffaqiyatli o‘chirildi" }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Banner o‘chirishda xatolik yuz berdi" }
		}
	}

	async getOne() {
		try {
			const lastBanner = await bannerModel.findOne({ isActive: true }).sort({ _id: -1 })
			if (lastBanner) {
				return { success: true, message: "Banner ma'lumotlari", banner: lastBanner }
			} else {
				return { success: false, message: "Banner ma'lumotlari mavjudmas", banner: {} }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAll() {
		try {
			const lastBanner = await bannerModel.find()
			if (lastBanner) {
				return { success: true, message: "Banner ma'lumotlari", banners: lastBanner }
			} else {
				return { success: false, message: "Banner ma'lumotlari mavjudmas", banners: {} }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}
module.exports = new BannerService()
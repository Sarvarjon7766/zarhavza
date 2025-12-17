const generalleaderModel = require('../models/general.leader.model')
const fs = require('fs')
const path = require('path')

class GeneralLeaderService {
	async create(data) {
		try {
			const news = await generalleaderModel.create(data)
			if (news) {
				return { success: true, message: "Rahbar qo'shildi" }
			} else {
				return { success: false, message: "Rahbar qo'shishda xatolik." }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async update(id, data) {
		try {
			const leader = await generalleaderModel.findById(id)
			if (!leader) {
				return { success: false, message: "Rahbar topilmadi" }
			}
			let exsistphoto = leader.photo
			if (data.photo) {
				const absolutePath = path.join(__dirname, '..', exsistphoto)
				if (fs.existsSync(absolutePath)) {
					fs.unlinkSync(absolutePath)
					console.log(`✅ Fayl o‘chirildi: ${exsistphoto}`)
				} else {
					console.log(`⚠️ Fayl topilmadi: ${exsistphoto}`)
				}
			} else {
				data.photo = exsistphoto
			}

			const updated = await generalleaderModel.findByIdAndUpdate(id, data, { new: true })

			if (updated) {
				return { success: true, message: "Rahbar yangilandi", data: updated }
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
			const leader = await generalleaderModel.findById(id)
			if (!leader) {
				return { success: false, message: "Rahbar topilmadi" }
			}
			if (leader.photo) {
				const filePath = path.join(__dirname, '..', leader.photo)
				console.log(filePath)
				fs.unlink(filePath, (err) => {
					if (err) {
						console.error(`❌ Fayl o'chirilmadi: ${filePath}`, err)
					} else {
						console.log(`✅ Fayl o'chirildi: ${filePath}`)
					}
				})
			}
			await generalleaderModel.findByIdAndDelete(id)
			return { success: true, message: "Yangilik va rasmlar o'chirildi" }
		} catch (error) {
			console.error("❌ Xatolik:", error)
			return { success: false, message: "Server xatosi" }
		}
	}
	async getAll(key, lang) {
		try {
			const leaders = await generalleaderModel.find({ key })

			if (!leaders || leaders.length === 0) {
				return { success: false, message: "Rahbarlar topilmadi", news: [] }
			}

			const validLangs = ["uz", "ru", "en"]
			const selectedLang = validLangs.includes(lang) ? lang : "uz"

			const localizedServices = leaders.map((item) => ({
				_id: item._id,
				fullName: item[`fullName_${selectedLang}`],
				position: item[`position_${selectedLang}`],
				address: item[`address_${selectedLang}`],
				workin: item[`workin_${selectedLang}`],
				task: item[`task_${selectedLang}`],
				biography: item[`biography_${selectedLang}`],
				photo: item.photo,
				email: item.email,
				phone: item.phone,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			}))

			return {
				success: true,
				message: "Rahbarlar olindi",
				leaders: localizedServices,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAlll(key) {
		try {
			const leaders = await generalleaderModel.find({ key })

			if (!leaders || leaders.length === 0) {
				return { success: false, message: "Rahbarlar topilmadi", news: [] }
			}
			return {
				success: true,
				message: "Rahbarlar olindi",
				leaders: leaders,
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}

module.exports = new GeneralLeaderService()
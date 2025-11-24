const TechnologiesService = require('../services/technologies.service')
const technologiesModel = require('../models/technologies.model')
const path = require('path')
const fs = require('fs')
class TechnologiesController {
	async create(req, res) {
		try {
			const data = req.body
			const photopath = req.file ? `/uploads/${req.file.filename}` : null
			const result = await TechnologiesService.create({ ...data, photo: photopath })
			if (result.success) {
				return res.status(201).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server xatosi" })
		}
	}
	async update(req, res) {
		try {
			const { id } = req.params
			const leader = await technologiesModel.findById(id)

			if (!leader) {
				return res.status(404).json({ success: false, message: "texnologiya topilmadi" })
			}

			let updatedData = { ...req.body }

			if (req.file) {
				const uploadsDir = path.join(__dirname, "../uploads")

				// Uploads papka mavjudligini tekshirish
				if (!fs.existsSync(uploadsDir)) {
					fs.mkdirSync(uploadsDir, { recursive: true })
				}

				if (leader.photo) {
					// Boshidagi / belgini olib tashlaymiz
					const oldPhotoRelative = leader.photo.replace(/^\/+/, "")
					const oldFilePath = path.join(__dirname, "../", oldPhotoRelative)

					console.log("🧩 Eski rasm yo'li:", oldFilePath)

					if (fs.existsSync(oldFilePath)) {
						fs.unlinkSync(oldFilePath)
						console.log("🗑️ Eski rasm o'chirildi:", oldFilePath)
					} else {
						console.log("⚠️ Eski rasm topilmadi:", oldFilePath)
					}
				}

				// Yangi rasmni yo'lini saqlaymiz
				updatedData.photo = `/uploads/${req.file.filename}`
			}

			const result = await TechnologiesService.update(id, updatedData)
			return res.status(result.success ? 200 : 400).json(result)
		} catch (error) {
			console.error("Update error:", error)
			return res.status(500).json({ success: false, message: "Server xatosi" })
		}
	}
	async deleted(req, res) {
		try {
			const result = await TechnologiesService.deleted(req.params.id)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server xatosi" })
		}
	}
	async getAll(req, res) {
		try {
			const result = await TechnologiesService.getAll(req.params.lang)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server xatosi" })
		}
	}
	async getAlll(req, res) {
		try {
			const result = await TechnologiesService.getAlll()
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server xatosi" })
		}
	}
}
module.exports = new TechnologiesController()
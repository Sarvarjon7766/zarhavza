const GeneralNewsService = require('../services/general.news.service')

class GeneralNewsController {
	async create(req, res) {
		try {
			const photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : []
			const data = {
				...req.body,
				photos
			}
			const result = await GeneralNewsService.create(data)
			if (result.success) {
				return res.status(201).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
	async update(req, res) {
		try {
			const photos = req.files ? req.files.map(file => `/uploads/${file.filename}`) : []
			const data = {
				...req.body,
				photos
			}
			const result = await GeneralNewsService.update(req.params.id, data)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
	async deleted(req, res) {
		try {
			const result = await GeneralNewsService.deleted(req.params.id)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
	async getAlll(req, res) {
		try {
			const result = await GeneralNewsService.getAlll(req.params.key)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({
				success: false, message: "Server xatosi"
			})
		}
	}
	async getAll(req, res) {
		try {
			const result = await GeneralNewsService.getAll(req.params.key, req.params.lang)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({
				success: false, message: "Server xatosi"
			})
		}
	}
	async getOne(req, res) {
		try {
			const result = await GeneralNewsService.getAll(req.params.key, req.params.lang)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({
				success: false, message: "Server xatosi"
			})
		}
	}
}
module.exports = new GeneralNewsController()
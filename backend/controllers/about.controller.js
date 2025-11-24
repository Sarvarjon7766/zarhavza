const AboutService = require('../services/about.service')

class AboutController {
	async create(req, res) {
		try {
			const result = await AboutService.create(req.body)
			if (result.success) {
				return res.status(201).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
	async update(req, res) {
		try {
			const result = await AboutService.update(req.params.id, req.body)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
	async deleted(req, res) {
		try {
			const result = await AboutService.deleted(req.params.id)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
	async getAll(req, res) {
		try {
			const result = await AboutService.getAll(req.params.lang)
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
	async getAlll(req, res) {
		try {
			const result = await AboutService.getAlll()
			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
}
module.exports = new AboutController()
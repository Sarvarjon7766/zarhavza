const ApplicationService = require('../services/application.service')

class ApplicationController {
	async create(req, res) {
		try {
			const result = await ApplicationService.create(req.body)
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
	async getAll(req, res) {
		try {
			const result = await ApplicationService.getAll(req.body)
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
	async updateStatus(req, res) {
		try {
			console.log(req.params.id)
			console.log(req.body)
			const result = await ApplicationService.updateStatus(req.params.id, req.body)
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
module.exports = new ApplicationController()
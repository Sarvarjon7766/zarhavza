const GeneralCommunicationService = require('../services/general.communication.service')

class GeneralCommunicationController {
	async create(req, res) {
		try {
			const result = await GeneralCommunicationService.create(req.body)
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
			const result = await GeneralCommunicationService.update(req.params.id, req.body)
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
			const result = await GeneralCommunicationService.deleted(req.params.id)
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
			const result = await GeneralCommunicationService.getAlll(req.params.key)
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
			const result = await GeneralCommunicationService.getAll(req.params.key, req.params.lang)
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
module.exports = new GeneralCommunicationController()
const GeneralLeaderService = require('../services/generalleader.service')

class GeneralLeaderController {
	async create(req, res) {
		try {
			console.log("req.body")
			console.log(req.body)
			console.log("req.body")
			const photo = req.file && `/uploads/${req.file.filename}`
			const data = {
				...req.body,
				photo
			}
			const result = await GeneralLeaderService.create(data)
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
			const photo = req.file && `/uploads/${req.file.filename}`
			const data = {
				...req.body,
				photo
			}
			const result = await GeneralLeaderService.update(req.params.id, data)
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
			const result = await GeneralLeaderService.deleted(req.params.id)
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
			const result = await GeneralLeaderService.getAlll(req.params.key)
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
			const result = await GeneralLeaderService.getAll(req.params.key, req.params.lang)
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
			const result = await GeneralLeaderService.getAll(req.params.key, req.params.lang)
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
module.exports = new GeneralLeaderController()
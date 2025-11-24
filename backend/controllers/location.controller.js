const LocationService = require('../services/location.service')

class LocationController {
	async create(req, res) {
		try {
			const result = await LocationService.create(req.body)
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
			console.log(req.params.id)
			console.log(req.body)
			const result = await LocationService.update(req.params.id, req.body)
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
			const result = await LocationService.deleted(req.params.id)
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
			const result = await LocationService.getAll(req.params.lang)
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
			const result = await LocationService.getAlll()
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

module.exports = new LocationController()
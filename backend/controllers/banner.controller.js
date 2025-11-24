const BannerService = require('../services/banner.service')

class BannerController {
	async create(req, res) {
		try {
			if (req.files) {
				if (req.files.photo) {
					req.body.photo = `/uploads/banner/${req.files.photo[0].filename}`
				}
				if (req.files.video) {
					req.body.video = `/uploads/banner/${req.files.video[0].filename}`
				}
			}
			console.log(req.body)
			const result = await BannerService.create(req.body)
			return res.status(result.success ? 201 : 400).json(result)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: 'Server xatosi' })
		}
	}
	async update(req, res) {
		try {
			if (req.files) {
				if (req.files.photo) {
					req.body.photo = `/uploads/banner/${req.files.photo[0].filename}`
				}
				if (req.files.video) {
					req.body.video = `/uploads/banner/${req.files.video[0].filename}`
				}
			}
			console.log(req.body)
			const result = await BannerService.update(req.params.id, req.body)
			return res.status(result.success ? 201 : 400).json(result)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: 'Server xatosi' })
		}
	}
	async deleted(req, res) {
		try {
			const result = await BannerService.deleted(req.params.id)
			return res.status(result.success ? 201 : 400).json(result)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: 'Server xatosi' })
		}
	}

	async getOne(req, res) {
		try {
			const result = await BannerService.getOne()
			return res.status(result.success ? 200 : 404).json(result)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: 'Server error' })
		}
	}
	async getAll(req, res) {
		try {
			const result = await BannerService.getAll()
			return res.status(result.success ? 200 : 404).json(result)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: 'Server error' })
		}
	}
}

module.exports = new BannerController()

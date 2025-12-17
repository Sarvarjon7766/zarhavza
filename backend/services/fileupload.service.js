class FileUploadService {
	async fileupload(req, res) {
		try {
			console.log(req.file)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ success: false, message: "Server error" })
		}
	}
}
module.exports = new FileUploadService()
const { model, Schema } = require('mongoose')
const bannerSchema = new Schema({
	photo: {
		type: String,
		required: true
	},
	video: {
		type: String,
	},
	isActive: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
})

module.exports = new model('banner', bannerSchema)
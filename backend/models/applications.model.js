const { model, Schema } = require('mongoose')

const applicationSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
	},
	phone: {
		type: String,
	},
	message: {
		type: String,
	},
	isStatus: {
		type: Boolean,
		default: false,
	}
}, {
	timestamps: true,
})
module.exports = new model('application', applicationSchema)
const { model, Schema } = require('mongoose')

const contactSchema = new Schema({
	address_uz: {
		type: String,
	},
	address_ru: {
		type: String,
	},
	address_en: {
		type: String,
	},
	phone: {
		type: String,
	},
	phone_faks: {
		type: String,
	},
	email: {
		type: String,
	},
	workin_uz: {
		type: String,
	},
	workin_ru: {
		type: String,
	},
	workin_en: {
		type: String,
	},
	isActive: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
})
module.exports = new model('contact', contactSchema)
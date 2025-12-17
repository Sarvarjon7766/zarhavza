const { model, Schema } = require('mongoose')

const leaderSchema = new Schema({
	fullName_uz: {
		type: String,
	},
	fullName_ru: {
		type: String,
	},
	fullName_en: {
		type: String,
	},
	position_uz: {
		type: String,
	},
	position_ru: {
		type: String,
	},
	position_en: {
		type: String,
	},
	phone: {
		type: String
	},
	email: {
		type: String,
	},
	address_uz: {
		type: String,
	},
	address_ru: {
		type: String,
	},
	address_en: {
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
	task_uz: {
		type: String,
	},
	task_ru: {
		type: String,
	},
	task_en: {
		type: String,
	},
	biography_uz: {
		type: String,
	},
	biography_ru: {
		type: String,
	},
	biography_en: {
		type: String,
	},
	photo: {
		type: String
	},
	key: {
		type: String
	}
}, {
	timestamps: true
})
module.exports = new model('generalleader', leaderSchema)
const { model, Schema } = require('mongoose')
const technologies = new Schema({
	title_uz: {
		type: String,
	},
	title_ru: {
		type: String,
	},
	title_en: {
		type: String,
	},
	description_uz: {
		type: String,
	},
	description_ru: {
		type: String,
	},
	description_en: {
		type: String,
	},
	photo: {
		type: String,
	}
}, {
	new: true
})
module.exports = new model('technologies', technologies)
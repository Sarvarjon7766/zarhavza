const { model, Schema } = require('mongoose')
const programsSchema = new Schema({
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
	timestamps: true
})
module.exports = new model('program', programsSchema)
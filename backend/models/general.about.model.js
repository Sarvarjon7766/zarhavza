const { model, Schema } = require('mongoose')
const aboutSchema = new Schema({
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
	description_en: {
		type: String,
	},
	description_ru: {
		type: String,
	},
	key: {
		type: String
	}
}, {
	timestamps: true
})
module.exports = new model('generalabout', aboutSchema)
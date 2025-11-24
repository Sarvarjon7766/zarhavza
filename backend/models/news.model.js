const { model, Schema } = require('mongoose')
const newsSchema = new Schema({
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
	photos: [
		{
			type: String,
		}
	]
}, {
	timestamps: true
})

module.exports = new model('news', newsSchema)
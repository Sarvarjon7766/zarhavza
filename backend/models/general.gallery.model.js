const { model, Schema } = require('mongoose')
const gallarySchema = new Schema({
	title_uz: {
		type: String,
	},
	title_ru: {
		type: String,
	},
	title_en: {
		type: String,
	},
	key: { type: String },
	photos: [{ type: String, }]
})
module.exports = new model('generalgallary', gallarySchema)
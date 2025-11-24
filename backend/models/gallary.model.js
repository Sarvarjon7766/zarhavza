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
	photos: [{ type: String, }]
})
module.exports = new model('gallary', gallarySchema)
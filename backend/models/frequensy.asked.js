const { model, Schema } = require('mongoose')
const askedSchema = new Schema({
	question_uz: {
		type: String,
	},
	question_en: {
		type: String,
	},
	question_ru: {
		type: String,
	},
	ask_uz: {
		type: String,
	},
	ask_ru: {
		type: String,
	},
	ask_en: {
		type: String,
	},
}, {
	timestamps: true
})
module.exports = new model('asked', askedSchema)
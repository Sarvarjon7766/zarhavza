const { model, Schema } = require('mongoose')
const activitySchema = new Schema({
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
}, {
	timestamps: true
})
module.exports = new model('activity', activitySchema)
const { model, Schema } = require('mongoose')

const communicationSchema = new Schema({
	sarlavha_uz: {
		type: String
	},
	sarlavha_ru: {
		type: String
	},
	sarlavha_en: {
		type: String
	},
	key: { type: String },
}, { timestamps: true })

module.exports = new model('generalcommunication', communicationSchema)
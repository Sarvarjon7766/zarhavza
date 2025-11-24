const { model, Schema } = require('mongoose')

const announcementSchema = new Schema({
	title_uz: { type: String, trim: true },
	title_en: { type: String, trim: true },
	title_ru: { type: String, trim: true },

	description_uz: { type: String, trim: true },
	description_en: { type: String, trim: true },
	description_ru: { type: String, trim: true },

	photos: [{ type: String }]
}, {
	timestamps: true
})

module.exports = model('announcement', announcementSchema)

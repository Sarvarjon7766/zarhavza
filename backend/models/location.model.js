const { model, Schema } = require('mongoose')

const LocationSchema = new Schema(
	{
		coord: {
			type: String, // Masalan: "39.67017, 67.43722"
			required: true,
			trim: true,
		},

		title_uz: {
			type: String,
			trim: true,
		},
		title_ru: {
			type: String,
			trim: true,
		},
		title_en: {
			type: String,
			trim: true,
		},

		address_uz: {
			type: String,
			trim: true,
		},
		address_ru: {
			type: String,
			trim: true,
		},
		address_en: {
			type: String,
			trim: true,
		},

		phone: {
			type: String,
			default: "",
		},

		workHours_uz: {
			type: String,
			default: "",
		},
		workHours_ru: {
			type: String,
			default: "",
		},
		workHours_en: {
			type: String,
			default: "",
		},
	},
	{
		timestamps: true,
	}
)

module.exports = new model("location", LocationSchema)

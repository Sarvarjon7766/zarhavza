const { Schema, model } = require("mongoose")

const PageSchema = new Schema(
	{
		title: {
			uz: { type: String, required: true },
			en: { type: String, required: true },
			ru: { type: String, required: true },
		},

		slug: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},

		type: {
			type: String,
			enum: ["static", "news", "gallery", "documents"],
			default: "static",
		},

		icon: { type: String, default: null },

		order: { type: Number, default: 0 },

		isActive: { type: Boolean, default: true },
		key: { type: String },

		// ⭐ YANGI: dropdown bo‘lishi uchun parent ID
		parent: {
			type: Schema.Types.ObjectId,
			ref: "page",
			default: null, // null bo‘lsa -> top-level item (Bosh sahifa, Biz haqimizda...)
		}
	},
	{ timestamps: true }
)

module.exports = model("page", PageSchema)

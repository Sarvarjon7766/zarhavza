const pagesModel = require('../models/pages.model')

class PagesService {
	async create(data) {
		try {
			const pages = await pagesModel.create(data)
			if (pages) {
				return { success: true, message: "Sahifa yaratildi." }
			} else {
				return { success: false, message: "Sahifa yaratishda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async update(id, data) {
		try {
			const page = await pagesModel.findByIdAndUpdate(id, data, { new: true })
			if (page) {
				return { success: true, message: "Sahifa yangilandi" }
			} else {
				return { success: false, message: "Sahifani yangilashda xatolik" }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async deleted(id) {
		try {
			console.log(id)
			await pagesModel.findByIdAndDelete(id)
			return { success: true, message: "Sahifa o'chirildi" }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAll(lang) {
		try {
			const topLevel = await pagesModel.find({ parent: null, isActive: true })
				.sort({ order: 1 })
				.lean()

			const children = await pagesModel.find({ parent: { $ne: null }, isActive: true })
				.sort({ order: 1 })
				.lean()

			const menu = topLevel.map((item) => {
				const childItems = children
					.filter((c) => c.parent.toString() === item._id.toString())
					.map((c) => ({
						_id: c._id,
						slug: c.slug,
						title: c.title[lang],
						parentTitle: item.title[lang],   // ⭐ OTA TITLE
						type: c.type,
						key: c.key,
						icon: c.icon,
						order: c.order
					}))

				return {
					_id: item._id,
					slug: item.slug,
					title: item.title[lang],
					type: item.type,
					key: item.key,
					icon: item.icon,
					order: item.order,
					children: childItems
				}
			})

			return { success: true, data: menu }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getMainOne(id) {
		try {
			const topLevel = await pagesModel.findById(id)
			if (topLevel) {
				return { success: true, page: topLevel }
			} else {
				return { success: false, page: {} }
			}
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getMain() {
		try {
			const pages = await pagesModel
				.find({ parent: null, isActive: true })
				.sort({ order: 1 })
				.lean()

			if (!pages.length) {
				return { success: false, pages: [], message: "Asosiy navigatsiyalar yo'q" }
			}

			return { success: true, pages, message: "Asosiy navigatsiyalar" }

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async MainCon() {
		try {
			const usedAsParent = await pagesModel.distinct("parent", {
				parent: { $ne: null }
			})
			const pages = await pagesModel
				.find({
					parent: null,
					isActive: true,
					_id: { $nin: usedAsParent }
				})
				.sort({ order: 1 })
				.lean()

			if (!pages.length) {
				return { success: false, pages: [], message: "Asosiy navigatsiyalar yo'q" }
			}
			return { success: true, pages, message: "Asosiy navigatsiyalar" }
		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async AdditCon() {
		try {
			// 1️⃣ Hech bo'lmasa bitta childga ega bo'lgan parentlar ro'yxati
			const usedAsParent = await pagesModel.distinct("parent", {
				parent: { $ne: null }
			})

			// 2️⃣ O'zi child bo'lgan, ammo boshqa page uchun parent bo'lmaganlar
			const pages = await pagesModel
				.find({
					parent: { $ne: null },   // 👉 child bo'lishi shart
					isActive: true,
					_id: { $nin: usedAsParent }  // 👉 o'zi parent bo'lmasligi shart
				})
				.sort({ order: 1 })
				.lean()

			if (!pages.length) {
				return { success: false, pages: [], message: "Qo'shimcha navigatsiyalar yo'q" }
			}

			return { success: true, pages, message: "Qo'shimcha navigatsiyalar" }

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
	async getAdditional() {
		try {
			const pages = await pagesModel
				.find({ parent: { $ne: null }, isActive: true })
				.sort({ order: 1 })
				.lean()

			if (!pages.length) {
				return { success: false, pages: [], message: "Qo'shimcha navigatsiyalar yo'q" }
			}

			return { success: true, pages, message: "Qo'shimcha navigatsiyalar" }

		} catch (error) {
			console.log(error)
			return { success: false, message: "Server error" }
		}
	}
}
module.exports = new PagesService()
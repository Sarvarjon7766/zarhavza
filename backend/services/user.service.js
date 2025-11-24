const userModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

class UserService {
	async create(data) {
		try {
			if (data.password) {
				const saltRounds = 10
				const hashedPassword = await bcrypt.hash(data.password, saltRounds)
				data.password = hashedPassword
			}
			const user = await userModel.create(data)
			if (user) {
				return { success: true, message: "Yangi admin qo'shildi." }
			} else {
				return { success: false, message: "Admin qo'shishda xatolik" }
			}
		} catch (error) {
			console.error(error)
			return { success: false, message: error.message || error }
		}
	}
	async auth(data) {
		try {
			const { username, password } = data
			const exsistuser = await userModel.findOne({ username })
			if (!exsistuser) {
				return { success: false, message: "Foydalanuvchi topilmadi" }
			}
			const isMatch = await bcrypt.compare(password, exsistuser.password)
			if (!isMatch) {
				return { success: false, message: "Parol noto‘g‘ri" }
			}
			const token = jwt.sign(
				{ id: exsistuser._id, username: exsistuser.username },
				process.env.JWT_SECRET || "secretkey",
				{ expiresIn: "1d" }
			)
			return {
				success: true,
				message: "Muvaffaqiyatli login",
				user: exsistuser,
				role: "admin",
				token,
				"content-type": "admin" // sizning misolingizga ko'ra
			}
		} catch (error) {
			console.error(error)
			return { success: false, message: error.message || error }
		}
	}
}
module.exports = new UserService()
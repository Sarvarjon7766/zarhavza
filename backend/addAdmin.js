require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/user.model')
const bcrypt = require('bcrypt')

const MONGO_URI = process.env.MONGO_URI

async function addAdmin() {
	try {
		await mongoose.connect(MONGO_URI)
		const hashedPassword = await bcrypt.hash('123456', 10)
		const adminUser = new User({
			fullName: 'Sarvar',
			username: 'sarvar',
			password: hashedPassword
		})

		// bazaga saqlash
		const savedUser = await adminUser.save()
		console.log('Admin qo‘shildi:', savedUser)

		await mongoose.connection.close()
	} catch (error) {
		console.error('Xatolik yuz berdi:', error)
		await mongoose.connection.close()
	}
}

addAdmin()

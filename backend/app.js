// hashPassword.js

const bcrypt = require("bcrypt")

// 🔐 Parol
const password = "samshahar987654321"

// 🔁 Salt soni (10)
const saltRounds = 10

// Hash yaratish
bcrypt.hash(password, saltRounds, (err, hash) => {
	if (err) {
		console.error("Xatolik:", err)
		return
	}
	console.log("Asl parol:", password)
	console.log("Hashlangan parol:", hash)
})

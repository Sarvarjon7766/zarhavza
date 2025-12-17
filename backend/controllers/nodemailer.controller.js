const nodemailer = require("nodemailer")
const ApplicationService = require('../services/application.service')

class NodeMailerController {
	async sendMail(req, res) {
		try {
			const { _id, email, phone, askmessage, replymessage } = req.body

			const transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: "zarafshonirrigatsiyatizimlari@gmail.com",
					pass: "dzdeavklgiecrnhx"
				}
			})

			const info = await transporter.sendMail({
				from: '"Zarafshon Irrigatsiya Tizimlari Boshqarmasi" <zarafshonirrigatsiyatizimlari@gmail.com>',
				to: email,
				subject: "Sizning so‘rovingizga javob",
				html: `
                    <h2>Hurmatli mijoz!</h2>
                    <p><b>Telefon:</b> ${phone}</p>
                    <p><b>Sizning savolingiz:</b> ${askmessage}</p>
                    <hr/>
                    <p><b>Bizning javobimiz:</b> ${replymessage}</p>
                `
			})

			const result = await ApplicationService.replyMess(_id, replymessage)

			if (result.success) {
				return res.status(200).json(result)
			} else {
				return res.status(400).json(result)
			}

		} catch (error) {
			console.log(error)
			return res.status(500).json({
				success: false,
				message: "Email yuborishda xatolik"
			})
		}
	}
}

module.exports = new NodeMailerController()

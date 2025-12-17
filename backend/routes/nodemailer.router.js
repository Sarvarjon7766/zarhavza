const express = require('express')
const router = express.Router()
const { sendMail } = require('../controllers/nodemailer.controller')

router.post('/sentmessage', sendMail)


module.exports = router
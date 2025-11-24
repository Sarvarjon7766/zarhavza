const express = require('express')
const router = express.Router()

const { create, auth } = require('../controllers/user.controller')

router.post('/create', create)
router.post('/login', auth)


module.exports = router
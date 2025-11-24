const express = require('express')
const router = express.Router()
const { create, getAll, updateStatus } = require('../controllers/application.controller')
router.post('/create', create)
router.get('/getAll', getAll)
router.put('/updateStatus/:id', updateStatus)


module.exports = router
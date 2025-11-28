const express = require('express')
const router = express.Router()
const { create, update, deleted, getAll } = require('../controllers/social.networks.controller')

router.post('/create', create)
router.put('/update/:id', update)
router.delete('/delete/:id', deleted)
router.get('/getAll', getAll)

module.exports = router
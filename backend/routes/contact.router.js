const express = require('express')
const router = express.Router()
const { create, update, deleted, getActive, getAll } = require('../controllers/contact.controller')
router.post('/create', create)
router.put('/update/:id', update)
router.delete('/delete/:id', deleted)
router.get('/getAll', getAll)
router.get('/getActive/:lang', getActive)


module.exports = router
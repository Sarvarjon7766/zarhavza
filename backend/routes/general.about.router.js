const express = require('express')
const router = express.Router()
const { create, getAll, getAlll, update, deleted } = require('../controllers/general.about.controller')
router.post('/create', create)
router.get('/getAll/:lang/:key', getAll)
router.get('/getAll/:key', getAlll)
router.put('/update/:id', update)
router.delete('/delete/:id', deleted)


module.exports = router
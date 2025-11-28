const express = require('express')
const { create, update, deleted, getAll, getMain, getAdditional, getMainOne, MainCon, AdditCon } = require('../controllers/pages.controller')
const router = express.Router()

router.post('/create', create)
router.put('/update/:id', update)
router.delete('/delete/:id', deleted)
router.get('/getAll/:lang', getAll)
router.get('/getMainOne/:id', getMainOne)
router.get('/getMain', getMain)
router.get('/MainCon', MainCon)
router.get('/AdditCon', AdditCon)
router.get('/getAdditional', getAdditional)

module.exports = router
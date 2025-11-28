const express = require('express')
const router = express.Router()
const fullUpload = require('../middlewares/fullUpload.middleware')
const { create, update, deleted, getAll, getAlll } = require('../controllers/general.gallery.controller')

router.post('/create', fullUpload, create)
router.put('/update/:id', fullUpload, update)
router.delete('/delete/:id', deleted)
router.get('/getAll/:lang/:key', getAll)
router.get('/getAll/:key', getAlll)

module.exports = router

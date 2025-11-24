const express = require('express')
const router = express.Router()
const fullUpload = require('../middlewares/fullUpload.middleware')
const GallaryController = require('../controllers/gallary.controller')

router.post('/create', fullUpload, GallaryController.create)
router.put('/update/:id', fullUpload, GallaryController.update)
router.delete('/delete/:id', GallaryController.deleted)
router.get('/getAll/:lang', GallaryController.getAll)
router.get('/getAll', GallaryController.getAlll)

module.exports = router

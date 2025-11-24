const express = require('express')
const router = express.Router()
const uploadPhotos = require('../middlewares/uploadPhotos')
const AnnouncementController = require('../controllers/announcement.controller')

router.post('/create', uploadPhotos, AnnouncementController.create)
router.put('/update/:id', uploadPhotos, AnnouncementController.update)
router.delete('/delete/:id', AnnouncementController.deleted)
router.get('/getAll/:lang', AnnouncementController.getAll)
router.get('/getAll', AnnouncementController.getAlll)

module.exports = router

const express = require('express')
const router = express.Router()
const uploadPhotos = require('../middlewares/uploadPhotos')
const GeneralAnnouncementController = require('../controllers/general.announcement.controller')

router.post('/create', uploadPhotos, GeneralAnnouncementController.create)
router.put('/update/:id', uploadPhotos, GeneralAnnouncementController.update)
router.delete('/delete/:id', GeneralAnnouncementController.deleted)
router.get('/getAll/:lang/:key', GeneralAnnouncementController.getAll)
router.get('/getAll/:key', GeneralAnnouncementController.getAlll)

module.exports = router

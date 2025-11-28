const express = require('express')
const router = express.Router()
const uploadPhotos = require('../middlewares/uploadPhotos')
const GeneralNewsService = require('../controllers/general.news.controller')

router.post('/create', uploadPhotos, GeneralNewsService.create)
router.put('/update/:id', uploadPhotos, GeneralNewsService.update)
router.delete('/delete/:id', GeneralNewsService.deleted)
router.get('/getAll/:lang/:key', GeneralNewsService.getAll)
router.get('/getOne/:lang/:key', GeneralNewsService.getOne)
router.get('/getAll/:key', GeneralNewsService.getAlll)

module.exports = router

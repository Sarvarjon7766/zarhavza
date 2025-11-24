const express = require('express')
const router = express.Router()
const uploadPhotos = require('../middlewares/uploadPhotos')
const NewsController = require('../controllers/news.controller')

router.post('/create', uploadPhotos, NewsController.create)
router.put('/update/:id', uploadPhotos, NewsController.update)
router.delete('/delete/:id', NewsController.deleted)
router.get('/getAll/:lang', NewsController.getAll)
router.get('/getOne/:lang', NewsController.getOne)
router.get('/getAll', NewsController.getAlll)

module.exports = router

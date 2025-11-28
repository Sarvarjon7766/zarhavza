const express = require('express')
const router = express.Router()
const fullUpload = require('../middlewares/fullUpload.middleware')
const NewsController = require('../controllers/news.controller')

router.post('/create', fullUpload, NewsController.create)
router.put('/update/:id', fullUpload, NewsController.update)
router.delete('/delete/:id', NewsController.deleted)
router.get('/getAll/:lang', NewsController.getAll)
router.get('/getOne/:lang', NewsController.getOne)
router.get('/getAll', NewsController.getAlll)

module.exports = router

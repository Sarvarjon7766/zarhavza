const express = require('express')
const router = express.Router()
const uploadBanner = require('../middlewares/uploadBanner')
const { create, getOne, getAll, update, deleted } = require('../controllers/banner.controller')

router.post('/create', uploadBanner, create)
router.put('/update/:id', uploadBanner, update)
router.delete('/delete/:id', deleted)
router.get('/getAll', getAll)
router.get('/getOne', getOne)

module.exports = router

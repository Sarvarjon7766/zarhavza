const express = require('express')
const router = express.Router()
const { create, getAll, getAlll, update, deleted } = require('../controllers/location.controller')

router.post('/create', create)
router.put('/update/:id', update)
router.delete('/delete/:id', deleted)
router.get('/getAll/:lang', getAll)
router.get('/getAll', getAlll)


module.exports = router
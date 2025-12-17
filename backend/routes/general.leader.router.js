const express = require('express')
const router = express.Router()
const upload = require('../middlewares/upload.middleware')
const GeneralLeaderService = require('../controllers/general.leader.controller')

router.post('/create', upload.single('photo'), GeneralLeaderService.create)
router.put('/update/:id', upload.single('photo'), GeneralLeaderService.update)
router.delete('/delete/:id', GeneralLeaderService.deleted)
router.get('/getAll/:lang/:key', GeneralLeaderService.getAll)
router.get('/getOne/:lang/:key', GeneralLeaderService.getOne)
router.get('/getAll/:key', GeneralLeaderService.getAlll)

module.exports = router

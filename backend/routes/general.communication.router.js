const express = require('express')
const router = express.Router()
const GeneralCommunicationService = require('../controllers/general.communication.controller')

router.post('/create', GeneralCommunicationService.create)
router.put('/update/:id', GeneralCommunicationService.update)
router.delete('/delete/:id', GeneralCommunicationService.deleted)
router.get('/getAll/:lang/:key', GeneralCommunicationService.getAll)
router.get('/getAll/:key', GeneralCommunicationService.getAlll)

module.exports = router

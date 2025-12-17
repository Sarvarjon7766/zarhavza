const express = require('express')
const router = express.Router()
const { fileupload } = require('../services/fileupload.service')

router.post('/tinymce', fileupload)


module.exports = router

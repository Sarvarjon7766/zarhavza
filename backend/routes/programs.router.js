const express = require('express')
const router = express.Router()
const { create, update, deleted, getAll, getAlll } = require('../controllers/programs.controller')
const upload = require('../middlewares/upload.middleware')

router.post("/create", upload.single("photo"), create)
router.get("/getAll/:lang", getAll)
router.get("/getAll", getAlll)
router.put("/update/:id", upload.single("photo"), update)
router.delete("/delete/:id", deleted)


module.exports = router
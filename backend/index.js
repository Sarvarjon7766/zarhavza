const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000
const connectMainDB = require('./config/db')
connectMainDB()
app.use(cors())
app.use(express.json())
const { bannerrouter, newsrouter, askedrouter, applicationrouter, userrouter, programrouter, technologiesrouter, locationrouter, aboutrouter, opendatarouter, activityrouter, announcementrouter, gallaryrouter } = require('./routes/index')

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/banner', bannerrouter)
app.use('/api/news', newsrouter)
app.use('/api/asked', askedrouter)
app.use('/api/application', applicationrouter)
app.use('/api/user', userrouter)
app.use('/api/program', programrouter)
app.use('/api/technologies', technologiesrouter)
app.use('/api/location', locationrouter)
app.use('/api/about', aboutrouter)
app.use('/api/opendata', opendatarouter)
app.use('/api/activity', activityrouter)
app.use('/api/announcement', announcementrouter)
app.use('/api/gallary', gallaryrouter)


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'Fayl yuklashda xatolik: ' + err.message
    })
  }
  console.error(err.stack)
  res.status(500).send('Serverda xatolik yuz berdi!')
})
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
  console.log('Uploads papkasi yaratildi')
}
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} da ishga tushdi`)
})

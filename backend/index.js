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

// CORS sozlamalari
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// BODY PARSER SOZLAMALARINI OSHIRISH
app.use(express.json({ limit: '50mb' })) // 50MB gacha ruxsat berish
app.use(express.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}))

const { bannerrouter, newsrouter, askedrouter, applicationrouter, userrouter, programrouter, technologiesrouter, locationrouter, aboutrouter, opendatarouter, activityrouter, announcementrouter, gallaryrouter, pagesrouter, generalaboutrouter, generalannouncementrouter, generalgalleryrouter, generalnewsrouter, socialnetworkrouter, contactrouter, nodemailerrouter, generalleaderrouter, generalcommunicationrouter,fileUpload } = require('./routes/index')

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ROUTE'LAR
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
app.use('/api/generalnews', generalnewsrouter)
app.use('/api/nodemailer', nodemailerrouter)
app.use('/api/generalleader', generalleaderrouter)
app.use('/api/generalcommunication', generalcommunicationrouter)

app.use('/api/pages', pagesrouter)
app.use('/api/generalabout', generalaboutrouter)
app.use('/api/generalannouncement', generalannouncementrouter)
app.use('/api/generalgallery', generalgalleryrouter)
app.use('/api/generalnews', generalnewsrouter)
app.use('/api/upload', fileUpload)

app.use('/api/social-networks', socialnetworkrouter)
app.use('/api/contact', contactrouter)

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'Fayl yuklashda xatolik: ' + err.message
    })
  }

  // Payload too large xatosini qayta ishlash
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Yuborilgan ma\'lumot hajmi juda katta. Iltimos, fayl hajmini kamaytiring.'
    })
  }

  console.error('Server xatosi:', err.stack)
  res.status(500).json({
    success: false,
    message: 'Serverda ichki xatolik yuz berdi!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Uploads papkasini yaratish
const uploadDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log('Uploads papkasi yaratildi')
}

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} da ishga tushdi`)
})
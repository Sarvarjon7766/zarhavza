import { BrowserRouter, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./context/ProtectedRoute"

// 🏠 Asosiy sahifalar
import Home from "./pages/home/Home"
import AboutUsNavigatsiya from './pages/navigatsiya/AboutUsNavigatsiya'
import ActiviteNavigate from './pages/navigatsiya/ActiviteNavigate'
import AllNewsNavigate from './pages/navigatsiya/AllNewsNavigate'
import AnnouncementsNavigate from './pages/navigatsiya/AnnouncementsNavigate'
import Contacts from './pages/navigatsiya/Contacts'
import OpeningDataNavigatsiya from './pages/navigatsiya/OpeningDataNavigatsiya'
import VideoGallaryNavigate from './pages/navigatsiya/VideoGallaryNavigate'
import NotFound from "./pages/notfound/NotFound"

import AdminLayout from "./pages/admin/AdminLayout"
import AdminApplication from './pages/admin/pages/AdminApplication'
import AdminBanner from './pages/admin/pages/AdminBanner'
import AdminNews from './pages/admin/pages/AdminNews'
import AdminQuestion from './pages/admin/pages/AdminQuestion'
import Locations from './pages/admin/pages/Locations'
import ModernTechnologies from './pages/admin/pages/ModernTechnologies'
import ProgramsYear from './pages/admin/pages/ProgramsYear'
// <--- Navigatsiyalar --->
import AboutUs from './pages/admin/pages/AboutUs'
import Activities from './pages/admin/pages/Activities'
import OpeningData from './pages/admin/pages/OpeningData'

import Announcements from './pages/admin/pages/Announcements'
import Gallary from './pages/admin/pages/Gallary'
// 🔑 Auth
import Login from "./pages/auth/Login"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 Asosiy sahifa */}
        <Route path="/" element={<Home />} />


        {/* 🌍 Boshqa sahifalar */}
        <Route path="/open-data" element={<OpeningDataNavigatsiya />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/about-us" element={<AboutUsNavigatsiya />} />
        <Route path="/activity" element={<ActiviteNavigate />} />
        <Route path="/announcements" element={<AnnouncementsNavigate />} />
        <Route path="/video-gallery" element={<VideoGallaryNavigate />} />
        <Route path="/allnews" element={<AllNewsNavigate />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminBanner />} />
          {/* Home */}
          <Route path="banner" element={<AdminBanner />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="faq" element={<AdminQuestion />} />
          <Route path="programs" element={<ProgramsYear />} />
          <Route path="technologies" element={<ModernTechnologies />} />
          <Route path="application" element={<AdminApplication />} />
          <Route path="contacts" element={<Locations />} />
          {/* Navigatsiyalar */}
          <Route path="about-us" element={<AboutUs />} />
          <Route path="open-data" element={<OpeningData />} />
          <Route path="activities" element={<Activities />} />


          <Route path="announcements" element={<Announcements />} />
          <Route path="gallery" element={<Gallary />} />


        </Route>

        {/* ❌ Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

// App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./context/ProtectedRoute"
// 🏠 Asosiy sahifalar
import DynamicPageRouter from "./components/DynamicPageRouter"
import Home from "./pages/home/Home"
import AllNews from './pages/media/AllNews'
import Contacts from './pages/navigatsiya/Contacts'
import NotFound from "./pages/notfound/NotFound"

import AdminLayout from "./pages/admin/AdminLayout"
import AboutUs from './pages/admin/pages/AboutUs'
import Activities from './pages/admin/pages/Activities'
import AdminApplication from './pages/admin/pages/AdminApplication'
import AdminBanner from './pages/admin/pages/AdminBanner'
import AdminNews from './pages/admin/pages/AdminNews'
import AdminQuestion from './pages/admin/pages/AdminQuestion'
import Announcements from './pages/admin/pages/Announcements'
import Gallary from './pages/admin/pages/Gallary'
import Locations from './pages/admin/pages/Locations'
import ModernTechnologies from './pages/admin/pages/ModernTechnologies'
import OpeningData from './pages/admin/pages/OpeningData'
import ProgramsYear from './pages/admin/pages/ProgramsYear'
import SocialNetworks from './pages/admin/pages/SocialNetworks'
import AdminContact from './pages/admin/AdminContact'

import MainNavigationAdd from './pages/admin/pages/navigatsiya/main/MainNavigationAdd'
import MainNavigationContent from './pages/admin/pages/navigatsiya/main/MainNavigationContent'
import MainNavigationList from './pages/admin/pages/navigatsiya/main/MainNavigationList'

import AdditionalNavigationAdd from './pages/admin/pages/navigatsiya/additional/AdditionalNavigationAdd'
import AdditionalNavigationContent from './pages/admin/pages/navigatsiya/additional/AdditionalNavigationContent'
import AdditionalNavigationList from './pages/admin/pages/navigatsiya/additional/AdditionalNavigationList'


// 🔑 Auth
import Login from "./pages/auth/Login"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🏠 Asosiy sahifa */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contacts />} />
        <Route path="/allnews" element={<AllNews />} />
        {/* 🌍 Dynamic sahifalar - Barcha nested slug'lar uchun */}
        <Route path="/*" element={<DynamicPageRouter />} />
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
          <Route path="banner" element={<AdminBanner />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="faq" element={<AdminQuestion />} />
          <Route path="programs" element={<ProgramsYear />} />
          <Route path="technologies" element={<ModernTechnologies />} />
          <Route path="application" element={<AdminApplication />} />
          <Route path="contacts" element={<Locations />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="open-data" element={<OpeningData />} />
          <Route path="activities" element={<Activities />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="gallery" element={<Gallary />} />
          <Route path="networks" element={<SocialNetworks />} />
          <Route path="data-contact" element={<AdminContact />} />


          <Route path="main-navigation/add" element={<MainNavigationAdd />} />
          <Route path="main-navigation/list" element={<MainNavigationList />} />
          <Route path="main-navigation/content" element={<MainNavigationContent />} />
          <Route path="main-navigation/edit/:id" element={<MainNavigationAdd />} />

          <Route path="additional-navigation/add" element={<AdditionalNavigationAdd />} />
          <Route path="additional-navigation/edit/:id" element={<AdditionalNavigationAdd />} />
          <Route path="additional-navigation/list" element={<AdditionalNavigationList />} />
          <Route path="additional-navigation/content" element={<AdditionalNavigationContent />} />
        </Route>

        {/* ❌ Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
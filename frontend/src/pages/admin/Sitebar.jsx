import { ChevronDown, ChevronRight, X } from "lucide-react"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

const Sitebar = ({ isOpen, onClose }) => {
	const [openMenu, setOpenMenu] = useState(null)
	const location = useLocation()

	const toggleMenu = (menu) => {
		setOpenMenu(openMenu === menu ? null : menu)
	}

	const isActive = (path) => location.pathname === path

	return (
		<>
			{/* Overlay mobil */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-opacity-40 z-40 md:hidden"
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed md:static top-0 left-0 h-full w-72 bg-gray-800 text-white flex flex-col z-50 transform transition-transform duration-300
				${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<button
						onClick={onClose}
						className="md:hidden p-1 rounded hover:bg-gray-700 transition"
					>
						<X size={22} />
					</button>
				</div>

				{/* Menu */}
				<nav className="flex-1 overflow-y-auto p-4 space-y-2">

					{/* 🏠 Home */}
					<div>
						<button
							onClick={() => toggleMenu("home")}
							className="flex justify-between items-center w-full text-left p-2 rounded hover:bg-gray-700"
						>
							<span>🏠 Home</span>
							{openMenu === "home" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
						</button>
						{openMenu === "home" && (
							<div className="ml-4 mt-1 space-y-1">
								<Link to="/admin/banner" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/banner") ? "bg-blue-600" : ""}`}>📸 Banner</Link>
								<Link to="/admin/news" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/news") ? "bg-blue-600" : ""}`}>📰 Yangiliklar</Link>
								<Link to="/admin/programs" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/programs") ? "bg-blue-600" : ""}`}>📅 Yil Dasturlari</Link>
								<Link to="/admin/technologies" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/technologies") ? "bg-blue-600" : ""}`}>⚙️ Texnologiyalar</Link>
								<Link to="/admin/faq" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/faq") ? "bg-blue-600" : ""}`}>❓ Ko‘p beriladigan savollar</Link>
								<Link to="/admin/application" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/application") ? "bg-blue-600" : ""}`}>🈸 Murojaatlar</Link>
								<Link to="/admin/contacts" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/contacts") ? "bg-blue-600" : ""}`}>📍 Manzillarimiz</Link>
							</div>
						)}
					</div>

					{/* Navigatsiyalarda */}
					<div>
						<button
							onClick={() => toggleMenu("navigation")}
							className="flex justify-between items-center w-full text-left p-2 rounded hover:bg-gray-700"
						>
							<span>🧭 Navigatsiyalarda</span>
							{openMenu === "navigation" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
						</button>
						{openMenu === "navigation" && (
							<div className="ml-4 mt-1 space-y-1">
								<Link to="/admin/about-us" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/about-us") ? "bg-blue-600" : ""}`}>ℹ️ Biz haqimizda</Link>
								<Link to="/admin/open-data" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/open-data") ? "bg-blue-600" : ""}`}>📊 Ochiq Ma’lumotlar</Link>
								<Link to="/admin/activities" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/activities") ? "bg-blue-600" : ""}`}>🏃‍♂️ Faoliyat</Link>
							</div>
						)}
					</div>

					{/* Axborot xizmati */}
					<div>
						<button
							onClick={() => toggleMenu("info")}
							className="flex justify-between items-center w-full text-left p-2 rounded hover:bg-gray-700"
						>
							<span>📰 Axborot xizmati</span>
							{openMenu === "info" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
						</button>
						{openMenu === "info" && (
							<div className="ml-4 mt-1 space-y-1">
								<Link to="/admin/announcements" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/announcements") ? "bg-blue-600" : ""}`}>📢 E’lonlar</Link>
								<Link to="/admin/gallery" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/gallery") ? "bg-blue-600" : ""}`}>🖼️ Galareya</Link>
							</div>
						)}
					</div>

				</nav>
			</aside>
		</>
	)
}

export default Sitebar

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
								<Link to="/admin/faq" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/faq") ? "bg-blue-600" : ""}`}>❓ Ko'p beriladigan savollar</Link>
								<Link to="/admin/application" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/application") ? "bg-blue-600" : ""}`}>🈸 Murojaatlar</Link>
								<Link to="/admin/contacts" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/contacts") ? "bg-blue-600" : ""}`}>📍 Manzillarimiz</Link>
								<Link to="/admin/networks" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/networks") ? "bg-blue-600" : ""}`}>💻Ijtimoiy Tarmoqlar</Link>
								<Link to="/admin/data-contact" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/data-contact") ? "bg-blue-600" : ""}`}>📞Bog'lanish Ma'lumotlari</Link>
							</div>
						)}
					</div>

					{/* Asosiy Navigatsiyalar */}
					<div>
						<button
							onClick={() => toggleMenu("main_nav")}
							className="flex justify-between items-center w-full text-left p-2 rounded hover:bg-gray-700"
						>
							<span>🧭 Asosiy Navigatsiyalar</span>
							{openMenu === "main_nav" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
						</button>
						{openMenu === "main_nav" && (
							<div className="ml-4 mt-1 space-y-1">
								<Link to="/admin/main-navigation/add" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/main-navigation/add") ? "bg-blue-600" : ""}`}>➕ Navigatsiya qo'shish</Link>
								<Link to="/admin/main-navigation/list" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/main-navigation/list") ? "bg-blue-600" : ""}`}>📋 Navigatsiyalar</Link>
								<Link to="/admin/main-navigation/content" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/main-navigation/content") ? "bg-blue-600" : ""}`}>📄 Ma'lumot qo'shish</Link>
							</div>
						)}
					</div>

					{/* Qo'shimcha Navigatsiyalar */}
					<div>
						<button
							onClick={() => toggleMenu("additional_nav")}
							className="flex justify-between items-center w-full text-left p-2 rounded hover:bg-gray-700"
						>
							<span>🔗 Qo'shimcha Navigatsiyalar</span>
							{openMenu === "additional_nav" ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
						</button>
						{openMenu === "additional_nav" && (
							<div className="ml-4 mt-1 space-y-1">
								<Link to="/admin/additional-navigation/add" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/additional-navigation/add") ? "bg-blue-600" : ""}`}>➕ Navigatsiya qo'shish</Link>
								<Link to="/admin/additional-navigation/list" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/additional-navigation/list") ? "bg-blue-600" : ""}`}>📋 Navigatsiyalar</Link>
								<Link to="/admin/additional-navigation/content" className={`block p-2 rounded hover:bg-gray-700 ${isActive("/admin/additional-navigation/content") ? "bg-blue-600" : ""}`}>📄Ma'lumot qo'shish</Link>
							</div>
						)}
					</div>

				</nav>
			</aside>
		</>
	)
}

export default Sitebar
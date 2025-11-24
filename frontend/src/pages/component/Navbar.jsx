import { ChevronDown, Eye, Moon, Sun, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
	const [openMenu, setOpenMenu] = useState(null)
	const [mobileOpen, setMobileOpen] = useState(false)
	const [language, setLanguage] = useState("uz")
	const [showAccessibilityModal, setShowAccessibilityModal] = useState(false)
	const [accessibilitySettings, setAccessibilitySettings] = useState({
		fontSize: 100,
		theme: 'normal'
	})
	const navigate = useNavigate()

	// LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
	}, [])

	// LocalStorage'dan accessibility sozlamalarini o'qish
	useEffect(() => {
		const savedSettings = localStorage.getItem("accessibilitySettings")
		if (savedSettings) {
			const settings = JSON.parse(savedSettings)
			setAccessibilitySettings(settings)
			applyAccessibilitySettings(settings)
		}
	}, [])

	// Accessibility sozlamalarini qo'llash
	const applyAccessibilitySettings = (settings) => {
		const root = document.documentElement

		// Shrift o'lchami
		root.style.fontSize = `${settings.fontSize}%`

		// Mavzu
		if (settings.theme === 'grayscale') {
			root.style.setProperty('--bg-color', '#ffffff')
			root.style.setProperty('--text-color', '#000000')
			root.style.setProperty('--primary-color', '#666666')
			root.style.setProperty('--secondary-color', '#333333')
			root.style.filter = 'grayscale(100%)'
		} else {
			// Normal holat
			root.style.setProperty('--bg-color', '')
			root.style.setProperty('--text-color', '')
			root.style.setProperty('--primary-color', '')
			root.style.setProperty('--secondary-color', '')
			root.style.filter = 'none'
		}
	}

	// Scroll ni boshqarish
	const toggleBodyScroll = (disable) => {
		if (disable) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = 'auto'
		}
	}

	// Til o'zgarganda yangilash
	useEffect(() => {
		const handleStorageChange = () => {
			const savedLang = localStorage.getItem("lang") || "uz"
			setLanguage(savedLang)
		}

		window.addEventListener('storage', handleStorageChange)
		const interval = setInterval(() => {
			const savedLang = localStorage.getItem("lang") || "uz"
			if (savedLang !== language) {
				setLanguage(savedLang)
			}
		}, 1000)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
	}, [language])

	// Tilni o'zgartirish
	const handleLanguageChange = (langCode) => {
		setLanguage(langCode)
		localStorage.setItem("lang", langCode)
	}

	// Maxsus Imkoniyatlar modalini ochish
	const handleAccessibilityClick = () => {
		setShowAccessibilityModal(true)
		toggleBodyScroll(true)
	}

	// Modalni yopish
	const handleCloseModal = () => {
		setShowAccessibilityModal(false)
		toggleBodyScroll(false)
	}

	// Shrift o'lchamini o'zgartirish
	const handleFontSizeChange = (size) => {
		const newSettings = { ...accessibilitySettings, fontSize: size }
		setAccessibilitySettings(newSettings)
		localStorage.setItem("accessibilitySettings", JSON.stringify(newSettings))
		applyAccessibilitySettings(newSettings)
	}

	// Mavzuni o'zgartirish
	const handleThemeChange = (theme) => {
		const newSettings = { ...accessibilitySettings, theme }
		setAccessibilitySettings(newSettings)
		localStorage.setItem("accessibilitySettings", JSON.stringify(newSettings))
		applyAccessibilitySettings(newSettings)
	}

	// Barcha sozlamalarni tiklash
	const handleResetAll = () => {
		const defaultSettings = {
			fontSize: 100,
			theme: 'normal'
		}
		setAccessibilitySettings(defaultSettings)
		localStorage.setItem("accessibilitySettings", JSON.stringify(defaultSettings))
		applyAccessibilitySettings(defaultSettings)
	}

	// Tarjima matnlari - Zarafshon irrigatsiya tizimlari boshqarmasi uchun
	const translations = {
		uz: {
			home: "Boshqarma haqida",
			about: "Biz Haqimizda",
			openData: "Ochiq Ma'lumot",
			contact: "Bog'lanish",
			infoService: "Axborot xizmati",
			announcements: "E'lonlar",
			videoGallery: "Video galereya",
			news: "Yangiliklar",
			activity: "Faoliyat",
			samarkandRegion: "Samarqand viloyati",
			zarafshonIrrigation: '"Zarafshon" irrigatsiya tizimi boshqarmasi',
			accessibility: "Maxsus Imkoniyatlar",
			fontSize: "Shrift o'lchami",
			theme: "Mavzu",
			normalTheme: "Oddiy holat",
			grayscaleTheme: "Rangsiz holat",
			reset: "Barchasini tiklash",
			close: "Yopish",
			accessibilitySettings: "Qulaylik sozlamalari",
			customizeSite: "Saytni o'zingizga qulay tarzda sozlang",
			current: "Joriy",
			percent: "%"
		},
		ru: {
			home: "Главная",
			about: "О Нас",
			openData: "Открытые Данные",
			contact: "Связь",
			infoService: "Информационная служба",
			announcements: "Объявления",
			videoGallery: "Видеогалерея",
			news: "Новости",
			activity: "Деятельность",
			samarkandRegion: "Самаркандская область",
			zarafshonIrrigation: 'Управление ирригационной системы "Зарафшан"',
			accessibility: "Специальные Возможности",
			fontSize: "Размер шрифта",
			theme: "Тема",
			normalTheme: "Обычный режим",
			grayscaleTheme: "Черно-белый режим",
			reset: "Сбросить все",
			close: "Закрыть",
			accessibilitySettings: "Настройки доступности",
			customizeSite: "Настройте сайт под себя",
			current: "Текущий",
			percent: "%"
		},
		en: {
			home: "Directorate",
			about: "About Us",
			openData: "Open Data",
			contact: "Contact",
			infoService: "Information Service",
			announcements: "Announcements",
			videoGallery: "Video Gallery",
			news: "News",
			activity: "Activity",
			samarkandRegion: "Samarkand region",
			zarafshonIrrigation: '"Zarafshon" Irrigation System Administration',
			accessibility: "Special Features",
			fontSize: "Font Size",
			theme: "Theme",
			normalTheme: "Normal mode",
			grayscaleTheme: "Grayscale mode",
			reset: "Reset All",
			close: "Close",
			accessibilitySettings: "Accessibility Settings",
			customizeSite: "Customize the site to your preferences",
			current: "Current",
			percent: "%"
		}
	}

	const t = translations[language] || translations.uz

	const toggleMenu = (menu) => {
		setOpenMenu((prev) => (prev === menu ? null : menu))
	}

	const handleNavigate = (path) => {
		navigate(path)
		setMobileOpen(false)
		setOpenMenu(null)
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	const handleMouseEnter = (menu) => setOpenMenu(menu)
	const handleMouseLeave = () => setOpenMenu(null)

	return (
		<nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b-2 border-blue-700">
			<div className="px-4 sm:px-6 lg:px-8 mx-auto">
				{/* Bitta qator: Logo + Navigatsiya + Til tanlash */}
				<div className="flex items-center justify-between py-3">
					{/* Logo */}
					<div
						onClick={() => handleNavigate("/")}
						className="flex items-center space-x-3 cursor-pointer group"
					>
						<img src="/logo.png" alt="Logo" className="h-10 sm:h-12 w-auto transition-transform group-hover:scale-105" />
						<div className="hidden sm:block">
							<div className="text-sm md:text-base font-bold text-white leading-tight">
								{t.samarkandRegion}
							</div>
							<div className="text-xs md:text-sm text-white font-semibold opacity-90 leading-tight">
								{t.zarafshonIrrigation}
							</div>
						</div>
					</div>

					{/* Asosiy navigatsiya menyusi */}
					<div className="hidden md:flex items-center space-x-1 lg:space-x-2">
						<ul className="flex items-center space-x-1 font-semibold text-sm">
							<li
								onClick={() => handleNavigate("/")}
								className="text-white hover:text-yellow-300 hover:bg-blue-700 transition-all duration-300 py-2 px-3 lg:px-4 cursor-pointer rounded-lg group"
							>
								<span className="group-hover:scale-105 transition-transform whitespace-nowrap">{t.home}</span>
							</li>

							<li
								onClick={() => handleNavigate("/about-us")}
								className="text-white hover:text-yellow-300 hover:bg-blue-700 transition-all duration-300 py-2 px-3 lg:px-4 cursor-pointer rounded-lg group"
							>
								<span className="group-hover:scale-105 transition-transform whitespace-nowrap">{t.about}</span>
							</li>



							<li
								onClick={() => handleNavigate("/open-data")}
								className="text-white hover:text-yellow-300 hover:bg-blue-700 transition-all duration-300 py-2 px-3 lg:px-4 cursor-pointer rounded-lg group"
							>
								<span className="group-hover:scale-105 transition-transform whitespace-nowrap">{t.openData}</span>
							</li>
							<li
								onClick={() => handleNavigate("/contact")}
								className="text-white hover:text-yellow-300 hover:bg-blue-700 transition-all duration-300 py-2 px-3 lg:px-4 cursor-pointer rounded-lg group"
							>
								<span className="group-hover:scale-105 transition-transform whitespace-nowrap">{t.contact}</span>
							</li>
							{/* Axborot xizmati */}
							<li
								className="relative"
								onMouseEnter={() => handleMouseEnter("info")}
								onMouseLeave={handleMouseLeave}
							>
								<button className="flex items-center gap-1 text-white hover:text-yellow-300 hover:bg-blue-700 py-2 px-3 lg:px-4 cursor-pointer rounded-lg transition-all duration-300 group whitespace-nowrap">
									<span className="group-hover:scale-105 transition-transform text-sm">
										{t.infoService}
									</span>
									<ChevronDown size={14} className={`transition-transform duration-300 ${openMenu === "info" ? "rotate-180 text-yellow-300" : "group-hover:scale-110"}`} />
								</button>

								{openMenu === "info" && (
									<div className="absolute left-0 top-full bg-white border border-gray-300 rounded-lg w-48 z-50 overflow-hidden shadow-lg">
										<ul className="p-2 space-y-1">
											{[
												{ path: "/announcements", text: t.announcements },
												{ path: "/video-gallery", text: t.videoGallery },
												{ path: "/allnews", text: t.news },
											].map((item) => (
												<li
													key={item.path}
													onClick={() => handleNavigate(item.path)}
													className="hover:bg-blue-50 rounded-lg px-3 py-2 text-gray-800 cursor-pointer transition-all duration-200 group"
												>
													<span className="font-medium group-hover:text-blue-600 transition-colors text-sm">
														{item.text}
													</span>
												</li>
											))}
										</ul>
									</div>
								)}
							</li>

							<li
								onClick={() => handleNavigate("/activity")}
								className="text-white hover:text-yellow-300 hover:bg-blue-700 transition-all duration-300 py-2 px-3 lg:px-4 cursor-pointer rounded-lg group"
							>
								<span className="group-hover:scale-105 transition-transform whitespace-nowrap">{t.activity}</span>
							</li>


						</ul>
					</div>

					{/* Til tanlash va mobil menyu */}
					<div className="flex items-center space-x-3">
						{/* Maxsus Imkoniyatlar tugmasi */}
						<button
							onClick={handleAccessibilityClick}
							className="p-1.5 text-white hover:text-yellow-300 transition-all duration-300 rounded-lg group"
							title={t.accessibility}
						>
							<Eye size={18} className="group-hover:scale-110 transition-transform" />
						</button>

						{/* Til tanlash */}
						<div className="relative">
							<select
								value={language}
								onChange={(e) => handleLanguageChange(e.target.value)}
								className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 hover:border-gray-400 transition-colors cursor-pointer text-sm font-medium"
							>
								<option value="uz" className="text-gray-700 bg-white">O'zbekcha</option>
								<option value="ru" className="text-gray-700 bg-white">Русский</option>
								<option value="en" className="text-gray-700 bg-white">English</option>
							</select>
							<ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none" />
						</div>

						{/* Mobil menyu tugmasi */}
						<button
							className="md:hidden p-2 rounded-lg border border-white/30 text-white hover:text-yellow-300 hover:border-yellow-300 transition-all duration-300"
							onClick={() => setMobileOpen((prev) => !prev)}
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{mobileOpen ? (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								) : (
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
				</div>

				{/* Mobil menyu - Yangilangan qism */}
				<div
					className={`md:hidden border-t border-white/20 transition-all duration-300 ${mobileOpen ? "max-h-[500px] opacity-100 pb-3" : "max-h-0 opacity-0"}`}
					style={{
						overflow: mobileOpen ? 'visible' : 'hidden',
						zIndex: 1000
					}}
				>
					<div className="py-3 space-y-1">
						{[
							{ path: "/", text: t.home },
							{ path: "/about-us", text: t.about },
							{ path: "/open-data", text: t.openData },
							{ path: "/activity", text: t.activity },
							{ path: "/contact", text: t.contact },
						].map((item) => (
							<div
								key={item.path}
								onClick={() => handleNavigate(item.path)}
								className="py-2 px-3 text-white hover:text-yellow-300 hover:bg-blue-700 rounded-lg cursor-pointer transition-all duration-200"
							>
								<span className="font-medium text-sm">{item.text}</span>
							</div>
						))}

						{/* Axborot xizmati mobil */}
						<div className="border-t border-white/20 pt-2 mt-2">
							<button
								onClick={() => toggleMenu("info-mobile")}
								className="flex justify-between items-center w-full py-2 px-3 text-white hover:text-yellow-300 hover:bg-blue-700 rounded-lg transition-all duration-200"
							>
								<span className="font-medium text-sm">{t.infoService}</span>
								<ChevronDown size={16} className={`transition-transform duration-300 ${openMenu === "info-mobile" ? "rotate-180 text-yellow-300" : ""}`} />
							</button>
							{openMenu === "info-mobile" && (
								<ul className="pl-4 py-2 space-y-1">
									{[
										{ path: "/announcements", text: t.announcements },
										{ path: "/video-gallery", text: t.videoGallery },
										{ path: "/news", text: t.news },
									].map((item) => (
										<li
											key={item.path}
											onClick={() => handleNavigate(item.path)}
											className="py-2 px-3 text-white hover:text-yellow-300 hover:bg-blue-700 rounded cursor-pointer transition-all duration-200"
										>
											<span className="font-medium text-sm">{item.text}</span>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Maxsus Imkoniyatlar Sidebar */}
			<div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${showAccessibilityModal ? 'translate-x-0' : 'translate-x-full'}`}>
				{/* Sidebar sarlavhasi */}
				<div className="bg-blue-600 text-white p-6 flex justify-between items-center">
					<div>
						<h2 className="text-xl font-bold">{t.accessibilitySettings}</h2>
						<p className="text-blue-100 text-sm mt-1">{t.customizeSite}</p>
					</div>
					<button
						onClick={handleCloseModal}
						className="text-white hover:text-yellow-300 transition-colors p-1 rounded-lg"
					>
						<X size={24} />
					</button>
				</div>

				{/* Sidebar kontenti */}
				<div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
					{/* Mavzu */}
					<div>
						<h3 className="text-lg font-semibold  text-gray-800 mb-3">{t.theme}</h3>
						<div className="grid grid-cols-2 gap-3">
							<button
								onClick={() => handleThemeChange('normal')}
								className={`py-4 px-4 border text-black rounded-lg transition-colors flex items-center justify-center gap-3 ${accessibilitySettings.theme === 'normal'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-gray-300 hover:border-blue-500'
									}`}
							>
								<Sun size={20} />
								<span>{t.normalTheme}</span>
							</button>
							<button
								onClick={() => handleThemeChange('grayscale')}
								className={`py-4 px-4 border text-black rounded-lg transition-colors flex items-center justify-center gap-3 ${accessibilitySettings.theme === 'grayscale'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-gray-300 hover:border-blue-500'
									}`}
							>
								<Moon size={20} />
								<span>{t.grayscaleTheme}</span>
							</button>
						</div>
					</div>

					{/* Shrift o'lchami */}
					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-3">
							{t.fontSize} - {accessibilitySettings.fontSize}%
						</h3>
						<div className="bg-gray-100 rounded-lg p-1">
							<div className="relative">
								<input
									type="range"
									min="50"
									max="200"
									step="10"
									value={accessibilitySettings.fontSize}
									onChange={(e) => handleFontSizeChange(Number(e.target.value))}
									className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
								/>
								<div className="flex justify-between text-xs text-gray-500 mt-2">
									<span>50%</span>
									<span>75%</span>
									<span>100%</span>
									<span>125%</span>
									<span>150%</span>
									<span>175%</span>
									<span>200%</span>
								</div>
							</div>
						</div>
						<div className="flex justify-center mt-4">
							<div className="text-center">
								<div className={`text-${accessibilitySettings.fontSize >= 150 ? 'xl' : accessibilitySettings.fontSize >= 120 ? 'lg' : 'base'} font-bold text-gray-800`}>
									Namuna matn
								</div>
								<div className={`text-${accessibilitySettings.fontSize >= 150 ? 'lg' : accessibilitySettings.fontSize >= 120 ? 'base' : 'sm'} text-gray-600 mt-1`}>
									Shrift o'lchami: {accessibilitySettings.fontSize}%
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar pastki qismi */}
				<div className="absolute bottom-0 left-0 right-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
					<button
						onClick={handleResetAll}
						className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
					>
						{t.reset}
					</button>
					<button
						onClick={handleCloseModal}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						{t.close}
					</button>
				</div>
			</div>

			{/* Overlay */}
			{showAccessibilityModal && (
				<div
					className="fixed inset-0 bg-black/50 z-40"
					onClick={handleCloseModal}
				/>
			)}
		</nav>
	)
}

export default Navbar
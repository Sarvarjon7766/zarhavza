import axios from "axios"
import { ChevronDown, Eye, Facebook, Instagram, MapPin, Moon, Send, Sun, X, Youtube } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
	const [openMenu, setOpenMenu] = useState(null)
	const [mobileOpen, setMobileOpen] = useState(false)
	const [language, setLanguage] = useState("uz")
	const [searchOpen, setSearchOpen] = useState(false)
	const [isScrolled, setIsScrolled] = useState(false)
	const [showAccessibilityModal, setShowAccessibilityModal] = useState(false)
	const [accessibilitySettings, setAccessibilitySettings] = useState({
		fontSize: 100,
		theme: 'normal'
	})
	const [menuItems, setMenuItems] = useState([]) // API dan kelgan menyu
	const [socialNetworks, setSocialNetworks] = useState([]) // API dan kelgan ijtimoiy tarmoqlar
	const navigate = useNavigate()

	const BASE_URL = import.meta.env.VITE_BASE_URL

	// Scroll holatini kuzatish
	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY
			if (scrollTop > 50) {
				setIsScrolled(true)
			} else {
				setIsScrolled(false)
			}
		}

		window.addEventListener('scroll', handleScroll)
		handleScroll()

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])

	// LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
	}, [])

	// Backenddan menu ma'lumotlarini olish
	useEffect(() => {
		const fetchMenu = async () => {
			try {
				console.log("🔄 Fetching menu for language:", language)
				const { data } = await axios.get(`${BASE_URL}/api/pages/getAll/${language}`)
				console.log("📋 Menu data received:", data)

				if (data.success) {
					setMenuItems(data.data)
				}
			} catch (error) {
				console.log("❌ Menu fetch error:", error)
			}
		}

		fetchMenu()
	}, [BASE_URL, language])

	// Backenddan ijtimoiy tarmoqlarni olish
	useEffect(() => {
		const fetchSocialNetworks = async () => {
			try {
				console.log("🔄 Fetching social networks...")
				const { data } = await axios.get(`${BASE_URL}/api/social-networks/getAll`)
				console.log("📱 Social networks data received:", data)

				if (data.success) {
					setSocialNetworks(data.data)
				}
			} catch (error) {
				console.log("❌ Social networks fetch error:", error)
			}
		}

		fetchSocialNetworks()
	}, [BASE_URL])

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
		// Til o'zgarganda menyuni qayta yuklash
		window.dispatchEvent(new Event('languageChanged'))
	}

	// Navigate funksiyasi
	const handleNavigate = (slug) => {
		console.log("📍 Navigate to slug:", slug)
		navigate(slug)
		setMobileOpen(false)
		setOpenMenu(null)
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

	// Home page ga o'tish
	const handleHomeNavigate = () => {
		navigate("/")
		setMobileOpen(false)
		setOpenMenu(null)
		window.scrollTo({ top: 0, behavior: "smooth" })
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

	// Menu itemlar uchun hover va click handlerlar
	const handleMouseEnter = (id) => setOpenMenu(id)
	const handleMouseLeave = () => setOpenMenu(null)

	const toggleMenu = (id) => {
		setOpenMenu((prev) => (prev === id ? null : id))
	}

	// Ijtimoiy tarmoq ikonkalarini olish
	const getSocialIcon = (key) => {
		switch (key) {
			case 'facebook':
				return <Facebook size={18} className="sm:w-5 sm:h-5 group-hover:scale-110" />
			case 'telegram':
				return <Send size={18} className="sm:w-5 sm:h-5 group-hover:scale-110" />
			case 'youtube':
				return <Youtube size={18} className="sm:w-5 sm:h-5 group-hover:scale-110" />
			case 'instagram':
				return <Instagram size={18} className="sm:w-5 sm:h-5 group-hover:scale-110" />
			case 'location':
				return <MapPin size={18} className="sm:w-5 sm:h-5 group-hover:scale-110" />
			default:
				return null
		}
	}

	// Ijtimoiy tarmoq nomlarini olish
	const getSocialTitle = (key) => {
		switch (key) {
			case 'facebook':
				return "Facebook"
			case 'telegram':
				return "Telegram"
			case 'youtube':
				return "YouTube"
			case 'instagram':
				return "Instagram"
			case 'location':
				return "Lokatsiya"
			default:
				return "Ijtimoiy tarmoq"
		}
	}

	// Ijtimoiy tarmoqlarni render qilish
	const renderSocialNetworks = () => {
		return socialNetworks.map((social) => (
			<a
				key={social._id}
				href={social.link}
				target="_blank"
				rel="noopener noreferrer"
				className="text-white hover:text-yellow-300 transition-all duration-300 p-1.5 sm:p-2 rounded-lg group"
				title={getSocialTitle(social.key)}
			>
				{getSocialIcon(social.key)}
			</a>
		))
	}

	// Tarjima matnlari
	const translations = {
		uz: {
			home: "Bosh sahifa",
			contact: "Bog'lanish",
			samarkandRegion: "Samarqand viloyati",
			zarafshonIrrigation: '"Zarafshon" irrigatsiya tizimi',
			directorate: "Boshqarma",
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
			contact: "Связь",
			samarkandRegion: "Самаркандская область",
			zarafshonIrrigation: 'Ирригационная система "Зарафшан"',
			directorate: "Управление",
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
			home: "Home",
			contact: "Contact",
			samarkandRegion: "Samarkand region",
			zarafshonIrrigation: '"Zarafshon" irrigation system',
			directorate: "Directorate",
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

	// Menu itemlarni render qilish (Desktop)
	const renderDesktopMenu = () => (
		<ul className="flex items-center space-x-0 xl:space-x-1 font-semibold text-xs md:text-sm lg:text-base xl:text-lg">
			{/* Bosh sahifa - har doim birinchi */}
			<li
				onClick={() => handleNavigate("/")}
				className="text-white hover:text-yellow-300 hover:bg-blue-700/50 transition-all duration-300 py-3 lg:py-4 px-2 md:px-3 lg:px-4 xl:px-6 cursor-pointer rounded-lg group"
			>
				<span className="group-hover:scale-105 transition-transform block whitespace-nowrap">{t.home}</span>
			</li>

			{/* API dan kelgan menyu itemlari */}
			{menuItems.map((item) => (
				<li
					key={item._id}
					className="relative"
					onMouseEnter={() => handleMouseEnter(item._id)}
					onMouseLeave={handleMouseLeave}
				>
					<button
						onClick={() => {
							console.log("🖱️ Clicked menu item:", item.title, "slug:", item.slug)
							if (item.children.length === 0) {
								handleNavigate(item.slug)
							}
						}}
						className="flex items-center gap-1 lg:gap-2 text-white hover:text-yellow-300 hover:bg-blue-700/50 py-3 lg:py-4 px-2 md:px-3 lg:px-4 xl:px-6 cursor-pointer rounded-lg transition-all duration-300 group whitespace-nowrap"
					>
						<span className="group-hover:scale-105 transition-transform text-xs md:text-sm lg:text-base xl:text-lg">
							{item.title}
						</span>
						{item.children.length > 0 && (
							<ChevronDown
								size={14}
								className={`transition-transform duration-300 ${openMenu === item._id ? "rotate-180 text-yellow-300" : "group-hover:scale-110"} w-3 h-3 md:w-4 md:h-4 lg:w-4 lg:h-4`}
							/>
						)}
					</button>

					{/* Dropdown menu */}
					{item.children.length > 0 && openMenu === item._id && (
						<div className="absolute left-0 top-full bg-white border border-gray-300 rounded-xl w-44 md:w-48 lg:w-52 xl:w-56 z-50 overflow-hidden shadow-md">
							<ul className="p-2 space-y-1">
								{item.children.map((child) => (
									<li
										key={child._id}
										onClick={() => {
											console.log("🖱️ Clicked child menu:", child.title, "slug:", child.slug)
											handleNavigate(child.slug)
										}}
										className="flex items-center space-x-2 lg:space-x-3 hover:bg-gray-200 rounded-lg px-2 lg:px-3 py-2 lg:py-3 text-black cursor-pointer transition-all duration-200 group"
									>
										{child.icon && <span className="text-base lg:text-lg">{child.icon}</span>}
										<span className="font-medium group-hover:text-blue-600 group-hover:translate-x-1 transition-transform text-xs md:text-sm lg:text-base">
											{child.title}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</li>
			))}

			{/* Bog'lanish - har doim oxirgi */}
			<li
				onClick={() => handleNavigate("/contact")}
				className="text-white hover:text-yellow-300 hover:bg-blue-700/50 transition-all duration-300 py-3 lg:py-4 px-2 md:px-3 lg:px-4 xl:px-6 cursor-pointer rounded-lg group"
			>
				<span className="group-hover:scale-105 transition-transform block whitespace-nowrap">{t.contact}</span>
			</li>
		</ul>
	)

	// Menu itemlarni render qilish (Mobile)
	const renderMobileMenu = () => (
		<div className="px-3 py-3 space-y-0.5">
			{/* Bosh sahifa - har doim birinchi */}
			<div
				onClick={() => handleNavigate("/")}
				className="flex items-center space-x-3 py-2.5 px-3 text-white hover:text-yellow-300 hover:bg-blue-700/50 rounded-lg cursor-pointer text-sm transition-all duration-200 group"
			>
				<span className="text-lg">🏠</span>
				<span className="group-hover:translate-x-1 transition-transform font-medium">
					{t.home}
				</span>
			</div>

			{/* API dan kelgan menyu itemlari */}
			{menuItems.map((item) => (
				<div key={item._id}>
					{item.children.length === 0 ? (
						<div
							onClick={() => {
								console.log("📱 Clicked mobile menu:", item.title, "slug:", item.slug)
								handleNavigate(item.slug)
							}}
							className="flex items-center space-x-3 py-2.5 px-3 text-white hover:text-yellow-300 hover:bg-blue-700/50 rounded-lg cursor-pointer text-sm transition-all duration-200 group"
						>
							{item.icon && <span className="text-lg">{item.icon}</span>}
							<span className="group-hover:translate-x-1 transition-transform font-medium">
								{item.title}
							</span>
						</div>
					) : (
						<div>
							<button
								onClick={() => toggleMenu(`mobile-${item._id}`)}
								className="flex justify-between items-center w-full py-2.5 px-3 text-white hover:text-yellow-300 hover:bg-blue-700/50 rounded-lg text-sm transition-all duration-200 group"
							>
								<div className="flex items-center space-x-3">
									{item.icon && <span className="text-lg">{item.icon}</span>}
									<span className="group-hover:translate-x-1 transition-transform font-medium">
										{item.title}
									</span>
								</div>
								<ChevronDown size={16} className={`transition-transform duration-300 ${openMenu === `mobile-${item._id}` ? "rotate-180 text-yellow-300" : ""}`} />
							</button>
							{openMenu === `mobile-${item._id}` && (
								<ul className="pl-9 py-1.5 space-y-0.5 bg-white">
									{item.children.map((child) => (
										<li
											key={child._id}
											onClick={() => {
												console.log("📱 Clicked mobile child:", child.title, "slug:", child.slug)
												handleNavigate(child.slug)
											}}
											className="flex items-center space-x-3 py-2 text-black hover:text-blue-700 hover:bg-gray-200 cursor-pointer transition-all duration-200 group"
										>
											{child.icon && <span className="text-base">{child.icon}</span>}
											<span className="font-medium group-hover:translate-x-1 transition-transform text-sm">
												{child.title}
											</span>
										</li>
									))}
								</ul>
							)}
						</div>
					)}
				</div>
			))}

			{/* Bog'lanish - har doim oxirgi */}
			<div
				onClick={() => handleNavigate("/contact")}
				className="flex items-center space-x-3 py-2.5 px-3 text-white hover:text-yellow-300 hover:bg-blue-700/50 rounded-lg cursor-pointer text-sm transition-all duration-200 group"
			>
				<span className="text-lg">📞</span>
				<span className="group-hover:translate-x-1 transition-transform font-medium">
					{t.contact}
				</span>
			</div>
		</div>
	)

	// Background klassini dinamik ravishda o'zgartirish
	const navBackgroundClass = isScrolled
		? "bg-gradient-to-r from-blue-900 to-blue-800 shadow-2xl border-b border-blue-600/50"
		: "bg-transparent"

	const mainNavBackgroundClass = isScrolled
		? "bg-blue-800/90 backdrop-blur-sm border-t border-blue-600/50"
		: "bg-transparent"

	const mobileNavBackgroundClass = isScrolled
		? "bg-blue-900/95 backdrop-blur-sm"
		: "bg-black/80 backdrop-blur-sm"

	return (
		<nav className={`fixed top-0 pt-2 left-0 right-0 z-50 w-full transition-all duration-500 ${navBackgroundClass}`}>
			{/* 🔹 Yuqori qism: Logo va Sarlavha */}
			<div>
				<div className="px-4 sm:px-6 lg:px-8 mx-auto">
					<div className="flex items-center justify-between py-4">
						{/* 🔹 Logo va Sarlavha */}
						<div className="flex items-center space-x-3 sm:space-x-4">
							<div
								onClick={handleHomeNavigate}
								className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
							>
								<img src="/logo.png" alt="Logo" className="h-12 sm:h-14 md:h-16 w-auto transition-transform group-hover:scale-105" />
							</div>
							<div className="hidden sm:block">
								<div className={`text-sm md:text-lg lg:text-xl font-bold tracking-tight leading-tight transition-colors duration-500 ${isScrolled ? "text-white" : "text-white"}`}>
									{t.samarkandRegion}
								</div>
								<div className={`text-xs md:text-base lg:text-lg font-semibold mt-0.5 md:mt-1 opacity-90 leading-tight transition-colors duration-500 ${isScrolled ? "text-white" : "text-white"}`}>
									{t.zarafshonIrrigation}
								</div>
							</div>
						</div>

						{/* 🔹 O'ng tomonda: Qidirish va Til tanlash */}
						<div className="flex items-center space-x-4 sm:space-x-6">
							{/* Maxsus Imkoniyatlar tugmasi */}
							<button
								onClick={handleAccessibilityClick}
								className="p-1.5 sm:p-2 text-white hover:text-yellow-300 transition-all duration-300 rounded-lg group"
								title={t.accessibility}
							>
								<Eye size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
							</button>

							{/* Til tanlash */}
							<div className="relative">
								<select
									value={language}
									onChange={(e) => handleLanguageChange(e.target.value)}
									className={`appearance-none border rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2.5 pr-8 sm:pr-10 focus:outline-none focus:ring-2 focus:ring-yellow-300 hover:border-white/50 transition-colors cursor-pointer text-sm sm:text-base font-medium ${isScrolled
										? "bg-transparent border-white/30 text-white"
										: "bg-white/10 backdrop-blur-md border-white/20 text-white"
										}`}
								>
									<option value="uz" className="text-gray-700 bg-white">O'zbekcha</option>
									<option value="ru" className="text-gray-700 bg-white">Русский</option>
									<option value="en" className="text-gray-700 bg-white">English</option>
								</select>
								<ChevronDown size={16} className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none w-4 h-4 sm:w-4 sm:h-4" />
							</div>

							{/* 🔹 Kichik ekranlarda menyu tugmasi - o'ng tomonda */}
							<button
								className="md:hidden p-1.5 sm:p-2 rounded-xl border text-white hover:text-yellow-300 hover:border-yellow-300 transition-all duration-300"
								style={{
									borderColor: isScrolled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)'
								}}
								onClick={() => setMobileOpen((prev) => !prev)}
							>
								{mobileOpen ? (
									<svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								) : (
									<svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									</svg>
								)}
							</button>
						</div>
					</div>

					{/* 🔹 Ijtimoiy tarmoqlar va Lokatsiya - O'NG TOMONDA */}
					<div className="flex items-center justify-end space-x-4 sm:space-x-6 pb-3 sm:pb-4">
						{/* Ijtimoiy tarmoqlar */}
						<div className="flex items-center space-x-3 sm:space-x-4 md:space-x-5">
							{renderSocialNetworks()}
						</div>
					</div>
				</div>
			</div>

			{/* 🔹 Asosiy navigatsiya menyusi */}
			<div className={`hidden md:block transition-all duration-500 ${mainNavBackgroundClass}`}>
				<div className="px-4 sm:px-6 lg:px-8 mx-auto">
					<div className="flex justify-center items-center">
						{renderDesktopMenu()}
					</div>
				</div>
			</div>

			{/* 🔹 Mobil menyu */}
			<div
				className={`md:hidden border-t border-white/20 transition-all duration-500 overflow-hidden ${mobileNavBackgroundClass} ${mobileOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
			>
				{renderMobileMenu()}
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
						<h3 className="text-lg font-semibold text-gray-800 mb-3">{t.theme}</h3>
						<div className="grid grid-cols-2 gap-3">
							<button
								onClick={() => handleThemeChange('normal')}
								className={`py-4 px-4 border rounded-lg transition-colors flex items-center justify-center gap-3 ${accessibilitySettings.theme === 'normal'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-gray-300 hover:border-blue-500'
									}`}
							>
								<Sun size={20} />
							</button>
							<button
								onClick={() => handleThemeChange('grayscale')}
								className={`py-4 px-4 border rounded-lg transition-colors flex items-center justify-center gap-3 ${accessibilitySettings.theme === 'grayscale'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-gray-300 hover:border-blue-500'
									}`}
							>
								<Moon size={20} />
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
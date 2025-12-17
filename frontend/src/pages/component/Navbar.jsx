import axios from "axios"
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
	const [menuItems, setMenuItems] = useState([])
	const navigate = useNavigate()

	const BASE_URL = import.meta.env.VITE_BASE_URL

	// Navigatsiyalar soni va o'lcham sozlamalari
	const [navConfig, setNavConfig] = useState({
		gap: 'space-x-4',
		textSize: 'text-base',
		paddingX: 'px-5',
		menuMaxWidth: 'w-64'
	})

	// LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
	}, [])

	// Backenddan menu ma'lumotlarini olish
	useEffect(() => {
		const fetchMenu = async () => {
			try {
				const { data } = await axios.get(`${BASE_URL}/api/pages/getAll/${language}`)
				if (data.success) {
					setMenuItems(data.data)
					// Navigatsiyalar soniga qarab sozlamalarni avtomatik o'zgartirish
					updateNavConfig(data.data.length)
				}
			} catch (error) {
				console.log("❌ Menu fetch error:", error)
			}
		}

		fetchMenu()
	}, [BASE_URL, language])

	// Navigatsiyalar soniga qarab konfiguratsiyani yangilash
	const updateNavConfig = (menuCount) => {
		if (menuCount > 7) {
			setNavConfig({
				gap: 'space-x-2',
				textSize: 'text-sm',
				paddingX: 'px-3',
				menuMaxWidth: 'w-56'
			})
		} else if (menuCount > 5) {
			setNavConfig({
				gap: 'space-x-3',
				textSize: 'text-sm',
				paddingX: 'px-4',
				menuMaxWidth: 'w-60'
			})
		} else {
			setNavConfig({
				gap: 'space-x-4',
				textSize: 'text-base',
				paddingX: 'px-5',
				menuMaxWidth: 'w-64'
			})
		}
	}

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
		root.style.fontSize = `${settings.fontSize}%`

		if (settings.theme === 'grayscale') {
			root.style.filter = 'grayscale(100%)'
		} else {
			root.style.filter = 'none'
		}
	}

	// Tilni o'zgartirish
	const handleLanguageChange = (langCode) => {
		setLanguage(langCode)
		localStorage.setItem("lang", langCode)
		window.dispatchEvent(new Event('languageChanged'))
	}

	// Navigate funksiyasi
	const handleNavigate = (slug) => {
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
		document.body.style.overflow = 'hidden'
	}

	// Modalni yopish
	const handleCloseModal = () => {
		setShowAccessibilityModal(false)
		document.body.style.overflow = 'auto'
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

	// Menu itemlar uchun hover handlerlar
	const handleMouseEnter = (id) => setOpenMenu(id)
	const handleMouseLeave = () => setOpenMenu(null)

	const toggleMenu = (id) => {
		setOpenMenu((prev) => (prev === id ? null : id))
	}

	// Tarjima matnlari
	const translations = {
		uz: {
			home: "Bosh sahifa",
			contact: "Bog'lanish",
			samarkandRegion: "Samarqand viloyati",
			zarafshonIrrigation: 'Zarafshon irrigatsiya tizimlari havza boshqarmasi',
			accessibility: "Maxsus Imkoniyatlar",
			fontSize: "Shrift o'lchami",
			theme: "Mavzu",
			normalTheme: "Oddiy holat",
			grayscaleTheme: "Rangsiz holat",
			reset: "Barchasini tiklash",
			close: "Yopish",
			accessibilitySettings: "Qulaylik sozlamalari",
			customizeSite: "Saytni o'zingizga qulay tarzda sozlang"
		},
		ru: {
			home: "Главная",
			contact: "Связь",
			samarkandRegion: "Самаркандская область",
			zarafshonIrrigation: 'Зарафшанское управление бассейна ирригационных систем',
			accessibility: "Специальные Возможности",
			fontSize: "Размер шрифта",
			theme: "Тема",
			normalTheme: "Обычный режим",
			grayscaleTheme: "Черно-белый режим",
			reset: "Сбросить все",
			close: "Закрыть",
			accessibilitySettings: "Настройки доступности",
			customizeSite: "Настройте сайт под себя"
		},
		en: {
			home: "Home",
			contact: "Contact",
			samarkandRegion: "Samarkand region",
			zarafshonIrrigation: 'Zarafshan Basin Irrigation Systems Authority',
			accessibility: "Special Features",
			fontSize: "Font Size",
			theme: "Theme",
			normalTheme: "Normal mode",
			grayscaleTheme: "Grayscale mode",
			reset: "Reset All",
			close: "Close",
			accessibilitySettings: "Accessibility Settings",
			customizeSite: "Customize the site to your preferences"
		}
	}

	const t = translations[language] || translations.uz

	// Menu itemlarni render qilish (Desktop)
	const renderDesktopMenu = () => (
		<ul className={`flex items-center justify-center ${navConfig.gap} font-medium`}>
			{/* Bosh sahifa */}
			<li
				onClick={() => handleNavigate("/")}
				className={`text-white hover:text-yellow-300 hover:bg-blue-700/50 transition-all duration-300 py-3 ${navConfig.paddingX} cursor-pointer rounded-lg group`}
			>
				<span className={`${navConfig.textSize} font-semibold group-hover:scale-105 transition-transform`}>
					{t.home}
				</span>
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
							if (item.children.length === 0) {
								handleNavigate(item.slug)
							}
						}}
						className={`flex items-center gap-1 text-white hover:text-yellow-300 hover:bg-blue-700/50 py-3 ${navConfig.paddingX} cursor-pointer rounded-lg transition-all duration-300 whitespace-nowrap group`}
					>
						<span className={`${navConfig.textSize} font-semibold group-hover:scale-105 transition-transform`}>
							{item.title}
						</span>
						{item.children.length > 0 && (
							<ChevronDown
								size={menuItems.length > 7 ? 14 : 16}
								className={`transition-transform duration-300 ${openMenu === item._id ? "rotate-180 text-yellow-300" : "group-hover:text-yellow-300"}`}
							/>
						)}
					</button>

					{/* Dropdown menu */}
					{item.children.length > 0 && openMenu === item._id && (
						<div className={`absolute left-1/2 transform -translate-x-1/2 top-full bg-white ${navConfig.menuMaxWidth} z-50 overflow-hidden mt-1 border border-gray-200 shadow-lg`}>
							<ul className="py-2">
								{item.children.map((child) => (
									<li
										key={child._id}
										onClick={() => handleNavigate(child.slug)}
										className="hover:bg-blue-50 px-4 py-3 text-gray-800 cursor-pointer transition-all duration-200 group"
									>
										<span className={`${menuItems.length > 7 ? 'text-sm' : 'text-base'} font-medium group-hover:text-blue-600 group-hover:translate-x-1 transition-transform inline-block`}>
											{child.title}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}
				</li>
			))}

			{/* Bog'lanish */}
			<li
				onClick={() => handleNavigate("/contact")}
				className={`text-white hover:text-yellow-300 hover:bg-blue-700/50 transition-all duration-300 py-3 ${navConfig.paddingX} cursor-pointer rounded-lg group`}
			>
				<span className={`${navConfig.textSize} font-semibold group-hover:scale-105 transition-transform`}>
					{t.contact}
				</span>
			</li>
		</ul>
	)

	// Menu itemlarni render qilish (Mobile) - TO'LIQ TUZATILGAN VERSIYA
	const renderMobileMenu = () => (
		<div className="bg-blue-600">
			{/* Bosh sahifa - button emas, div */}
			<div
				onClick={() => handleNavigate("/")}
				className="w-full py-4 px-5 text-white hover:text-yellow-300 hover:bg-blue-700/50 cursor-pointer transition-all duration-200 active:bg-blue-700/70 border-b border-blue-500/40"
			>
				<div className="flex items-center">
					<span className={`${menuItems.length > 7 ? 'text-sm' : 'text-base'} font-semibold`}>
						{t.home}
					</span>
				</div>
			</div>

			{/* API dan kelgan menyu itemlari */}
			{menuItems.map((item) => (
				<div key={item._id} className="border-b border-blue-500/40 last:border-b-0">
					{item.children.length === 0 ? (
						// Oddiy menyu elementi - div element
						<div
							onClick={() => handleNavigate(item.slug)}
							className="w-full py-4 px-5 text-white hover:text-yellow-300 hover:bg-blue-700/50 cursor-pointer transition-all duration-200 active:bg-blue-700/70"
						>
							<div className="flex items-center">
								<span className={`${menuItems.length > 7 ? 'text-sm' : 'text-base'} font-semibold`}>
									{item.title}
								</span>
							</div>
						</div>
					) : (
						// Dropdown menyu elementi
						<div className="w-full">
							{/* Asosiy menyu elementi - div element */}
							<div
								onClick={() => toggleMenu(`mobile-${item._id}`)}
								className="w-full py-4 px-5 text-white hover:text-yellow-300 hover:bg-blue-700/50 cursor-pointer transition-all duration-200 active:bg-blue-700/70"
							>
								<div className="flex items-center justify-between">
									<span className={`${menuItems.length > 7 ? 'text-sm' : 'text-base'} font-semibold`}>
										{item.title}
									</span>
									<ChevronDown
										size={menuItems.length > 7 ? 16 : 18}
										className={`transition-transform duration-300 ${openMenu === `mobile-${item._id}` ? "rotate-180 text-yellow-300" : ""}`}
									/>
								</div>
							</div>

							{/* Submenu - ochilganda ko'rinadi */}
							{openMenu === `mobile-${item._id}` && (
								<div className="bg-blue-700/40 backdrop-blur-sm">
									{item.children.map((child) => (
										<div
											key={child._id}
											onClick={() => handleNavigate(child.slug)}
											className="w-full py-3.5 px-8 text-white hover:text-yellow-300 hover:bg-blue-700/60 cursor-pointer transition-all duration-200 active:bg-blue-700/80 border-t border-blue-600/50 first:border-t-0"
										>
											<div className="flex items-center">
												<span className={`${menuItems.length > 7 ? 'text-xs' : 'text-sm'} font-medium`}>
													{child.title}
												</span>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			))}

			{/* Bog'lanish - div element */}
			<div
				onClick={() => handleNavigate("/contact")}
				className="w-full py-4 px-5 text-white hover:text-yellow-300 hover:bg-blue-700/50 cursor-pointer transition-all duration-200 active:bg-blue-700/70 border-t border-blue-500/40"
			>
				<div className="flex items-center">
					<span className={`${menuItems.length > 7 ? 'text-sm' : 'text-base'} font-semibold`}>
						{t.contact}
					</span>
				</div>
			</div>
		</div>
	)

	// Asosiy background
	const mainBackground = "bg-blue-600"

	// Navbar balandligini hisoblash
	const getNavbarHeight = () => {
		return menuItems.length > 7 ? "h-[120px]" : "h-[140px]"
	}

	return (
		<>
			{/* Navbar komponenti */}
			<nav className={`fixed top-0 left-0 right-0 z-50 w-full ${mainBackground}`}>
				{/* Tepa qismi - Logo va funksiyalar */}
				<div className="px-4 sm:px-6 lg:px-8 xl:px-12 mx-auto">
					<div className={`flex items-center justify-between ${menuItems.length > 7 ? 'py-3 lg:py-4' : 'py-4 lg:py-5'}`}>
						{/* Logo va nom */}
						<div
							onClick={handleHomeNavigate}
							className="flex items-center space-x-3 lg:space-x-4 cursor-pointer flex-shrink-0 group"
						>
							<img
								src="/logo.png"
								alt="Logo"
								className={`${menuItems.length > 7 ? 'h-10 sm:h-12 lg:h-14' : 'h-12 sm:h-14 lg:h-16'} w-auto transition-transform duration-300 group-hover:scale-105`}
							/>
							<div className="hidden sm:block">
								<div className={`${menuItems.length > 7 ? 'text-xs sm:text-sm lg:text-base' : 'text-sm sm:text-base lg:text-lg'} font-bold text-white leading-tight`}>
									{t.samarkandRegion}
								</div>
								<div className={`${menuItems.length > 7 ? 'text-xs lg:text-sm' : 'text-xs sm:text-sm lg:text-base'} font-semibold text-white/90 mt-0.5 sm:mt-1 leading-tight max-w-xs sm:max-w-sm lg:max-w-md`}>
									{t.zarafshonIrrigation}
								</div>
							</div>
						</div>

						{/* O'ng tomondagi funksiyalar */}
						<div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
							{/* Maxsus Imkoniyatlar tugmasi */}
							<button
								onClick={handleAccessibilityClick}
								className={`${menuItems.length > 7 ? 'p-1.5 sm:p-2' : 'p-2 sm:p-2.5'} text-white hover:text-yellow-300 hover:bg-blue-700/50 rounded-lg transition-all duration-300 group`}
								title={t.accessibility}
							>
								<Eye size={menuItems.length > 7 ? 18 : 20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
							</button>

							{/* Til tanlash */}
							<div className="relative">
								<select
									value={language}
									onChange={(e) => handleLanguageChange(e.target.value)}
									className={`appearance-none border border-white/40 rounded-lg ${menuItems.length > 7 ? 'px-2 sm:px-3 py-1 sm:py-1.5 pr-6 sm:pr-8 text-xs sm:text-sm' : 'px-3 sm:px-4 py-1.5 sm:py-2 pr-8 sm:pr-10 text-sm sm:text-base'} focus:outline-none focus:ring-1 focus:ring-yellow-300 cursor-pointer font-medium bg-blue-700/50 text-white hover:bg-blue-700 transition-all duration-300`}
								>
									<option value="uz" className="text-gray-900 bg-white">O'zbekcha</option>
									<option value="ru" className="text-gray-900 bg-white">Русский</option>
									<option value="en" className="text-gray-900 bg-white">English</option>
								</select>
								<ChevronDown
									size={menuItems.length > 7 ? 14 : 16}
									className={`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none ${menuItems.length > 7 ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'}`}
								/>
							</div>

							{/* Mobil menyu tugmasi */}
							<button
								className="lg:hidden p-1.5 sm:p-2 rounded-lg border border-white/40 text-white hover:text-yellow-300 hover:border-yellow-300 hover:bg-blue-700/50 transition-all duration-300"
								onClick={() => setMobileOpen((prev) => !prev)}
							>
								{mobileOpen ? (
									<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								) : (
									<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									</svg>
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Pastki qismi - Asosiy navigatsiya menyusi */}
				<div className="hidden lg:block bg-blue-600">
					<div className="px-4 sm:px-6 lg:px-8 xl:px-12 mx-auto">
						<div className={`flex justify-center items-center ${menuItems.length > 7 ? 'py-1' : 'py-2'}`}>
							{renderDesktopMenu()}
						</div>
					</div>
				</div>

				{/* Mobil menyu - TO'LIQ TUZATILGAN */}
				<div
					className={`lg:hidden transition-all duration-300 ${mobileOpen ? "block opacity-100" : "hidden opacity-0"}`}
				>
					{renderMobileMenu()}
				</div>
			</nav>

			{/* Bo'sh joy - Navbar balandligiga teng margin-top */}
			<div className={`${getNavbarHeight()} w-full`} />

			{/* Maxsus Imkoniyatlar Sidebar */}
			<div className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white z-50 transform transition-transform duration-300 ease-in-out ${showAccessibilityModal ? 'translate-x-0' : 'translate-x-full'}`}>
				{/* Sidebar sarlavhasi */}
				<div className="bg-blue-600 text-white p-6 flex justify-between items-center">
					<div>
						<h2 className="text-xl font-bold">{t.accessibilitySettings}</h2>
						<p className="text-blue-100 text-sm mt-1">{t.customizeSite}</p>
					</div>
					<button
						onClick={handleCloseModal}
						className="text-white hover:text-yellow-300 transition-colors p-1 rounded-lg hover:bg-blue-500/30"
					>
						<X size={24} />
					</button>
				</div>

				{/* Sidebar kontenti */}
				<div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-120px)]">
					{/* Mavzu */}
					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-4">{t.theme}</h3>
						<div className="grid grid-cols-2 gap-4">
							<button
								onClick={() => handleThemeChange('normal')}
								className={`py-4 px-4 border rounded-lg transition-all duration-300 flex items-center justify-center gap-3 ${accessibilitySettings.theme === 'normal'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-gray-300 hover:border-blue-400'
									}`}
							>
								<Sun size={22} />
								<span className="text-base font-medium">{t.normalTheme}</span>
							</button>
							<button
								onClick={() => handleThemeChange('grayscale')}
								className={`py-4 px-4 border rounded-lg transition-all duration-300 flex items-center justify-center gap-3 ${accessibilitySettings.theme === 'grayscale'
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-gray-300 hover:border-blue-400'
									}`}
							>
								<Moon size={22} />
								<span className="text-base font-medium">{t.grayscaleTheme}</span>
							</button>
						</div>
					</div>

					{/* Shrift o'lchami */}
					<div>
						<h3 className="text-lg font-semibold text-gray-800 mb-4">
							{t.fontSize} - <span className="text-blue-600">{accessibilitySettings.fontSize}%</span>
						</h3>
						<div className="bg-gray-50 rounded-lg p-5">
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
								<div className="flex justify-between text-sm text-gray-600 mt-3">
									<span className="font-medium">50%</span>
									<span className="font-medium">100%</span>
									<span className="font-medium">150%</span>
									<span className="font-medium">200%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar pastki qismi */}
				<div className="absolute bottom-0 left-0 right-0 bg-gray-50 px-6 py-5 border-t border-gray-300 flex justify-between items-center">
					<button
						onClick={handleResetAll}
						className="px-6 py-2.5 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium text-sm"
					>
						{t.reset}
					</button>
					<button
						onClick={handleCloseModal}
						className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium text-sm"
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
		</>
	)
}

export default Navbar
import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const BASE_URL = import.meta.env.VITE_BASE_URL

// Til ma'lumotlari
const translations = {
	uz: {
		welcome: "Tizimga xush kelibsiz",
		username: "Foydalanuvchi nomi",
		password: "Parol",
		usernamePlaceholder: "Foydalanuvchi nomi",
		passwordPlaceholder: "Parol",
		login: "Tizimga kirish",
		loading: "Kirilmoqda...",
		error: "Login yoki parol noto'g'ri!"
	},
	ru: {
		welcome: "Добро пожаловать в систему",
		username: "Имя пользователя",
		password: "Пароль",
		usernamePlaceholder: "Имя пользователя",
		passwordPlaceholder: "Пароль",
		login: "Войти в систему",
		loading: "Вход...",
		error: "Неверный логин или пароль!"
	},
	en: {
		welcome: "Welcome to the system",
		username: "Username",
		password: "Password",
		usernamePlaceholder: "Username",
		passwordPlaceholder: "Password",
		login: "Login to system",
		loading: "Logging in...",
		error: "Incorrect login or password!"
	}
}

const Login = () => {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [banner, setBanner] = useState(null)
	const [bannerLoading, setBannerLoading] = useState(true)
	const [language, setLanguage] = useState("uz")
	const navigate = useNavigate()

	// 🌐 Backend'dan banner ma'lumotlarini olish
	useEffect(() => {
		const fetchBanner = async () => {
			try {
				setBannerLoading(true)
				const res = await axios.get(`${BASE_URL}/api/banner/getOne`)
				if (res.data?.banner) {
					setBanner(res.data.banner)
				}
			} catch (err) {
				console.error("Bannerni olishda xatolik:", err.message)
			} finally {
				setBannerLoading(false)
			}
		}
		fetchBanner()
	}, [])

	// LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
	}, [])

	// Tilni o'zgartirish funksiyasi
	const changeLanguage = (lang) => {
		setLanguage(lang)
		localStorage.setItem("lang", lang)
	}

	const handleLogin = async (e) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			// 🔹 Backend login so‘rovi
			const res = await axios.post(`${BASE_URL}/api/user/login`, {
				username,
				password,
			})

			if (res.data?.token && res.data?.role) {
				// 🔹 Token va role/content-type saqlash
				localStorage.setItem("token", res.data.token)
				localStorage.setItem("content-type", res.data.role)

				// 🔹 Redirect
				if (res.data.role === "admin") navigate("/admin")
				else navigate("/") // boshqa rollar uchun route
			} else {
				alert(translations[language].error)
			}
		} catch (err) {
			console.error("Login xatolik:", err)
			alert(translations[language].error)
		} finally {
			setIsLoading(false)
		}
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	const backgroundImage = banner?.photo
		? `${BASE_URL}${banner.photo}`
		: "/partner1.jpg"

	const t = translations[language]

	return (
		<div
			className="flex justify-center items-center min-h-screen p-4 relative"
			style={{
				backgroundImage: `url(${backgroundImage})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat'
			}}
		>
			{/* Overlay for readability */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

			{/* Language Switcher */}
			<div className="absolute top-4 right-4 z-20">
				<div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-1">
					<div className="flex space-x-1">
						{["uz", "ru", "en"].map((lang) => (
							<button
								key={lang}
								onClick={() => changeLanguage(lang)}
								className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${language === lang
									? "bg-white/20 text-white"
									: "text-white/70 hover:text-white hover:bg-white/10"
									}`}
							>
								{lang.toUpperCase()}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="w-full max-w-md relative z-10">
				{/* Glassmorphism Card */}
				<div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">

					{/* Header */}
					<div className="p-8 text-center">
						<h1 className="text-3xl font-bold text-white mb-2">Samarqand viloyati</h1>
						<h2 className="text-xl font-semibold text-blue-100 mb-2">"Zarafshon" irrigatsiya tizimi</h2>
						<p className="text-blue-100 text-sm">{t.welcome}</p>
					</div>

					{/* Form */}
					<form onSubmit={handleLogin} className="p-8">
						{/* Username */}
						<div className="mb-6">
							<label className="block text-white text-sm font-medium mb-3">
								{t.username}
							</label>
							<div className="relative group">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</div>
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 backdrop-blur-sm"
									placeholder={t.usernamePlaceholder}
									required
								/>
							</div>
						</div>

						{/* Password */}
						<div className="mb-8">
							<label className="block text-white text-sm font-medium mb-3">
								{t.password}
							</label>
							<div className="relative group">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<svg className="h-5 w-5 text-blue-300 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</div>
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all duration-300 backdrop-blur-sm"
									placeholder={t.passwordPlaceholder}
									required
								/>
								<button
									type="button"
									onClick={togglePasswordVisibility}
									className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-white transition-colors"
								>
									{showPassword ? (
										<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
										</svg>
									) : (
										<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
						</div>

						{/* Login Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 disabled:from-blue-400 disabled:to-green-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
						>
							{isLoading ? (
								<>
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									{t.loading}
								</>
							) : (
								<>{t.login}</>
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}

export default Login
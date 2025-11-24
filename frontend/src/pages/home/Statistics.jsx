import { ArrowRight, Briefcase, Building2, Calendar, Globe, MapPin, Target, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

const Statistics = () => {
	const [language, setLanguage] = useState("uz")
	const [expandedCards, setExpandedCards] = useState({})
	const [programs, setPrograms] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const BASE_URL = import.meta.env.VITE_BASE_URL

	// LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
	}, [])

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

	// API dan dasturlarni olish
	useEffect(() => {
		const fetchPrograms = async () => {
			try {
				setLoading(true)
				setError(null)
				const response = await fetch(`${BASE_URL}/api/program/getAll/${language}`)

				if (!response.ok) {
					// Agar 400 yoki boshqa xatolik bo'lsa, faqat bo'sh array qaytaramiz
					console.log("API dan ma'lumot olishda xatolik:", response.status)
					setPrograms([])
					return
				}

				const data = await response.json()

				if (data.success) {
					setPrograms(data.programs || [])
				} else {
					// Agar success false bo'lsa, bo'sh array qaytaramiz
					console.log("API success false:", data.message)
					setPrograms([])
				}
			} catch (err) {
				// Xatolik bo'lsa ham, faqat console ga yozamiz
				console.log("Dasturlarni olishda xatolik:", err.message)
				setPrograms([])
			} finally {
				setLoading(false)
			}
		}

		fetchPrograms()
	}, [language, BASE_URL])

	// Cardni kengaytirish/yig'ish
	const toggleExpand = (id) => {
		setExpandedCards(prev => ({
			...prev,
			[id]: !prev[id]
		}))
	}

	// Tarjima matnlari
	const translations = {
		uz: {
			title: "Yil Dasturi",
			subtitle: "Korxona faoliyati, yirik loyihalar va xalqaro hamkorlik haqida ma'lumotlar",
			readMore: "Batafsil",
			readLess: "Yig'ish",
			loading: "Yuklanmoqda...",
			noData: "Hozircha dasturlar mavjud emas",
			yearProgram: "Yil Dasturi"
		},
		ru: {
			title: "Программа Года",
			subtitle: "Информация о деятельности предприятий, крупных проектах и международном сотрудничестве",
			readMore: "Подробнее",
			readLess: "Свернуть",
			loading: "Загрузка...",
			noData: "Программы пока не добавлены",
			yearProgram: "Программа Года"
		},
		en: {
			title: "Year Program",
			subtitle: "Information about enterprise activities, major projects and international cooperation",
			readMore: "Read More",
			readLess: "Read Less",
			loading: "Loading...",
			noData: "No programs available yet",
			yearProgram: "Year Program"
		}
	}

	const t = translations[language] || translations.uz

	// API dan kelgan dasturni local formatga o'giramiz
	const transformProgramData = (program) => {
		// Iconlarni tanlash uchun mapping
		const iconMap = {
			0: Building2,
			1: Target,
			2: Globe,
			3: TrendingUp,
			4: MapPin,
			5: Briefcase,
			default: Calendar
		}

		// Ranglar mapping
		const colorMap = {
			0: "blue",
			1: "green",
			2: "purple",
			3: "orange",
			4: "red",
			5: "cyan",
			default: "blue"
		}

		const iconIndex = program._id ? parseInt(program._id[program._id.length - 1], 16) % 6 : 0
		const colorIndex = program._id ? parseInt(program._id[program._id.length - 2], 16) % 6 : 0

		return {
			id: program._id,
			title: program.title || "Dastur",
			description: program.description || "Tavsif mavjud emas",
			fullDescription: program.description || "Tavsif mavjud emas",
			image: program.photo ? `${BASE_URL}${program.photo}` : "/default-program.jpg",
			icon: iconMap[iconIndex] || iconMap.default,
			color: colorMap[colorIndex] || colorMap.default,
			category: "program",
			createdAt: program.createdAt,
			updatedAt: program.updatedAt
		}
	}

	// Rang konfiguratsiyasi
	const colorConfig = {
		blue: {
			text: "text-blue-600",
			hover: "hover:text-blue-700"
		},
		green: {
			text: "text-green-600",
			hover: "hover:text-green-700"
		},
		purple: {
			text: "text-purple-600",
			hover: "hover:text-purple-700"
		},
		orange: {
			text: "text-orange-600",
			hover: "hover:text-orange-700"
		},
		red: {
			text: "text-red-600",
			hover: "hover:text-red-700"
		},
		cyan: {
			text: "text-cyan-600",
			hover: "hover:text-cyan-700"
		}
	}

	// Transform qilingan dasturlar
	const transformedPrograms = programs.map(transformProgramData)

	// Loading holati
	if (loading) {
		return (
			<section id="statistics" className="py-16 bg-gradient-to-br from-gray-50 to-white">
				<div className="container mx-auto px-4">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">{t.loading}</p>
					</div>
				</div>
			</section>
		)
	}

	// Ma'lumot yo'q holati
	if (transformedPrograms.length === 0) {
		return (
			<section id="statistics" className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 opacity-5">
					<div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl"></div>
					<div className="absolute top-32 right-20 w-16 h-16 bg-green-400 rounded-full blur-xl"></div>
					<div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-400 rounded-full blur-xl"></div>
				</div>

				<div className="container mx-auto px-4 relative z-10">
					{/* Sarlavha */}
					<div className="text-center mb-12">
						<div className="inline-flex items-center gap-3 mb-4">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-800">
								{t.title}
							</h2>
						</div>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
							{t.subtitle}
						</p>
						<div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
					</div>

			
				</div>
			</section>
		)
	}

	return (
		<section id="statistics" className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl"></div>
				<div className="absolute top-32 right-20 w-16 h-16 bg-green-400 rounded-full blur-xl"></div>
				<div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-400 rounded-full blur-xl"></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				{/* Sarlavha */}
				<div className="text-center mb-12">
					<div className="inline-flex items-center gap-3 mb-4">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-800">
							{t.title}
						</h2>
					</div>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
						{t.subtitle}
					</p>
					<div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-6 rounded-full"></div>
				</div>

				{/* Program kartalari */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{transformedPrograms.map((item) => {
						const IconComponent = item.icon
						const colors = colorConfig[item.color]
						const isExpanded = expandedCards[item.id]

						return (
							<div
								key={item.id}
								className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-200"
							>
								{/* Rasm qismi */}
								<div className="relative h-48 overflow-hidden">
									<img
										src={item.image}
										alt={item.title}
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
										onError={(e) => {
											e.target.src = "https://via.placeholder.com/400x200?text=Rasm+Yuklanmadi"
										}}
									/>
									{/* Gradient overlay */}
									<div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80`}></div>

									{/* Icon va category */}
									<div className="absolute top-4 left-4">
										<div className={`p-2 rounded-xl bg-white/90 backdrop-blur-sm ${colors.text}`}>
											<IconComponent size={20} />
										</div>
									</div>

									{/* Sarlavha rasm ustida */}
									<div className="absolute bottom-4 left-4 right-4">
										<h3 className="text-xl font-bold text-white mb-2">
											{item.title}
										</h3>
									</div>
								</div>

								{/* Kontent qismi */}
								<div className="p-6">
									{/* Tavsif */}
									<div className="mb-4">
										<p className={`text-gray-600 leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
											{isExpanded ? item.fullDescription : item.description}
										</p>
									</div>

									{/* Batafsil link */}
									<button
										onClick={() => toggleExpand(item.id)}
										className={`
											inline-flex items-center gap-1 font-medium
											${colors.text} ${colors.hover}
											transition-all duration-300
											underline decoration-transparent hover:decoration-current
										`}
									>
										<span className="text-sm">
											{isExpanded ? t.readLess : t.readMore}
										</span>
										<ArrowRight
											size={14}
											className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
										/>
									</button>
								</div>
							</div>
						)
					})}
				</div>

				{/* Bottom decorative element */}
				<div className="text-center mt-12">
					<div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-gray-200 shadow-lg">
						<div className="flex space-x-1">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
							<div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
							<div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
						</div>
						<span className="text-sm font-medium text-gray-600">
							{t.title} - {new Date().getFullYear()}
						</span>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Statistics
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const Technologies = () => {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isPlaying, setIsPlaying] = useState(true)
	const [selectedTech, setSelectedTech] = useState(null)
	const [language, setLanguage] = useState("uz")
	const [technologies, setTechnologies] = useState([])
	const [loading, setLoading] = useState(true)

	const BASE_URL = import.meta.env.VITE_BASE_URL

	// Til sozlamalari va ma'lumotlarni olish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
		fetchTechnologies(savedLang)
	}, [])

	// Til o'zgarganda yangilash
	useEffect(() => {
		const handleStorageChange = () => {
			const savedLang = localStorage.getItem("lang") || "uz"
			setLanguage(savedLang)
			fetchTechnologies(savedLang)
		}

		window.addEventListener('storage', handleStorageChange)

		const interval = setInterval(() => {
			const savedLang = localStorage.getItem("lang") || "uz"
			if (savedLang !== language) {
				setLanguage(savedLang)
				fetchTechnologies(savedLang)
			}
		}, 1000)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
	}, [language])

	// API dan texnologiyalarni olish
	const fetchTechnologies = async (lang = "uz") => {
		try {
			setLoading(true)
			const response = await fetch(`${BASE_URL}/api/technologies/getAll/${lang}`)

			// Agar 400 status kelsa yoki boshqa xatolik bo'lsa, oddiygina bo'sh array qaytaramiz
			if (!response.ok) {
				console.log("API dan ma'lumot olishda xatolik, bo'sh array qaytarilyapti")
				setTechnologies([])
				return
			}

			const data = await response.json()

			if (data.success && data.technologies && data.technologies.length > 0) {
				setTechnologies(data.technologies)
			} else {
				// Agar technologies bo'sh array bo'lsa yoki mavjud bo'lmasa
				setTechnologies([])
			}
		} catch (err) {
			console.log("API so'rovida xatolik, bo'sh array qaytarilyapti:", err.message)
			setTechnologies([])
		} finally {
			setLoading(false)
		}
	}

	// Tarjimalar
	const translations = {
		uz: {
			title: "Zamonaviy suv xo'jaligi tizimlarini joriy etish orqali samaradorlikni oshirish",
			subtitle: "Biz ilg'or texnologiyalar va innovatsion yechimlar yordamida suv resurslarini samarali boshqarish va tejash tizimlarini taklif etamiz.",
			viewDetails: "Batafsil ma'lumot",
			loading: "Yuklanmoqda...",
			noData: "Hozircha texnologiyalar mavjud emas"
		},
		ru: {
			title: "Повышение эффективности через внедрение современных систем водного хозяйства",
			subtitle: "Мы предлагаем системы эффективного управления и экономии водных ресурсов с помощью передовых технологий и инновационных решений.",
			viewDetails: "Подробнее",
			loading: "Загрузка...",
			noData: "Технологии пока не добавлены"
		},
		en: {
			title: "Increasing Efficiency Through Modern Water Management Systems",
			subtitle: "We offer efficient water resource management and conservation systems using advanced technologies and innovative solutions.",
			viewDetails: "View Details",
			loading: "Loading...",
			noData: "No technologies available yet"
		}
	}

	const t = translations[language] || translations.uz

	// API dan kelgan texnologiyani local formatga o'giramiz
	const transformTechnologyData = (tech) => {
		return {
			id: tech._id,
			title: tech.title || "Texnologiya",
			description: tech.description || "Tavsif mavjud emas",
			fullDescription: tech.description || "Tavsif mavjud emas",
			image: tech.photo ? `${BASE_URL}${tech.photo}` : "/default-tech.jpg"
		}
	}

	// Transform qilingan texnologiyalar
	const transformedTechnologies = technologies.map(transformTechnologyData)

	// Avtomatik carousel
	useEffect(() => {
		if (!isPlaying || transformedTechnologies.length === 0) return

		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) =>
				prevIndex === transformedTechnologies.length - 1 ? 0 : prevIndex + 1
			)
		}, 5000)

		return () => clearInterval(interval)
	}, [isPlaying, transformedTechnologies.length])

	// Navigatsiya funksiyalari
	const nextSlide = () => {
		if (transformedTechnologies.length === 0) return
		setCurrentIndex(currentIndex === transformedTechnologies.length - 1 ? 0 : currentIndex + 1)
	}

	const prevSlide = () => {
		if (transformedTechnologies.length === 0) return
		setCurrentIndex(currentIndex === 0 ? transformedTechnologies.length - 1 : currentIndex - 1)
	}

	const goToSlide = (index) => {
		setCurrentIndex(index)
	}

	// Loading holati
	if (loading) {
		return (
			<section id="technologies" className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
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
	if (transformedTechnologies.length === 0) {
		return (
			<section id="technologies" className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
				<div className="container mx-auto px-4">
					<div className="text-center text-gray-600">
						<p>{t.noData}</p>
					</div>
				</div>
			</section>
		)
	}

	const currentTech = transformedTechnologies[currentIndex]

	return (
		<section id="technologies" className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50 relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute top-20 right-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
				<div className="absolute bottom-20 left-10 w-24 h-24 bg-cyan-400 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-green-400 rounded-full blur-3xl"></div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				{/* Sarlavha */}
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
						{t.title}
					</h2>
					<p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
						{t.subtitle}
					</p>
					<div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mt-6 rounded-full"></div>
				</div>

				{/* Asosiy carousel */}
				<div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
					{/* Rasm va kontent */}
					<div className="flex flex-col lg:flex-row">
						{/* Rasm qismi - katta */}
						<div className="lg:w-1/2 h-80 lg:h-96 relative">
							<img
								src={currentTech.image}
								alt={currentTech.title}
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.src = "https://via.placeholder.com/800x400?text=Rasm+Yuklanmadi"
								}}
							/>
							{/* Gradient overlay */}
							<div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>

							{/* Navigatsiya tugmalari */}
							<button
								onClick={prevSlide}
								className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
							>
								<ChevronLeft size={24} />
							</button>
							<button
								onClick={nextSlide}
								className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110"
							>
								<ChevronRight size={24} />
							</button>

							{/* Play/Pause tugmasi */}
							<button
								onClick={() => setIsPlaying(!isPlaying)}
								className="absolute bottom-4 right-4 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300"
							>
								{isPlaying ? <Pause size={20} /> : <Play size={20} />}
							</button>
						</div>

						{/* Matn qismi */}
						<div className="lg:w-1/2 p-8 flex flex-col justify-center">
							<h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
								{currentTech.title}
							</h3>
							<p className="text-gray-600 text-lg leading-relaxed mb-6">
								{currentTech.description}
							</p>

							{/* Batafsil link */}
							<button
								onClick={() => setSelectedTech(currentTech)}
								className="text-blue-600 hover:text-blue-700 font-medium underline decoration-transparent hover:decoration-blue-600 transition-all duration-300 w-fit"
							>
								{t.viewDetails}
							</button>
						</div>
					</div>
				</div>

				{/* Carousel indikatorlari */}
				<div className="flex justify-center space-x-3 mb-12">
					{transformedTechnologies.map((_, index) => (
						<button
							key={index}
							onClick={() => goToSlide(index)}
							className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
								? 'bg-blue-600 w-8'
								: 'bg-gray-300 hover:bg-gray-400'
								}`}
						/>
					))}
				</div>
			</div>

			{/* Modal */}
			{selectedTech && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
						<div className="flex flex-col lg:flex-row">
							{/* Rasm qismi */}
							<div className="lg:w-1/2">
								<img
									src={selectedTech.image}
									alt={selectedTech.title}
									className="w-full h-64 lg:h-full object-cover"
									onError={(e) => {
										e.target.src = "https://via.placeholder.com/600x400?text=Rasm+Yuklanmadi"
									}}
								/>
							</div>

							{/* Matn qismi */}
							<div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto max-h-[60vh] lg:max-h-none">
								{/* Yopish tugmasi */}
								<button
									onClick={() => setSelectedTech(null)}
									className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 z-10"
								>
									<X size={20} />
								</button>

								<h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">
									{selectedTech.title}
								</h3>

								<p className="text-gray-600 leading-relaxed">
									{selectedTech.fullDescription}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}

export default Technologies
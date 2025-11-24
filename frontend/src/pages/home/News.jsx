import axios from 'axios'
import { ArrowRight, Calendar, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom'

const News = () => {
	const navigate = useNavigate()
	const [language, setLanguage] = useState("uz")
	const [news, setNews] = useState([])
	const [loading, setLoading] = useState(true)
	const BASE_URL = import.meta.env.VITE_BASE_URL

	// LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
		fetchNews(savedLang)
	}, [])

	// Til o'zgarganda yangilash
	useEffect(() => {
		const handleStorageChange = () => {
			const savedLang = localStorage.getItem("lang") || "uz"
			if (savedLang !== language) {
				setLanguage(savedLang)
				fetchNews(savedLang)
			}
		}

		window.addEventListener('storage', handleStorageChange)

		const interval = setInterval(() => {
			const savedLang = localStorage.getItem("lang") || "uz"
			if (savedLang !== language) {
				setLanguage(savedLang)
				fetchNews(savedLang)
			}
		}, 1000)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
	}, [language])

	// API dan yangiliklarni olish
	const fetchNews = async (lang = language) => {
		try {
			setLoading(true)
			const res = await axios.get(`${BASE_URL}/api/news/getOne/${lang}`)
			if (res.data.success && res.data.news.length > 0) {
				setNews(res.data.news)
			} else {
				// Agar ma'lumot bo'sh bo'lsa, example data ko'rsatish
				setNews(getExampleData())
			}
		} catch (error) {
			console.error("Yangiliklarni olishda xatolik:", error)
			// Example data agar API ishlamasa
			setNews(getExampleData())
		} finally {
			setLoading(false)
		}
	}

	// Rasm URL ni to'g'ri shakllantirish
	const getImageUrl = (photo) => {
		if (!photo) return "/partner2.jpg"

		// Agar public papkadagi rasm bo'lsa (slash bilan boshlansa)
		if (photo.startsWith('/')) {
			return photo
		}

		// Agar to'liq URL bo'lsa
		if (photo.startsWith('http')) {
			return photo
		}

		// Agar API dan kelgan rasm bo'lsa
		return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`
	}

	// Sana formatini o'zgartirish (2025-11-05T06:24:56.464Z -> 2025-11-05)
	const formatDate = (dateString) => {
		if (!dateString) return ""

		// Agar dateString ISO formatida bo'lsa (T bilan)
		if (dateString.includes('T')) {
			return dateString.split('T')[0]
		}

		// Agar oddiy sana formatida bo'lsa
		return dateString
	}

	// Har bir yangilik uchun photos massividan random rasm tanlash
	const getRandomPhoto = (photos) => {
		if (!photos || photos.length === 0) return "/partner2.jpg"

		// Agar photos string bo'lsa (bitta rasm)
		if (typeof photos === 'string') {
			return photos
		}

		// Agar faqat bitta rasm bo'lsa, o'shasini qaytarish
		if (photos.length === 1) {
			return photos[0]
		}

		// Random index tanlash
		const randomIndex = Math.floor(Math.random() * photos.length)
		return photos[randomIndex]
	}

	const handleNews = () => {
		navigate('/allnews')
	}

	// Tarjima matnlari - faqat taglar
	const translations = {
		uz: {
			title: "Eng So'nggi Yangiliklar",
			seeAll: "Barcha Yangiliklar",
			newsLabel: "Yangiliklar",
			loading: "Yangiliklar yuklanmoqda..."
		},
		ru: {
			title: "Последние новости",
			seeAll: "Все Новости",
			newsLabel: "Новости",
			loading: "Новости загружаются..."
		},
		en: {
			title: "Latest News",
			seeAll: "All News",
			newsLabel: "News",
			loading: "Loading news..."
		}
	}

	const t = translations[language] || translations.uz

	// Faqat dastlabki 3ta yangilikni olish
	const displayedNews = news.slice(0, 3)

	if (loading) {
		return (
			<section id="news" className="py-12 sm:py-16 lg:py-20 relative min-h-screen">
				{/* Background image - partner2.jpg */}
				<div
					className="absolute inset-0 bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage: `url('/partner2.jpg')`,
					}}
				/>

				{/* Overlay - juda yengil */}
				<div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="text-center mb-8 sm:mb-12">
						<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
							{t.title}
						</h2>
						<div className="w-20 sm:w-24 h-1 bg-blue-600 mx-auto mb-4 sm:mb-6 rounded-full"></div>
					</div>
					<div className="text-center py-8 sm:py-12">
						<div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
						<p className="text-gray-600 text-sm sm:text-base">{t.loading}</p>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section id="news" className="py-12 sm:py-16 lg:py-20 relative min-h-screen">
			{/* Background image - partner2.jpg */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style={{
					backgroundImage: `url('/partner2.jpg')`,
				}}
			/>

			{/* Overlay - juda yengil, rasm yorqin ko'rinsin */}
			<div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				{/* Sarlavha */}
				<div className="text-center mb-8 sm:mb-12 lg:mb-16">
					<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
						{t.title}
					</h2>
					<p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-3 sm:mb-4 max-w-4xl mx-auto px-4">
						{t.newsLabel}
					</p>
					<div className="w-20 sm:w-24 h-1 bg-blue-600 mx-auto mb-4 sm:mb-6 rounded-full"></div>
				</div>

				{/* Yangiliklar grid - responsive */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 lg:mb-16">
					{displayedNews.map((item, index) => {
						const photoUrl = getImageUrl(getRandomPhoto(item.photos))
						return (
							<div
								key={item.id || index}
								className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 overflow-hidden border border-gray-200"
							>
								{/* Rasm qismi */}
								<div className="relative h-40 sm:h-48 md:h-56 overflow-hidden">
									<img
										src={photoUrl}
										alt={item.title}
										className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
										onError={(e) => {
											// Agar rasm yuklanmasa, default rasmni ko'rsatish
											e.target.src = '/partner2.jpg'
										}}
									/>
									<div className="absolute top-3 sm:top-4 left-3 sm:left-4">
										<span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
											{t.newsLabel}
										</span>
									</div>
									<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</div>

								{/* Kontent qismi */}
								<div className="p-4 sm:p-6">
									{/* Sana va ko'rishlar */}
									<div className="flex items-center justify-between mb-2 sm:mb-3">
										<div className="flex items-center gap-1 sm:gap-2 text-gray-500 text-xs sm:text-sm">
											<Calendar size={14} className="sm:w-4 sm:h-4" />
											<span>{formatDate(item.createdAt)}</span>
										</div>
										<div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
											<Eye size={14} className="sm:w-4 sm:h-4" />
											<span>{item.views}</span>
										</div>
									</div>

									{/* Sarlavha */}
									<h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
										{item.title}
									</h3>

									{/* Tavsif */}
									<p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
										{item.description}
									</p>
								</div>
							</div>
						)
					})}
				</div>

				{/* Barcha yangiliklarni ko'rish tugmasi */}
				{news.length > 0 && (
					<div className="text-center">
						<button
							onClick={handleNews}
							className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 sm:gap-3 mx-auto text-sm sm:text-base"
						>
							<span>{t.seeAll}</span>
							<ArrowRight size={16} className="sm:w-5 sm:h-5" />
						</button>
					</div>
				)}
			</div>
		</section>
	)
}

// Example data function (agar kerak bo'lsa)
const getExampleData = () => {
	return [
		{
			id: 1,
			title: "Suv resurslarini boshqarish yangiliklari",
			description: "Suv xo'jaligi sohasidagi yangi texnologiyalar va innovatsion yechimlar haqida yangiliklar.",
			photos: ["/partner2.jpg"],
			createdAt: "2024-01-15",
			views: 150
		},
		{
			id: 2,
			title: "Irrigatsiya tizimlarini modernizatsiya qilish",
			description: "Zarafshon irrigatsiya tizimlarini yangilash va modernizatsiya qilish bo'yicha ishlar davom etmoqda.",
			photos: ["/partner2.jpg"],
			createdAt: "2024-01-14",
			views: 89
		},
		{
			id: 3,
			title: "Suv tejovchi texnologiyalar",
			description: "Yangi suv tejovchi texnologiyalar va ularning qishloq xo'jaligida qo'llanilishi haqida ma'lumot.",
			photos: ["/partner2.jpg"],
			createdAt: "2024-01-13",
			views: 203
		}
	]
}

export default News
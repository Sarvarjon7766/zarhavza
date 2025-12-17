import axios from 'axios'
import { Calendar, Eye, Play, X } from "lucide-react"
import { useEffect, useState } from "react"
import Footer from '../component/Footer'
import Navbar from '../component/Navbar'

const AllNews = ({ pageData }) => {
	const [language, setLanguage] = useState("uz")
	const [news, setNews] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedNews, setSelectedNews] = useState(null)
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

	// API dan barcha yangiliklarni olish
	const fetchNews = async (lang = language) => {
		try {
			setLoading(true)
			const res = await axios.get(`${BASE_URL}/api/news/getAll/${lang}`)
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

	// Fayl turini aniqlash
	const getFileType = (file) => {
		if (!file) return 'image'

		const fileName = file.toLowerCase()
		if (fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/)) {
			return 'video'
		}
		return 'image'
	}

	// Example data generator
	const getExampleData = () => {
		return [
			{
				id: 1,
				title: "Yangi loyiha ishga tushdi",
				description: "<p><strong>Urgut EIZ</strong>da yangi sanoat loyihasi muvaffaqiyatli ishga tushirildi. Loyiha mintaqa iqtisodiyotiga sezilarli hissa qo'shadi.</p>",
				photos: ["/partner1.jpg", "/partner1.jpg", "/partner1.jpg"],
				createdAt: "2025-10-30",
				views: 124
			},
			{
				id: 2,
				title: "Investorlar bilan uchrashuv",
				description: "<p>Xalqaro investorlar bilan bo'lib o'tgan uchrashuvda yangi <strong>hamkorlik shartnomalari</strong> imzolandi.</p>",
				photos: ["/partner1.jpg", "/partner1.jpg"],
				createdAt: "2025-10-25",
				views: 89
			},
			{
				id: 3,
				title: "Hudud infratuzilmasi rivojlanmoqda",
				description: "<p>Erkin iqtisodiy zona hududida yangi <em>infratuzilma loyihalari</em> amalga oshirilmog'da.</p>",
				photos: ["/partner1.jpg"],
				createdAt: "2025-10-20",
				views: 156
			},
			{
				id: 4,
				title: "Yangi ish o'rinlari yaratildi",
				description: "<p>Yangi korxonalar ochilishi natijasida <strong>500 dan ortiq</strong> ish o'rinlari yaratildi.</p>",
				photos: ["/partner1.jpg", "/partner1.jpg"],
				createdAt: "2025-10-15",
				views: 203
			},
			{
				id: 5,
				title: "Eksport hajmi oshdi",
				description: "<p>So'nggi chorakda mintaqadan eksport hajmi <strong>25% ga o'sdi</strong>.</p>",
				photos: ["/partner1.jpg"],
				createdAt: "2025-10-10",
				views: 167
			},
			{
				id: 6,
				title: "Texnologiya markazi ochildi",
				description: "<p>Yosh ixtirochilar va <em>startup'lar</em> uchun zamonaviy texnologiya markazi ochildi.</p>",
				photos: ["/partner1.jpg", "/partner1.jpg", "/partner1.jpg"],
				createdAt: "2025-10-05",
				views: 98
			}
		]
	}

	// Media URL ni to'g'ri shakllantirish
	const getMediaUrl = (media) => {
		if (!media) return "/partner1.jpg"

		if (media.startsWith('http')) {
			return media
		}

		return `${BASE_URL}${media.startsWith('/') ? '' : '/'}${media}`
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

	// Har bir yangilik uchun photos massividan random media tanlash
	const getRandomMedia = (photos) => {
		if (!photos || photos.length === 0) return "/partner1.jpg"

		// Agar faqat bitta media bo'lsa, o'shasini qaytarish
		if (photos.length === 1) {
			return photos[0]
		}

		// Random index tanlash
		const randomIndex = Math.floor(Math.random() * photos.length)
		return photos[randomIndex]
	}

	// Media sonini hisoblash
	const getMediaCounts = (photos) => {
		if (!photos || photos.length === 0) {
			return { images: 0, videos: 0 }
		}

		const images = photos.filter(media => getFileType(media) === 'image').length
		const videos = photos.filter(media => getFileType(media) === 'video').length

		return { images, videos }
	}

	// HTML description ni tozalash (faqat text olish)
	const stripHtml = (html) => {
		if (!html) return ''
		const tmp = document.createElement("DIV")
		tmp.innerHTML = html
		return tmp.textContent || tmp.innerText || ""
	}

	// Yangilikni ochish
	const handleOpenNews = (newsItem) => {
		setSelectedNews(newsItem)
	}

	// Modalni yopish
	const handleCloseModal = () => {
		setSelectedNews(null)
	}

	// Media render qilish
	const renderMedia = (media, index, className = "") => {
		const mediaUrl = getMediaUrl(media)
		const fileType = getFileType(media)

		if (fileType === 'video') {
			return (
				<div className={`relative ${className}`}>
					<video
						src={mediaUrl}
						className="w-full h-full object-cover rounded-lg"
						controls
					/>
					<div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
						Video
					</div>
				</div>
			)
		} else {
			return (
				<img
					src={mediaUrl}
					alt={`Media ${index + 1}`}
					className={`w-full h-full object-cover rounded-lg ${className}`}
					onError={(e) => {
						console.error('Rasm yuklanmadi:', mediaUrl)
						e.target.src = '/partner1.jpg'
					}}
				/>
			)
		}
	}

	// Tarjima matnlari
	const translations = {
		uz: {
			title: "So'nggi yangiliklar",
			loading: "Yangiliklar yuklanmoqda...",
			noData: "Hozircha yangiliklar mavjud emas.",
			newsLabel: "Yangilik",
			video: "Video",
			image: "Rasm",
			views: "ko'rish",
			photos: "rasm",
			videos: "video"
		},
		ru: {
			title: "Последние новости",
			loading: "Новости загружаются...",
			noData: "Новости пока недоступны.",
			newsLabel: "Новость",
			video: "Видео",
			image: "Изображение",
			views: "просмотр",
			photos: "изображений",
			videos: "видео"
		},
		en: {
			title: "Latest News",
			loading: "Loading news...",
			noData: "No news available yet.",
			newsLabel: "News",
			video: "Video",
			image: "Image",
			views: "views",
			photos: "photos",
			videos: "videos"
		}
	}

	// Breadcrumb navigation text
	const breadcrumbText = {
		uz: {
			home: "Bosh sahifa",
			news: "Yangiliklar"
		},
		ru: {
			home: "Главная",
			news: "Новости"
		},
		en: {
			home: "Home",
			news: "News"
		}
	}

	// Breadcrumb navigation render qilish
	const renderBreadcrumb = () => {
		const homeText = breadcrumbText[language]?.home || breadcrumbText.uz.home

		return (
			<nav className="flex" aria-label="Breadcrumb">
				<ol className="flex items-center space-x-2 text-sm text-gray-500">
					{/* Bosh sahifa */}
					<li>
						<a href="/" className="hover:text-blue-600 transition-colors duration-200">
							{homeText}
						</a>
					</li>

					{/* ParentTitle bo'lsa */}
					{pageData?.parentTitle && (
						<>
							<li className="flex items-center">
								<svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
								</svg>
								<span className="text-gray-500 hover:text-blue-600 transition-colors duration-200">
									{pageData.parentTitle}
								</span>
							</li>
						</>
					)}

					{/* Joriy sahifa title */}
					<li className="flex items-center">
						<svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
						</svg>
						<span className="text-blue-600 font-medium">
							{pageData?.title || breadcrumbText[language]?.news || breadcrumbText.uz.news}
						</span>
					</li>
				</ol>
			</nav>
		)
	}

	const t = translations[language] || translations.uz

	if (loading) {
		return (
			<div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
				<Navbar />
				<main className="flex-grow container mx-auto px-4 py-10">
					{/* Breadcrumb Navigation */}
					<div className="mb-6">
						{renderBreadcrumb()}
					</div>

					<div className="text-center py-20">
						<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600 text-lg">{t.loading}</p>
					</div>
				</main>
				<Footer />
			</div>
		)
	}

	return (
		<>
			<div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
				{/* 🔹 Navbar */}
				<Navbar />

				{/* 🔹 Asosiy kontent */}
				<main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
					{/* Breadcrumb Navigation */}
					<div className="mb-6">
						{renderBreadcrumb()}
					</div>

					{/* Sarlavha */}
					<div className="text-center mb-12">
						<h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
							{pageData?.title || t.title}
						</h1>
						<div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
					</div>

					{/* 🔹 Yangiliklar mavjud emas */}
					{!news || news.length === 0 ? (
						<div className="text-center py-16">
							<p className="text-gray-500 text-lg">{t.noData}</p>
						</div>
					) : (
						/* 🔹 News grid - FAQAT TITLE KO'RSATILADI */
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{news.map((item, index) => {
								const mediaCounts = getMediaCounts(item.photos)
								const randomMedia = getRandomMedia(item.photos)
								const mediaType = getFileType(randomMedia)

								return (
									<div
										key={item._id || item.id || index}
										className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer"
										onClick={() => handleOpenNews(item)}
									>
										{/* Media qismi */}
										<div className="relative h-56 overflow-hidden">
											{renderMedia(randomMedia, 0, "w-full h-full group-hover:scale-110 transition-transform duration-500")}

											<div className="absolute top-4 left-4">
												<span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
													{t.newsLabel}
												</span>
											</div>

											{/* Video icon */}
											{mediaType === 'video' && (
												<div className="absolute top-4 right-4">
													<span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
														{t.video}
													</span>
												</div>
											)}

											{/* Play icon for videos */}
											{mediaType === 'video' && (
												<div className="absolute inset-0 flex items-center justify-center">
													<div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
														<Play size={32} className="text-white fill-white" />
													</div>
												</div>
											)}

											<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
										</div>

										{/* Kontent qismi - FAQAT TITLE */}
										<div className="p-6">
											{/* Sana va ko'rishlar */}
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-2 text-gray-500 text-sm">
													<Calendar size={16} />
													<span>{formatDate(item.createdAt)}</span>
												</div>
												<div className="flex items-center gap-1 text-gray-500 text-sm">
												
												</div>
											</div>

											{/* Sarlavha - kattaroq va markazda */}
											<h2 className="text-xl font-bold text-gray-800 text-center group-hover:text-blue-600 transition-colors leading-tight min-h-[60px] flex items-center justify-center">
												{item.title}
											</h2>

										
										</div>
									</div>
								)
							})}
						</div>
					)}
				</main>

				{/* 🔹 Footer */}
				<Footer />
			</div>

			{/* 🔹 Yangilik Modal - TITLE VA DESCRIPTION KO'RSATILADI */}
			{selectedNews && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
					<div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
						{/* Yopish tugmasi */}
						<button
							onClick={handleCloseModal}
							className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition-all duration-200 shadow-lg"
						>
							<X size={24} />
						</button>

						{/* Kontent */}
						<div className="flex-1 overflow-y-auto">
							{/* Sarlavha */}
							<div className="text-black p-8 pb-4">
								<h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
									{selectedNews.title}
								</h1>
								<div className="flex justify-center items-center gap-8 text-gray-600 text-lg">
									<div className="flex items-center gap-2">
										<span>{formatDate(selectedNews.createdAt)}</span>
									</div>
								</div>
							</div>

							{/* Media fayllar */}
							{selectedNews.photos && selectedNews.photos.length > 0 && (
								<div className="px-8">
									<div className="grid gap-6">
										{selectedNews.photos.map((media, index) => (
											<div key={index} className="rounded-xl overflow-hidden shadow-lg">
												{renderMedia(
													media,
													index,
													"w-full h-96 md:h-[500px] lg:h-[600px] object-cover hover:scale-105 transition-transform duration-500"
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Tavsif - HTML CONTENT NI KO'RSATISH */}
							<div className="p-8 pt-6">
								<div
									className="prose prose-lg max-w-none text-gray-900"
									dangerouslySetInnerHTML={{ __html: selectedNews.description }}
									style={{
										color: '#000000'
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Global CSS for HTML content */}
			<style jsx global>{`
				/* Modal ichidagi HTML content uchun */
				.prose {
					color: #000000 !important;
				}
				
				.prose p {
					color: #000000 !important;
				}
				
				.prose strong {
					color: #000000 !important;
				}
				
				.prose em {
					color: #000000 !important;
				}
				
				.prose a {
					color: #2563eb !important;
				}
				
				.prose a:hover {
					color: #1d4ed8 !important;
				}
				
				.prose ul, .prose ol {
					color: #000000 !important;
				}
				
				.prose li {
					color: #000000 !important;
				}
				
				.prose blockquote {
					color: #000000 !important;
					border-left-color: #3b82f6;
				}
			`}</style>
		</>
	)
}

export default AllNews
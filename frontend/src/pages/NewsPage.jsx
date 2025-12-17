import axios from 'axios'
import { Calendar, ChevronLeft, ChevronRight, ExternalLink, Eye, Share2, X } from "lucide-react"
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from './component/Footer'
import Navbar from './component/Navbar'

const NewsPage = ({ pageData }) => {
	const navigate = useNavigate()
	const [language, setLanguage] = useState(localStorage.getItem('lang') || 'uz')
	const [news, setNews] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedNews, setSelectedNews] = useState(null)
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [showShareModal, setShowShareModal] = useState(false)
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
			const res = await axios.get(`${BASE_URL}/api/generalnews/getAll/${pageData.key}`)
			if (res.data.success && res.data.news.length > 0) {
				// Tilga qarab title va description'ni tanlash
				const formattedNews = res.data.news.map(item => ({
					...item,
					title: item[`title_${lang}`] || item.title_uz || item.title,
					description: item[`description_${lang}`] || item.description_uz || item.description
				}))
				setNews(formattedNews)
			} else {
				setNews([])
			}
		} catch (error) {
			console.error("Yangiliklarni olishda xatolik:", error)
			setNews([])
		} finally {
			setLoading(false)
		}
	}

	// Rasm URL ni to'g'ri shakllantirish
	const getImageUrl = (photo) => {
		if (!photo) return "/partner1.jpg"

		if (photo.startsWith('http')) {
			return photo
		}

		return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`
	}

	// Sana formatini o'zgartirish
	const formatDate = (dateString) => {
		if (!dateString) return ""

		try {
			const date = new Date(dateString)
			return date.toLocaleDateString(language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})
		} catch (error) {
			return dateString
		}
	}

	// Har bir yangilik uchun photos massividan random rasm tanlash
	const getRandomPhoto = (photos) => {
		if (!photos || photos.length === 0) return "/partner1.jpg"
		if (photos.length === 1) return photos[0]

		const randomIndex = Math.floor(Math.random() * photos.length)
		return photos[randomIndex]
	}

	// Yangilikni ochish
	const handleOpenNews = (newsItem) => {
		setSelectedNews(newsItem)
		setCurrentImageIndex(0)
		document.body.style.overflow = 'hidden'
		// Ko'rishlar sonini oshirish (agar backend'da views field bo'lsa)
		updateViewsCount(newsItem._id)
	}

	// Ko'rishlar sonini yangilash
	const updateViewsCount = async (newsId) => {
		try {
			await axios.put(`${BASE_URL}/api/generalnews/updateViews/${newsId}`)
		} catch (error) {
			console.error("Ko'rishlar sonini yangilashda xatolik:", error)
		}
	}

	// Modalni yopish
	const handleCloseModal = () => {
		setSelectedNews(null)
		setCurrentImageIndex(0)
		setShowShareModal(false)
		document.body.style.overflow = 'auto'
	}

	// Rasmlarni naviqatsiya qilish
	const handleNextImage = () => {
		if (selectedNews?.photos && selectedNews.photos.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === selectedNews.photos.length - 1 ? 0 : prev + 1
			)
		}
	}

	const handlePrevImage = () => {
		if (selectedNews?.photos && selectedNews.photos.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === 0 ? selectedNews.photos.length - 1 : prev - 1
			)
		}
	}

	// Ulashish funksiyasi
	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: selectedNews?.title,
				text: selectedNews?.description?.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
				url: window.location.href
			})
		} else {
			setShowShareModal(true)
		}
	}

	// Linkni copy qilish
	const copyToClipboard = () => {
		navigator.clipboard.writeText(window.location.href)
		alert('Link nusxalandi!')
		setShowShareModal(false)
	}

	// ESC tugmasi bilan modalni yopish
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				handleCloseModal()
			} else if (e.key === 'ArrowRight') {
				handleNextImage()
			} else if (e.key === 'ArrowLeft') {
				handlePrevImage()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [selectedNews, currentImageIndex])

	// Click outside to close
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (selectedNews && e.target.classList.contains('modal-overlay')) {
				handleCloseModal()
			}
		}

		document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [selectedNews])

	// HTML content'ni xavfsiz render qilish
	const renderHtmlContent = (html) => {
		if (!html) return null

		// Xavfsiz HTML render qilish uchun
		const createMarkup = () => {
			return { __html: html }
		}

		return (
			<div
				className="news-content prose prose-lg max-w-none"
				dangerouslySetInnerHTML={createMarkup()}
			/>
		)
	}

	// Tarjima matnlari
	const translations = {
		uz: {
			title: "Barcha Yangiliklar",
			loading: "Yangiliklar yuklanmoqda...",
			noData: "Hozircha yangiliklar mavjud emas.",
			newsLabel: "Yangilik",
			date: "Sana",
			views: "Ko'rishlar",
			close: "Yopish",
			back: "Orqaga",
			share: "Ulashish",
			copyLink: "Linkni nusxalash",
			shareVia: "Orqali ulashish",
			of: "/",
			readMore: "Batafsil o'qish"
		},
		ru: {
			title: "Все Новости",
			loading: "Новости загружаются...",
			noData: "Пока нет новостей.",
			newsLabel: "Новость",
			date: "Дата",
			views: "Просмотры",
			close: "Закрыть",
			back: "Назад",
			share: "Поделиться",
			copyLink: "Копировать ссылку",
			shareVia: "Поделиться через",
			of: "из",
			readMore: "Подробнее"
		},
		en: {
			title: "All News",
			loading: "Loading news...",
			noData: "No news available yet.",
			newsLabel: "News",
			date: "Date",
			views: "Views",
			close: "Close",
			back: "Back",
			share: "Share",
			copyLink: "Copy link",
			shareVia: "Share via",
			of: "of",
			readMore: "Read more"
		}
	}

	// Breadcrumb navigation text
	const breadcrumbText = {
		uz: {
			home: "Bosh sahifa",
			informationService: "Axborot xizmati",
			news: "Yangiliklar"
		},
		ru: {
			home: "Главная",
			informationService: "Информационная служба",
			news: "Новости"
		},
		en: {
			home: "Home",
			informationService: "Information Service",
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

	// CSS for HTML content
	const newsContentStyles = `
		.news-content {
			line-height: 1.8;
			color: #374151;
		}
		
		.news-content p {
			margin-bottom: 1.5rem;
			text-align: justify;
		}
		
		.news-content h1, 
		.news-content h2, 
		.news-content h3, 
		.news-content h4, 
		.news-content h5, 
		.news-content h6 {
			margin-top: 2rem;
			margin-bottom: 1rem;
			color: #1e40af;
			font-weight: bold;
		}
		
		.news-content h1 { font-size: 2em; }
		.news-content h2 { font-size: 1.5em; }
		.news-content h3 { font-size: 1.17em; }
		
		.news-content ul, 
		.news-content ol {
			margin-left: 2rem;
			margin-bottom: 1.5rem;
		}
		
		.news-content li {
			margin-bottom: 0.5rem;
		}
		
		.news-content blockquote {
			border-left: 4px solid #3b82f6;
			padding-left: 1rem;
			margin: 1.5rem 0;
			font-style: italic;
			background-color: #f8fafc;
			padding: 1rem;
		}
		
		.news-content a {
			color: #2563eb;
			text-decoration: underline;
		}
		
		.news-content a:hover {
			color: #1d4ed8;
		}
		
		.news-content img {
			max-width: 100%;
			height: auto;
			border-radius: 0.5rem;
			margin: 1.5rem 0;
		}
		
		.news-content table {
			width: 100%;
			border-collapse: collapse;
			margin: 1.5rem 0;
		}
		
		.news-content table th,
		.news-content table td {
			border: 1px solid #d1d5db;
			padding: 0.75rem;
			text-align: left;
		}
		
		.news-content table th {
			background-color: #f3f4f6;
			font-weight: bold;
		}
		
		.news-content .highlight {
			background-color: #fef3c7;
			padding: 0.25rem 0.5rem;
			border-radius: 0.25rem;
		}
	`

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
			<style>{newsContentStyles}</style>

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
						/* 🔹 News grid */
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{news.map((item, index) => {
								// HTML'dan oddiy matn olish (preview uchun)
								const plainText = item.description?.replace(/<[^>]*>/g, '') || ''
								const previewText = plainText.length > 150
									? plainText.substring(0, 150) + '...'
									: plainText

								return (
									<div
										key={item._id || index}
										className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer"
										onClick={() => handleOpenNews(item)}
									>
										{/* Rasm qismi */}
										<div className="relative h-56 overflow-hidden">
											<img
												src={getImageUrl(getRandomPhoto(item.photos))}
												alt={item.title}
												className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
												onError={(e) => {
													e.target.src = '/partner1.jpg'
												}}
											/>
											<div className="absolute top-4 left-4">
												<span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
													{pageData.title}
												</span>
											</div>

											<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
										</div>

										{/* Kontent qismi */}
										<div className="p-6">
											{/* Sana va ko'rishlar */}
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2 text-gray-500 text-sm">
													<Calendar size={16} />
													<span>{formatDate(item.createdAt)}</span>
												</div>
												
											</div>

											{/* Sarlavha */}
											<h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
												{item.title}
											</h2>

											{/* Qisqa tavsif */}
											<p className="text-gray-600 mb-4 line-clamp-3">
												{previewText}
											</p>

											{/* Read more button */}
											<div className="flex justify-between items-center mt-4">
												<span className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
													{t.readMore}
													<ExternalLink size={14} />
												</span>
											
											</div>
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

			{/* 🔹 Yangilik Modal */}
			{selectedNews && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/80 backdrop-blur-sm">
					<div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
						{/* Yopish tugmasi */}
						<div className="absolute top-4 right-4 z-20 flex gap-2">
							<button
								onClick={handleShare}
								className="bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition-all duration-200 shadow-lg"
								title={t.share}
							>
								<Share2 size={20} />
							</button>
							<button
								onClick={handleCloseModal}
								className="bg-white/90 hover:bg-white text-gray-700 rounded-full p-2 transition-all duration-200 shadow-lg"
								title={t.close}
							>
								<X size={20} />
							</button>
						</div>

						{/* Kontent */}
						<div className="flex-1 overflow-y-auto">
							{/* Sarlavha */}
							<div className="p-8 pb-4 border-b">
								<h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
									{selectedNews.title}
								</h1>
								<div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-gray-600 text-lg">
									<div className="flex items-center gap-2">
										<Calendar size={20} className="text-blue-600" />
										<span>{formatDate(selectedNews.createdAt)}</span>
									</div>
									<div className="flex items-center gap-2">
										
									</div>
								</div>
							</div>

							{/* Rasmlar carousel */}
							{selectedNews.photos && selectedNews.photos.length > 0 && (
								<div className="relative px-8 py-6">
									{/* Prev button */}
									{selectedNews.photos.length > 1 && (
										<button
											onClick={handlePrevImage}
											className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 transition-all duration-200 shadow-lg"
										>
											<ChevronLeft size={24} />
										</button>
									)}

									{/* Main image */}
									<div className="rounded-xl overflow-hidden shadow-lg">
										<img
											src={getImageUrl(selectedNews.photos[currentImageIndex])}
											alt={`${selectedNews.title} - ${currentImageIndex + 1}`}
											className="w-full h-96 md:h-[500px] object-cover transition-all duration-300"
											onError={(e) => {
												e.target.src = '/partner1.jpg'
											}}
										/>
									</div>

									{/* Next button */}
									{selectedNews.photos.length > 1 && (
										<button
											onClick={handleNextImage}
											className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 transition-all duration-200 shadow-lg"
										>
											<ChevronRight size={24} />
										</button>
									)}

									{/* Image counter */}
									{selectedNews.photos.length > 1 && (
										<div className="absolute bottom-4 right-8 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
											{currentImageIndex + 1} {t.of} {selectedNews.photos.length}
										</div>
									)}

									{/* Thumbnails */}
									{selectedNews.photos.length > 1 && (
										<div className="flex justify-center gap-2 mt-4 overflow-x-auto py-2">
											{selectedNews.photos.map((photo, index) => (
												<button
													key={index}
													onClick={() => setCurrentImageIndex(index)}
													className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${index === currentImageIndex
														? 'border-blue-600'
														: 'border-transparent'
														}`}
												>
													<img
														src={getImageUrl(photo)}
														alt={`Thumbnail ${index + 1}`}
														className="w-full h-full object-cover"
													/>
												</button>
											))}
										</div>
									)}
								</div>
							)}

							{/* Tavsif - HTML content */}
							<div className="p-8 pt-6">
								<div className="news-content">
									{renderHtmlContent(selectedNews.description)}
								</div>
							</div>

							{/* Tags yoki kategoriyalar */}
							{selectedNews.tags && selectedNews.tags.length > 0 && (
								<div className="px-8 pb-8">
									<div className="flex flex-wrap gap-2">
										{selectedNews.tags.map((tag, index) => (
											<span
												key={index}
												className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Share Modal */}
			{showShareModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
					<div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-bold text-gray-800">{t.share}</h3>
							<button
								onClick={() => setShowShareModal(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								<X size={20} />
							</button>
						</div>

						<div className="space-y-4">
							<button
								onClick={copyToClipboard}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
							>
								{t.copyLink}
							</button>

							<div className="border-t pt-4">
								<p className="text-gray-600 mb-3">{t.shareVia}:</p>
								<div className="flex justify-center gap-4">
									{/* Social media share buttons can be added here */}
									<a
										href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
									>
										FB
									</a>
									<a
										href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(selectedNews?.title || '')}`}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500"
									>
										TW
									</a>
									<a
										href={`https://telegram.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(selectedNews?.title || '')}`}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-blue-300 text-white rounded-full hover:bg-blue-400"
									>
										TG
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default NewsPage
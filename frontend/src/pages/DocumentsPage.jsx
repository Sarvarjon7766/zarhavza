import { useEffect, useState } from 'react'
import Footer from './component/Footer'
import Navbar from './component/Navbar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const DocumentsPage = ({ pageData }) => {
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')
	const [announcements, setAnnouncements] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedImage, setSelectedImage] = useState(null)
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [currentAnnouncement, setCurrentAnnouncement] = useState(null)

	const translations = {
		uz: {
			title: "E'lonlar",
			noData: "Hozircha e'lonlar mavjud emas",
			loading: "Yuklanmoqda...",
			created: "Yaratilgan",
			updated: "Yangilangan",
			close: "Yopish",
			photos: "ta rasm",
			of: "/",
			informationService: "Axborot xizmati"
		},
		ru: {
			title: "Объявления",
			noData: "Пока нет объявлений",
			loading: "Загрузка...",
			created: "Создано",
			updated: "Обновлено",
			close: "Закрыть",
			photos: "фото",
			of: "из",
			informationService: "Информационная служба"
		},
		en: {
			title: "Announcements",
			noData: "No announcements available yet",
			loading: "Loading...",
			created: "Created",
			updated: "Updated",
			close: "Close",
			photos: "photos",
			of: "of",
			informationService: "Information Service"
		}
	}

	const breadcrumbText = {
		uz: {
			home: "Bosh sahifa",
			informationService: "Axborot xizmati",
			announcements: "E'lonlar"
		},
		ru: {
			home: "Главная",
			informationService: "Информационная служба",
			announcements: "Объявления"
		},
		en: {
			home: "Home",
			informationService: "Information Service",
			announcements: "Announcements"
		}
	}

	// Xavfsiz HTML ko'rsatish uchun funksiya
	const createMarkup = (htmlContent) => {
		if (!htmlContent) return { __html: '' }

		const cleanHtml = htmlContent
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/on\w+="[^"]*"/g, '')
			.replace(/javascript:/gi, '')
			.replace(/<iframe/gi, '&lt;iframe')
			.replace(/<object/gi, '&lt;object')
			.replace(/<embed/gi, '&lt;embed')

		return { __html: cleanHtml }
	}

	const fetchAnnouncements = async () => {
		try {
			setLoading(true)
			const response = await fetch(`${BASE_URL}/api/generalannouncement/getAll/${currentLang}/${pageData.key}`)

			if (!response.ok) {
				console.log("E'lonlarni olishda xatolik:", response.status)
				setAnnouncements([])
				return
			}

			const data = await response.json()

			if (data.success && data.announcements) {
				setAnnouncements(data.announcements)
			} else {
				setAnnouncements([])
			}
		} catch (err) {
			console.log("E'lonlarni olishda xatolik:", err.message)
			setAnnouncements([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchAnnouncements()
	}, [currentLang])

	useEffect(() => {
		const handleStorageChange = () => {
			const newLang = localStorage.getItem('lang') || 'uz'
			setCurrentLang(newLang)
		}

		window.addEventListener('storage', handleStorageChange)
		window.addEventListener('languageChanged', handleStorageChange)

		const interval = setInterval(handleStorageChange, 1000)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('languageChanged', handleStorageChange)
			clearInterval(interval)
		}
	}, [])

	const t = translations[currentLang] || translations.uz

	const getImageUrl = (photoPath) => {
		if (!photoPath) return "https://via.placeholder.com/800x500/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
		if (photoPath.startsWith('http')) return photoPath
		return `${BASE_URL}${photoPath}`
	}

	const openImageModal = (announcement, index) => {
		setCurrentAnnouncement(announcement)
		setCurrentImageIndex(index)
		setSelectedImage(getImageUrl(announcement.photos[index]))
		// Modal ochilganda body ga overflow ni o'chirish
		document.body.style.overflow = 'hidden'
	}

	const nextImage = () => {
		if (currentAnnouncement && currentAnnouncement.photos) {
			const nextIndex = (currentImageIndex + 1) % currentAnnouncement.photos.length
			setCurrentImageIndex(nextIndex)
			setSelectedImage(getImageUrl(currentAnnouncement.photos[nextIndex]))
		}
	}

	const prevImage = () => {
		if (currentAnnouncement && currentAnnouncement.photos) {
			const prevIndex = (currentImageIndex - 1 + currentAnnouncement.photos.length) % currentAnnouncement.photos.length
			setCurrentImageIndex(prevIndex)
			setSelectedImage(getImageUrl(currentAnnouncement.photos[prevIndex]))
		}
	}

	const closeModal = () => {
		setSelectedImage(null)
		setCurrentImageIndex(0)
		setCurrentAnnouncement(null)
		// Modal yopilganda body ga overflow ni qaytarish
		document.body.style.overflow = 'auto'
	}

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!selectedImage) return

			if (e.key === 'ArrowRight') nextImage()
			if (e.key === 'ArrowLeft') prevImage()
			if (e.key === 'Escape') closeModal()
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [selectedImage, currentImageIndex, currentAnnouncement])

	const renderImages = (announcement) => {
		const photos = announcement.photos
		if (!photos || photos.length === 0) return null

		if (photos.length === 1) {
			return (
				<div className="relative h-80 rounded-xl overflow-hidden cursor-pointer" onClick={() => openImageModal(announcement, 0)}>
					<img
						src={getImageUrl(photos[0])}
						alt="Announcement"
						className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
						onError={(e) => {
							e.target.src = "https://via.placeholder.com/800x500/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
						}}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
				</div>
			)
		}

		if (photos.length === 2) {
			return (
				<div className="grid grid-cols-2 gap-4">
					{photos.map((photo, index) => (
						<div key={index} className="relative h-64 rounded-xl overflow-hidden cursor-pointer" onClick={() => openImageModal(announcement, index)}>
							<img
								src={getImageUrl(photo)}
								alt={`Announcement ${index + 1}`}
								className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
								onError={(e) => {
									e.target.src = "https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
								}}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
						</div>
					))}
				</div>
			)
		}

		return (
			<div className="space-y-4">
				<div className="relative h-80 rounded-xl overflow-hidden cursor-pointer" onClick={() => openImageModal(announcement, 0)}>
					<img
						src={getImageUrl(photos[0])}
						alt="Announcement main"
						className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
						onError={(e) => {
							e.target.src = "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
						}}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					{photos.slice(1, 3).map((photo, index) => (
						<div key={index + 1} className="relative h-48 rounded-xl overflow-hidden cursor-pointer" onClick={() => openImageModal(announcement, index + 1)}>
							<img
								src={getImageUrl(photo)}
								alt={`Announcement ${index + 2}`}
								className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
								onError={(e) => {
									e.target.src = "https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
								}}
							/>
							{index === 1 && photos.length > 3 && (
								<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
									<span className="text-white text-lg font-semibold">+{photos.length - 3}</span>
								</div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
						</div>
					))}
				</div>
			</div>
		)
	}

	const renderBreadcrumb = () => {
		const homeText = breadcrumbText[currentLang]?.home || breadcrumbText.uz.home

		return (
			<nav className="flex" aria-label="Breadcrumb">
				<ol className="flex items-center space-x-2 text-sm text-gray-500">
					<li>
						<a href="/" className="hover:text-blue-600 transition-colors duration-200">
							{homeText}
						</a>
					</li>

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

					<li className="flex items-center">
						<svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
						</svg>
						<span className="text-blue-600 font-medium">
							{pageData?.title || breadcrumbText[currentLang]?.announcements || breadcrumbText.uz.announcements}
						</span>
					</li>
				</ol>
			</nav>
		)
	}

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
				<Navbar />
				<main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
					<div className="mx-auto">
						<div className="mb-6">
							{renderBreadcrumb()}
						</div>

						<div className="text-center mb-16">
							<div className="animate-pulse">
								<div className="h-10 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
								<div className="h-1 bg-gray-300 rounded w-24 mx-auto"></div>
							</div>
						</div>

						<div className="space-y-8">
							{[1, 2, 3].map((item) => (
								<div key={item} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
									<div className="h-64 bg-gray-300 rounded-xl mb-6"></div>
									<div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
									<div className="space-y-2">
										<div className="h-4 bg-gray-300 rounded"></div>
										<div className="h-4 bg-gray-300 rounded w-5/6"></div>
										<div className="h-4 bg-gray-300 rounded w-4/6"></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</main>
				<Footer />
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
			{/* Image Modal - Z-index tuzatilgan versiya */}
			{selectedImage && currentAnnouncement && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
					{/* Qorong'u fon */}
					<div
						className="absolute inset-0 bg-black/90"
						onClick={closeModal}
					/>

					{/* Modal kontenti */}
					<div className="relative z-[10000] max-w-7xl w-full max-h-[90vh]">
						{/* Close button */}
						<button
							onClick={closeModal}
							className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/70 rounded-full p-3 hover:bg-black/90"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						{/* Navigation arrows */}
						{currentAnnouncement.photos.length > 1 && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/70 rounded-full p-3 hover:bg-black/90"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<button
									onClick={nextImage}
									className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/70 rounded-full p-3 hover:bg-black/90"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</>
						)}

						{/* Main image */}
						<div className="flex flex-col items-center h-full">
							<img
								src={selectedImage}
								alt={`${currentAnnouncement.title} - ${currentImageIndex + 1}`}
								className="max-w-full max-h-[70vh] object-contain rounded-lg"
							/>

							{/* Image counter */}
							<div className="mt-4 text-white text-center">
								<span className="bg-black/70 px-4 py-2 rounded-full text-sm font-medium">
									{currentImageIndex + 1} {t.of} {currentAnnouncement.photos.length}
								</span>
							</div>

							{/* Thumbnail navigation */}
							{currentAnnouncement.photos.length > 1 && (
								<div className="mt-6 flex gap-2 overflow-x-auto max-w-full pb-2 px-4">
									{currentAnnouncement.photos.map((photo, index) => (
										<button
											key={index}
											onClick={() => {
												setCurrentImageIndex(index)
												setSelectedImage(getImageUrl(photo))
											}}
											className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-blue-500 border-4' : 'border-transparent'}`}
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
					</div>
				</div>
			)}

			<Navbar />

			<main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="mb-6">
						{renderBreadcrumb()}
					</div>

					<div className="text-center mb-16">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
							{pageData?.title || t.title}
						</h1>
						<div className="w-32 h-1 bg-gradient-to-r from-gray-800 to-gray-600 mx-auto rounded-full shadow-lg"></div>
					</div>

					<div className="space-y-8">
						{announcements.length > 0 ? (
							announcements.map((item, index) => (
								<div
									key={item._id}
									className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
									style={{
										animationDelay: `${index * 100}ms`,
										animation: 'fadeInUp 0.6s ease-out'
									}}
								>
									{item.photos && item.photos.length > 0 && (
										<div className="p-6 pb-0">
											{renderImages(item)}
										</div>
									)}

									<div className="p-6">
										<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
											{item.title || "Sarlavha yo'q"}
										</h2>

										<div className="prose prose-lg max-w-none mb-6">
											{item.description ? (
												<div
													className="text-gray-700 leading-relaxed text-lg"
													dangerouslySetInnerHTML={createMarkup(item.description)}
												/>
											) : (
												<p className="text-gray-700">Tavsif mavjud emas</p>
											)}
										</div>
									</div>
								</div>
							))
						) : (
							<div className="text-center py-12">
								<p className="text-gray-500 text-lg">{t.noData}</p>
							</div>
						)}
					</div>
				</div>
			</main>

			<Footer />

			<style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* HTML content uchun styling */
        :global(.prose p) {
          margin-bottom: 1em;
          line-height: 1.8;
        }
        
        :global(.prose strong) {
          font-weight: 700;
          color: #1f2937;
        }
        
        :global(.prose span[style*="background-color"]) {
          padding: 0.1em 0.3em;
          border-radius: 0.25em;
        }
        
        :global(.prose ul) {
          list-style-type: disc;
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        
        :global(.prose ol) {
          list-style-type: decimal;
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        
        :global(.prose li) {
          margin-bottom: 0.5em;
        }
      `}</style>
		</div>
	)
}

export default DocumentsPage
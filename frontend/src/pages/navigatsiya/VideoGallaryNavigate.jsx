import axios from 'axios'
import { useEffect, useState } from 'react'
import Footer from '../component/Footer'
import Navbar from '../component/Navbar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const VideoGallaryNavigate = () => {
	// State for current language
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')
	const [galleries, setGalleries] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedMedia, setSelectedMedia] = useState(null)
	const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
	const [currentGallery, setCurrentGallery] = useState(null)

	// Tilga mos matnlar
	const translations = {
		uz: {
			title: "Galereya",
			noData: "Hozircha galereyalar mavjud emas",
			loading: "Yuklanmoqda...",
			close: "Yopish",
			of: "/",
			photos: "ta rasm",
			videos: "ta video",
			viewGallery: "Galereyani ko'rish"
		},
		ru: {
			title: "Галерея",
			noData: "Пока нет галерей",
			loading: "Загрузка...",
			close: "Закрыть",
			of: "из",
			photos: "фото",
			videos: "видео",
			viewGallery: "Посмотреть галерею"
		},
		en: {
			title: "Gallery",
			noData: "No galleries available yet",
			loading: "Loading...",
			close: "Close",
			of: "of",
			photos: "photos",
			videos: "videos",
			viewGallery: "View Gallery"
		}
	}

	// API dan galereya ma'lumotlarini olish (axios bilan)
	const fetchGalleries = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/gallary/getAll/${currentLang}`)

			if (response.data.success && response.data.gallarys) {
				setGalleries(response.data.gallarys)
			} else {
				setGalleries([])
			}
		} catch (err) {
			console.log("Galereya ma'lumotlarini olishda xatolik:", err.message)
			setGalleries([])
		} finally {
			setLoading(false)
		}
	}

	// Listen for language changes and fetch data
	useEffect(() => {
		fetchGalleries()
	}, [currentLang])

	// Listen for language changes
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

	// Media URL ni to'g'ri shakllantirish
	const getMediaUrl = (mediaPath) => {
		if (!mediaPath) return "https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
		if (mediaPath.startsWith('http')) return mediaPath

		// Pathni to'g'ri formatlash
		const formattedPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`
		return `${BASE_URL}${formattedPath}`
	}

	// Fayl turini aniqlash (video yoki rasm)
	const getMediaType = (mediaPath) => {
		if (!mediaPath) return 'image'
		const extension = mediaPath.split('.').pop()?.toLowerCase()
		const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
		return videoExtensions.includes(extension) ? 'video' : 'image'
	}

	// Gallery modalini ochish
	const openGalleryModal = (gallery, startIndex = 0) => {
		setCurrentGallery(gallery)
		setCurrentMediaIndex(startIndex)
		setSelectedMedia({
			url: getMediaUrl(gallery.photos[startIndex]),
			type: getMediaType(gallery.photos[startIndex])
		})
	}

	// Keyingi mediaga o'tish
	const nextMedia = () => {
		if (currentGallery && currentGallery.photos) {
			const nextIndex = (currentMediaIndex + 1) % currentGallery.photos.length
			setCurrentMediaIndex(nextIndex)
			setSelectedMedia({
				url: getMediaUrl(currentGallery.photos[nextIndex]),
				type: getMediaType(currentGallery.photos[nextIndex])
			})
		}
	}

	// Oldingi mediaga o'tish
	const prevMedia = () => {
		if (currentGallery && currentGallery.photos) {
			const prevIndex = (currentMediaIndex - 1 + currentGallery.photos.length) % currentGallery.photos.length
			setCurrentMediaIndex(prevIndex)
			setSelectedMedia({
				url: getMediaUrl(currentGallery.photos[prevIndex]),
				type: getMediaType(currentGallery.photos[prevIndex])
			})
		}
	}

	// Modalni yopish
	const closeModal = () => {
		setSelectedMedia(null)
		setCurrentMediaIndex(0)
		setCurrentGallery(null)
	}

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!selectedMedia) return

			if (e.key === 'ArrowRight') nextMedia()
			if (e.key === 'ArrowLeft') prevMedia()
			if (e.key === 'Escape') closeModal()
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [selectedMedia, currentMediaIndex, currentGallery])

	// Media'lar sonini hisoblash
	const getMediaCounts = (gallery) => {
		if (!gallery.photos) return { images: 0, videos: 0 }

		const images = gallery.photos.filter(photo => getMediaType(photo) === 'image').length
		const videos = gallery.photos.filter(photo => getMediaType(photo) === 'video').length

		return { images, videos }
	}

	// Asosiy media'ni render qilish (faqat birinchi rasm)
	const renderMainMedia = (gallery) => {
		const photos = gallery.photos || []

		if (photos.length === 0) {
			return (
				<div className="relative w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
					<svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
			)
		}

		// Faqat birinchi rasmni olamiz
		const firstPhoto = photos[0]
		const mediaType = getMediaType(firstPhoto)
		const isVideo = mediaType === 'video'
		const mediaUrl = getMediaUrl(firstPhoto)

		return (
			<div
				className="relative w-full h-64 rounded-xl overflow-hidden cursor-pointer bg-gray-100"
				onClick={() => openGalleryModal(gallery, 0)}
			>
				{isVideo ? (
					<div className="w-full h-full bg-gray-800 relative">
						<video className="w-full h-full object-cover">
							<source src={mediaUrl} type="video/mp4" />
						</video>
						<div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
							<svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
								<path d="M8 5v14l11-7z" />
							</svg>
						</div>
						<div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
							VIDEO
						</div>
					</div>
				) : (
					<img
						src={mediaUrl}
						alt={gallery.title}
						className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
						onError={(e) => {
							e.target.src = "https://via.placeholder.com/400x250/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
						}}
						loading="lazy"
					/>
				)}

				{/* Qo'shimcha media'lar soni */}
				{photos.length > 1 && (
					<div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
						+{photos.length - 1}
					</div>
				)}
			</div>
		)
	}

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
				<Navbar />
				<main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						{/* Sarlavha Section */}
						<div className="text-center mb-16">
							<div className="animate-pulse">
								<div className="h-10 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
								<div className="h-1 bg-gray-300 rounded w-24 mx-auto"></div>
							</div>
						</div>

						{/* Loading skeleton */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{[1, 2, 3, 4, 5, 6].map((item) => (
								<div key={item} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
									<div className="h-48 bg-gray-300 rounded-xl mb-4"></div>
									<div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
									<div className="h-4 bg-gray-300 rounded w-1/2"></div>
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
			{/* Media Modal */}
			{selectedMedia && currentGallery && (
				<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
					<div className="relative max-w-6xl max-h-full w-full">
						{/* Close button */}
						<button
							onClick={closeModal}
							className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						{/* Navigation arrows */}
						{currentGallery.photos.length > 1 && (
							<>
								<button
									onClick={prevMedia}
									className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<button
									onClick={nextMedia}
									className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</>
						)}

						{/* Gallery title */}
						<div className="absolute top-4 left-4 z-10 text-white">
							<h3 className="text-lg font-semibold bg-black/50 px-3 py-1 rounded-lg">
								{currentGallery.title}
							</h3>
						</div>

						{/* Main media content */}
						<div className="flex flex-col items-center pt-12">
							{selectedMedia.type === 'video' ? (
								<video
									controls
									autoPlay
									className="max-w-full max-h-[70vh] rounded-lg"
									key={selectedMedia.url}
								>
									<source src={selectedMedia.url} type="video/mp4" />
									Your browser does not support the video tag.
								</video>
							) : (
								<img
									src={selectedMedia.url}
									alt={`${currentGallery.title} - ${currentMediaIndex + 1}`}
									className="max-w-full max-h-[70vh] object-contain rounded-lg"
									key={selectedMedia.url}
									onError={(e) => {
										e.target.src = "https://via.placeholder.com/800x500/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
									}}
								/>
							)}

							{/* Media counter */}
							<div className="mt-4 text-white text-center">
								<span className="bg-black/50 px-3 py-1 rounded-full text-sm">
									{currentMediaIndex + 1} {t.of} {currentGallery.photos.length}
								</span>
							</div>

							{/* Thumbnail navigation */}
							{currentGallery.photos.length > 1 && (
								<div className="mt-4 flex gap-2 overflow-x-auto max-w-full pb-2">
									{currentGallery.photos.map((photo, index) => {
										const mediaType = getMediaType(photo)
										const isVideo = mediaType === 'video'
										const thumbUrl = getMediaUrl(photo)

										return (
											<button
												key={index}
												onClick={() => {
													setCurrentMediaIndex(index)
													setSelectedMedia({
														url: thumbUrl,
														type: mediaType
													})
												}}
												className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentMediaIndex ? 'border-blue-500' : 'border-transparent'
													}`}
											>
												{isVideo ? (
													<div className="relative w-full h-full bg-gray-800">
														<svg className="w-6 h-6 text-white absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 24 24">
															<path d="M8 5v14l11-7z" />
														</svg>
														<div className="absolute bottom-0 right-0 bg-red-500 text-white text-xs px-1">
															VID
														</div>
													</div>
												) : (
													<img
														src={thumbUrl}
														alt={`Thumbnail ${index + 1}`}
														className="w-full h-full object-cover"
														onError={(e) => {
															e.target.src = "https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=Error"
														}}
													/>
												)}
											</button>
										)
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Navbar */}
			<Navbar />

			{/* Main Content */}
			<main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Sarlavha Section */}
					<div className="text-center mb-16">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
							{t.title}
						</h1>
						<div className="w-32 h-1 bg-gray-800 mx-auto rounded-full shadow-lg"></div>
					</div>

					{/* Content Section - Card Layout */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{galleries.map((gallery, index) => {
							const mediaCounts = getMediaCounts(gallery)

							return (
								<div
									key={gallery._id}
									className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200"
									style={{
										animationDelay: `${index * 100}ms`,
										animation: 'fadeInUp 0.6s ease-out'
									}}
								>
									{/* Main Media - Faqat bitta rasm */}
									<div className="p-4">
										{renderMainMedia(gallery)}
									</div>

									{/* Content */}
									<div className="p-6 pt-0">
										{/* Title */}
										<h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
											{gallery.title || "Nomi yo'q"}
										</h2>

										{/* Media counts */}
										<div className="flex justify-between items-center text-sm text-gray-500">
											<div className="flex gap-4">
												{mediaCounts.images > 0 && (
													<span className="flex items-center gap-1">
														<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														{mediaCounts.images} {t.photos}
													</span>
												)}
												{mediaCounts.videos > 0 && (
													<span className="flex items-center gap-1">
														<svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
														</svg>
														{mediaCounts.videos} {t.videos}
													</span>
												)}
											</div>

											{/* View button */}
											<button
												onClick={() => openGalleryModal(gallery, 0)}
												className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
											>
												{t.viewGallery}
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
												</svg>
											</button>
										</div>
									</div>
								</div>
							)
						})}
					</div>

					{/* No data state */}
					{galleries.length === 0 && (
						<div className="bg-white rounded-2xl shadow-xl p-12 text-center">
							<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<p className="text-xl text-gray-600">
								{t.noData}
							</p>
						</div>
					)}
				</div>
			</main>

			{/* Footer */}
			<Footer />
		</div>
	)
}

export default VideoGallaryNavigate
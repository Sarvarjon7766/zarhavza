import { useEffect, useState } from 'react'
import Footer from '../component/Footer'
import Navbar from '../component/Navbar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const AnnouncementsNavigate = () => {
	// State for current language
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')
	const [announcements, setAnnouncements] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedImage, setSelectedImage] = useState(null)
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [currentAnnouncement, setCurrentAnnouncement] = useState(null)

	// Tilga mos matnlar
	const translations = {
		uz: {
			title: "E'lonlar",
			noData: "Hozircha e'lonlar mavjud emas",
			loading: "Yuklanmoqda...",
			created: "Yaratilgan",
			updated: "Yangilangan",
			close: "Yopish",
			photos: "ta rasm",
			of: "/"
		},
		ru: {
			title: "Объявления",
			noData: "Пока нет объявлений",
			loading: "Загрузка...",
			created: "Создано",
			updated: "Обновлено",
			close: "Закрыть",
			photos: "фото",
			of: "из"
		},
		en: {
			title: "Announcements",
			noData: "No announcements available yet",
			loading: "Loading...",
			created: "Created",
			updated: "Updated",
			close: "Close",
			photos: "photos",
			of: "of"
		}
	}

	// API dan e'lonlarni olish
	const fetchAnnouncements = async () => {
		try {
			setLoading(true)
			const response = await fetch(`${BASE_URL}/api/announcement/getAll/${currentLang}`)

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

	// Listen for language changes and fetch data
	useEffect(() => {
		fetchAnnouncements()
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

	// Rasm URL ni to'g'ri shakllantirish
	const getImageUrl = (photoPath) => {
		if (!photoPath) return "https://via.placeholder.com/800x500/3B82F6/FFFFFF?text=Rasm+Yuklanmadi"
		if (photoPath.startsWith('http')) return photoPath
		return `${BASE_URL}${photoPath}`
	}

	// Rasm modalini ochish
	const openImageModal = (announcement, index) => {
		setCurrentAnnouncement(announcement)
		setCurrentImageIndex(index)
		setSelectedImage(getImageUrl(announcement.photos[index]))
	}

	// Keyingi rasmga o'tish
	const nextImage = () => {
		if (currentAnnouncement && currentAnnouncement.photos) {
			const nextIndex = (currentImageIndex + 1) % currentAnnouncement.photos.length
			setCurrentImageIndex(nextIndex)
			setSelectedImage(getImageUrl(currentAnnouncement.photos[nextIndex]))
		}
	}

	// Oldingi rasmga o'tish
	const prevImage = () => {
		if (currentAnnouncement && currentAnnouncement.photos) {
			const prevIndex = (currentImageIndex - 1 + currentAnnouncement.photos.length) % currentAnnouncement.photos.length
			setCurrentImageIndex(prevIndex)
			setSelectedImage(getImageUrl(currentAnnouncement.photos[prevIndex]))
		}
	}

	// Modalni yopish
	const closeModal = () => {
		setSelectedImage(null)
		setCurrentImageIndex(0)
		setCurrentAnnouncement(null)
	}

	// Keyboard navigation
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

	// Rasmlarni guruhlash (birinchi rasm katta, qolganlari kichik)
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

		// 3 va undan ko'p rasm uchun
		return (
			<div className="space-y-4">
				{/* Asosiy rasm */}
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

				{/* Kichik rasmlar gridi */}
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
							{/* Qo'shimcha rasmlar soni */}
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

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
				<Navbar />
				<main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
					<div className="mx-auto">
						{/* Sarlavha Section */}
						<div className="text-center mb-16">
							<div className="animate-pulse">
								<div className="h-10 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
								<div className="h-1 bg-gray-300 rounded w-24 mx-auto"></div>
							</div>
						</div>

						{/* Loading skeleton */}
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
			{/* Image Modal */}
			{selectedImage && currentAnnouncement && (
				<div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
					<div className="relative  max-h-full w-full">
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
						{currentAnnouncement.photos.length > 1 && (
							<>
								<button
									onClick={prevImage}
									className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<button
									onClick={nextImage}
									className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</>
						)}

						{/* Main image */}
						<div className="flex flex-col items-center">
							<img
								src={selectedImage}
								alt={`${currentAnnouncement.title} - ${currentImageIndex + 1}`}
								className="max-w-full max-h-[70vh] object-contain rounded-lg"
							/>

							{/* Image counter */}
							<div className="mt-4 text-white text-center">
								<span className="bg-black/50 px-3 py-1 rounded-full text-sm">
									{currentImageIndex + 1} {t.of} {currentAnnouncement.photos.length}
								</span>
							</div>

							{/* Thumbnail navigation */}
							{currentAnnouncement.photos.length > 1 && (
								<div className="mt-4 flex gap-2 overflow-x-auto max-w-full pb-2">
									{currentAnnouncement.photos.map((photo, index) => (
										<button
											key={index}
											onClick={() => {
												setCurrentImageIndex(index)
												setSelectedImage(getImageUrl(photo))
											}}
											className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
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
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 bg-gray-800 bg-clip-text text-transparent">
							{t.title}
						</h1>
						<div className="w-32 h-1 bg-gray-800 mx-auto rounded-full shadow-lg"></div>
						<div className="mt-4">

						</div>
					</div>

					{/* Content Section */}
					<div className="space-y-8">
						{announcements.map((item, index) => (
							<div
								key={item._id}
								className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
								style={{
									animationDelay: `${index * 100}ms`,
									animation: 'fadeInUp 0.6s ease-out'
								}}
							>
								{/* Photos Section */}
								{item.photos && item.photos.length > 0 && (
									<div className="p-6 pb-0">
										{renderImages(item)}
									</div>
								)}

								{/* Content Section */}
								<div className="p-6">
									{/* Title */}
									<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 leading-tight">
										{item.title || "Sarlavha yo'q"}
									</h2>

									{/* Description */}
									<div className="prose prose-lg max-w-none mb-6">
										<p className="text-gray-700 leading-relaxed text-justify text-lg">
											{item.description || "Tavsif mavjud emas"}
										</p>
									</div>

								</div>
							</div>
						))}
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer />

			{/* Custom animations */}
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
			`}</style>
		</div>
	)
}

export default AnnouncementsNavigate
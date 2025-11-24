import { useEffect, useState } from 'react'

const VideoGallery = () => {
	const [currentLang, setCurrentLang] = useState('uz')
	const [selectedVideo, setSelectedVideo] = useState(null)

	// Til ma'lumotlari
	const pageTitles = {
		uz: "Video Galereya",
		ru: "Видео Галерея",
		en: "Video Gallery"
	}

	const subtitles = {
		uz: "Suv xo'jaligi sohasidagi eng so'nggi videolar va loyihalar",
		ru: "Последние видео и проекты в сфере водного хозяйства",
		en: "Latest videos and projects in the water management sector"
	}

	// Video ma'lumotlari
	const videoData = [
		{
			id: 1,
			title: {
				uz: "Yangi Suv Ta'minoti Tizimi",
				ru: "Новая система водоснабжения",
				en: "New Water Supply System"
			},
			description: {
				uz: "Yangi avtomatlashtirilgan suv ta'minoti tizimining ishlashi",
				ru: "Работа новой автоматизированной системы водоснабжения",
				en: "Operation of the new automated water supply system"
			},
			thumbnail: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=225&fit=crop",
			videoUrl: "https://example.com/video1.mp4",
			duration: "2:45",
			views: 1245,
			date: "2024-01-15"
		},
		{
			id: 2,
			title: {
				uz: "Suvni Tozalash Jarayoni",
				ru: "Процесс очистки воды",
				en: "Water Purification Process"
			},
			description: {
				uz: "Suvni tozalashning yangi energiya tejamkor usullari",
				ru: "Новые энергосберегающие методы очистки воды",
				en: "New energy-saving water purification methods"
			},
			thumbnail: "https://images.unsplash.com/photo-1570804439979-0a85a6d951b6?w=400&h=225&fit=crop",
			videoUrl: "https://example.com/video2.mp4",
			duration: "3:20",
			views: 987,
			date: "2024-01-10"
		},
		{
			id: 3,
			title: {
				uz: "Aqlli Sug'orish Tizimi",
				ru: "Умная система орошения",
				en: "Smart Irrigation System"
			},
			description: {
				uz: "Aqlli sug'orish tizimining ishlashi va afzalliklari",
				ru: "Работа и преимущества умной системы орошения",
				en: "Operation and benefits of smart irrigation system"
			},
			thumbnail: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&h=225&fit=crop",
			videoUrl: "https://example.com/video3.mp4",
			duration: "4:15",
			views: 1567,
			date: "2024-01-08"
		},
		{
			id: 4,
			title: {
				uz: "Suv Resurslarini Boshqarish",
				ru: "Управление водными ресурсами",
				en: "Water Resources Management"
			},
			description: {
				uz: "Suv resurslarini samarali boshqarish bo'yicha seminar",
				ru: "Семинар по эффективному управлению водными ресурсами",
				en: "Seminar on effective water resources management"
			},
			thumbnail: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=225&fit=crop",
			videoUrl: "https://example.com/video4.mp4",
			duration: "5:30",
			views: 2341,
			date: "2024-01-05"
		},
		{
			id: 5,
			title: {
				uz: "Qishloq Xo'jaligida Suv Tejamkorligi",
				ru: "Экономия воды в сельском хозяйстве",
				en: "Water Saving in Agriculture"
			},
			description: {
				uz: "Qishloq xo'jaligida suvni tejashning zamonaviy usullari",
				ru: "Современные методы экономии воды в сельском хозяйстве",
				en: "Modern water saving methods in agriculture"
			},
			thumbnail: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=225&fit=crop",
			videoUrl: "https://example.com/video5.mp4",
			duration: "3:45",
			views: 1789,
			date: "2024-01-03"
		},
		{
			id: 6,
			title: {
				uz: "Suv Ta'minoti Loyihasi Ochilishi",
				ru: "Открытие проекта водоснабжения",
				en: "Water Supply Project Opening"
			},
			description: {
				uz: "Yangi suv ta'minoti loyihasining tantanali ochilishi",
				ru: "Торжественное открытие нового проекта водоснабжения",
				en: "Grand opening of the new water supply project"
			},
			thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=225&fit=crop",
			videoUrl: "https://example.com/video6.mp4",
			duration: "2:15",
			views: 3124,
			date: "2024-01-01"
		}
	]

	// LocalStorage o'zgarishlarini kuzatish
	useEffect(() => {
		const handleStorageChange = () => {
			const savedLang = localStorage.getItem('lang')
			if (savedLang && ['uz', 'ru', 'en'].includes(savedLang)) {
				setCurrentLang(savedLang)
			}
		}

		handleStorageChange()
		window.addEventListener('storage', handleStorageChange)
		const interval = setInterval(handleStorageChange, 1000)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
	}, [])

	// Video ni ochish
	const openVideo = (video) => {
		setSelectedVideo(video)
	}

	// Modalni yopish
	const closeVideo = () => {
		setSelectedVideo(null)
	}

	// Sana formatlash
	const formatDate = (dateString) => {
		const options = { year: 'numeric', month: 'long', day: 'numeric' }
		return new Date(dateString).toLocaleDateString(currentLang, options)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				{/* Sarlavha */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						{pageTitles[currentLang]}
					</h1>
					<div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full mb-4"></div>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						{subtitles[currentLang]}
					</p>
				</div>

				{/* Video grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
					{videoData.map((video) => (
						<div
							key={video.id}
							className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
							onClick={() => openVideo(video)}
						>
							{/* Thumbnail */}
							<div className="relative overflow-hidden">
								<img
									src={video.thumbnail}
									alt={video.title[currentLang]}
									className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
								/>

								{/* Play icon */}
								<div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									<div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
										<svg className="w-8 h-8 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 24 24">
											<path d="M8 5v14l11-7z" />
										</svg>
									</div>
								</div>

								{/* Duration */}
								<div className="absolute top-3 right-3 bg-black/75 text-white px-2 py-1 rounded-md text-sm font-medium">
									{video.duration}
								</div>
							</div>

							{/* Kontent */}
							<div className="p-5">
								<h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
									{video.title[currentLang]}
								</h3>
								<p className="text-gray-600 text-sm mb-3 line-clamp-2">
									{video.description[currentLang]}
								</p>

								{/* Meta ma'lumotlar */}
								<div className="flex items-center justify-between text-sm text-gray-500">
									<div className="flex items-center space-x-4">
										<span className="flex items-center">
											<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
												<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
											</svg>
											{video.views}
										</span>
										<span className="flex items-center">
											<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											{formatDate(video.date)}
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Video Modal */}
				{selectedVideo && (
					<div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
						<div className="relative w-full max-w-4xl">
							{/* Yopish tugmasi */}
							<button
								onClick={closeVideo}
								className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10"
							>
								<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>

							{/* Video player */}
							<div className="bg-black rounded-lg overflow-hidden shadow-2xl">
								<div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
									<video
										controls
										autoPlay
										className="absolute inset-0 w-full h-full"
										poster={selectedVideo.thumbnail}
									>
										<source src={selectedVideo.videoUrl} type="video/mp4" />
										Your browser does not support the video tag.
									</video>
								</div>

								{/* Video ma'lumotlari */}
								<div className="p-6 text-white">
									<h2 className="text-2xl font-bold mb-2">
										{selectedVideo.title[currentLang]}
									</h2>
									<p className="text-gray-300 mb-4">
										{selectedVideo.description[currentLang]}
									</p>
									<div className="flex items-center justify-between text-sm text-gray-400">
										<div className="flex items-center space-x-4">
											<span className="flex items-center">
												<svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
													<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
												</svg>
												{selectedVideo.views} {currentLang === 'uz' ? 'koʻrish' : currentLang === 'ru' ? 'просмотров' : 'views'}
											</span>
											<span>{formatDate(selectedVideo.date)}</span>
										</div>
										<span className="bg-blue-500 px-2 py-1 rounded text-white text-xs">
											{selectedVideo.duration}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default VideoGallery
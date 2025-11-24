import axios from "axios"
import { Play, X } from "lucide-react"
import { useEffect, useState } from "react"
import Navbar from "./Navbar"
import TopNavbar from "./TopNavbar"

const Banner = () => {
	const [language, setLanguage] = useState("uz")
	const [banner, setBanner] = useState(null)
	const [loading, setLoading] = useState(true)
	const [showVideoModal, setShowVideoModal] = useState(false)
	const BASE_URL = import.meta.env.VITE_BASE_URL

	// 🌐 Backend'dan banner ma'lumotlarini olish
	useEffect(() => {
		const fetchBanner = async () => {
			try {
				setLoading(true)
				const res = await axios.get(`${BASE_URL}/api/banner/getOne`)
				if (res.data?.banner) {
					setBanner(res.data.banner)
				}
			} catch (err) {
				console.error("Bannerni olishda xatolik:", err.message)
			} finally {
				setLoading(false)
			}
		}
		fetchBanner()
	}, [BASE_URL])

	// 🌍 LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
	}, [])

	// 🔁 Til o'zgarsa yangilash
	useEffect(() => {
		const handleStorageChange = () => {
			const savedLang = localStorage.getItem("lang") || "uz"
			setLanguage(savedLang)
		}

		window.addEventListener("storage", handleStorageChange)

		const interval = setInterval(() => {
			const savedLang = localStorage.getItem("lang") || "uz"
			if (savedLang !== language) {
				setLanguage(savedLang)
			}
		}, 1000)

		return () => {
			window.removeEventListener("storage", handleStorageChange)
			clearInterval(interval)
		}
	}, [language])

	// 🌐 Tarjima matnlari
	const translations = {
		uz: {
			title: "Zarafshon irrigatsiya tizimlari boshqarmasi",
			watchVideo: "Video rolik ko'rish",
		},
		ru: {
			title: 'Департамент ирригационных систем Зарафшана',
			watchVideo: "Смотреть видео",
		},
		en: {
			title: 'Zarafshan Irrigation Systems Department',
			watchVideo: "Watch Video",
		},
	}

	const t = translations[language] || translations.uz

	// 🖼️ Rasm URL ni to'g'ri shakllantirish
	const getImageUrl = (photo) => {
		if (!photo) return "/partner1.jpg"

		if (photo.startsWith('http')) {
			return photo
		}

		return `${BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`
	}

	// 🎬 Video URL ni to'g'ri shakllantirish
	const getVideoUrl = (video) => {
		if (!video) return null

		if (video.startsWith('http')) {
			return video
		}

		return `${BASE_URL}${video.startsWith('/') ? '' : '/'}${video}`
	}

	// 🎬 Video modalini ochish
	const handlePlayVideo = () => {
		setShowVideoModal(true)
	}

	// 🎬 Video modalini yopish
	const handleCloseVideo = () => {
		setShowVideoModal(false)
	}

	// 🔹 Agar banner topilmasa, default rasm
	const backgroundImage = banner?.photo ? getImageUrl(banner.photo) : "/partner1.jpg"
	const videoUrl = banner?.video ? getVideoUrl(banner.video) : null
	const hasVideo = Boolean(videoUrl)

	if (loading) {
		return (
			<section className="relative w-full h-screen flex flex-col overflow-hidden bg-gray-200">
				<div className="relative z-20">
					<TopNavbar />
					<Navbar />
				</div>
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Yuklanmoqda...</p>
					</div>
				</div>
			</section>
		)
	}

	return (
		<>
			<section className="relative w-full h-screen flex flex-col overflow-hidden">
				{/* 🔹 Background image */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url('${backgroundImage}')`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						backgroundRepeat: "no-repeat",
					}}
				/>

				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 via-blue-900/70 to-transparent" />

				{/* Navigatsiyalar */}
				<div className="relative z-20">
					<TopNavbar />
					<Navbar />
				</div>

				{/* Asosiy kontent */}
				<div className="relative z-10 flex-1 flex items-center justify-center">
					<div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
						<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight sm:leading-snug">
							{t.title}
						</h1>

						<div className="w-16 sm:w-20 md:w-24 h-1 bg-yellow-400 mx-auto mb-6 sm:mb-8 rounded-full" />

						{/* Video tugmasi - faqat video mavjud bo'lsa ko'rsatiladi */}
						{hasVideo && (
							<button
								onClick={handlePlayVideo}
								className="group font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-4 mx-auto text-lg text-white cursor-pointer"
							>
								<div className="bg-blue-600 text-white p-3 sm:p-4 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg">
									<Play size={28} className="sm:w-10 sm:h-10" />
								</div>
								<span className="transition-colors text-3xl duration-300">
									{t.watchVideo}
								</span>
							</button>
						)}
					</div>
				</div>

				{/* Gradient pastki qism */}
				<div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-gray-100 to-transparent" />
			</section>

			{/* Video Modal */}
			{showVideoModal && videoUrl && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
					<div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden">
						{/* Yopish tugmasi */}
						<button
							onClick={handleCloseVideo}
							className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
						>
							<X size={24} />
						</button>

						{/* Video player */}
						<div className="relative pt-[56.25%]"> {/* 16:9 aspect ratio */}
							<video
								controls
								autoPlay
								className="absolute top-0 left-0 w-full h-full"
								src={videoUrl}
							>
								Sorry, your browser doesn't support embedded videos.
							</video>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default Banner
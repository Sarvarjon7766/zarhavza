import axios from "axios"
import { useEffect, useState } from "react"
import Footer from '../component/Footer'
import Navbar from '../component/Navbar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const ActiviteNavigate = () => {
	// State for current language
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')

	// State for activity data
	const [activityData, setActivityData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// Tilga mos matnlar
	const translations = {
		uz: {
			title: "Faoliyat",
			loadingText: "Ma'lumotlar hali yuklanmadi",
			noDataTitle: "Ma'lumot topilmadi",
			noDataDescription: "Hozircha hech qanday faoliyat ma'lumotlari mavjud emas.",
			errorTitle: "Xatolik yuz berdi",
			updated: "Yangilangan",
			created: "Yaratilgan"
		},
		ru: {
			title: "Деятельность",
			loadingText: "Данные еще не загружены",
			noDataTitle: "Данные не найдены",
			noDataDescription: "На данный момент нет информации о деятельности.",
			errorTitle: "Произошла ошибка",
			updated: "Обновлено",
			created: "Создано"
		},
		en: {
			title: "Activities",
			loadingText: "Data not loaded yet",
			noDataTitle: "No data found",
			noDataDescription: "No activity information available at the moment.",
			errorTitle: "An error occurred",
			updated: "Updated",
			created: "Created"
		}
	}

	// Fetch data from API using axios
	useEffect(() => {
		const fetchActivityData = async () => {
			try {
				setLoading(true)
				setError(null)

				const response = await axios.get(`${BASE_URL}/api/activity/getAll/${currentLang}`)

				if (response.data.success && response.data.activitys) {
					setActivityData(response.data.activitys)
				} else {
					throw new Error(response.data.message || 'Failed to fetch data')
				}
			} catch (err) {
				console.error('Error fetching activity data:', err)
				setError(err.response?.data?.message || err.message || 'Failed to load data')
			} finally {
				setLoading(false)
			}
		}

		fetchActivityData()
	}, [currentLang])

	// Listen for language changes
	useEffect(() => {
		const handleStorageChange = () => {
			const newLang = localStorage.getItem('lang') || 'uz'
			setCurrentLang(newLang)
		}

		// Listen for storage changes from other tabs/windows
		window.addEventListener('storage', handleStorageChange)

		// Listen for custom event from within the same app
		window.addEventListener('languageChanged', handleStorageChange)

		// Check for language changes every second (fallback)
		const interval = setInterval(handleStorageChange, 1000)

		// Cleanup
		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('languageChanged', handleStorageChange)
			clearInterval(interval)
		}
	}, [])

	const t = translations[currentLang] || translations.uz

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						{/* Sarlavha Section */}
						<div className="text-center mb-16">
							<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
								{t.title}
							</h1>
							<div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
						</div>

						{/* Loading skeleton */}
						<div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
							<div className="animate-pulse space-y-6">
								<div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
								<div className="space-y-3">
									<div className="h-4 bg-gray-300 rounded"></div>
									<div className="h-4 bg-gray-300 rounded"></div>
									<div className="h-4 bg-gray-300 rounded w-5/6"></div>
								</div>
								<div className="space-y-3 mt-6">
									<div className="h-4 bg-gray-300 rounded"></div>
									<div className="h-4 bg-gray-300 rounded w-4/6"></div>
								</div>
							</div>
						</div>
					</div>
				</main>
				<Footer />
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						{/* Sarlavha Section */}
						<div className="text-center mb-16">
							<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
								{t.title}
							</h1>
							<div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
						</div>

					</div>
				</main>
				<Footer />
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col">
			{/* Navbar */}
			<Navbar />

			{/* Main Content */}
			<main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Sarlavha Section */}
					<div className="text-center mb-16">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
							{t.title}
						</h1>
						<div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
					</div>

					{/* Content Section - API dan kelgan ma'lumotlar */}
					<div className="space-y-8">
						{activityData.map((activity) => {
							const formatDate = (dateString) => {
								if (!dateString) return ''
								const date = new Date(dateString)
								return date.toLocaleDateString(currentLang, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})
							}

							return (
								<div
									key={activity._id}
									className="bg-white rounded-2xl shadow-xl p-8 md:p-12 transition-all duration-300 hover:shadow-2xl"
								>
									{/* Title */}
									<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
										{activity.title}
									</h2>

									{/* Description */}
									<div className="prose prose-lg max-w-none">
										{activity.description.split('\n').map((paragraph, paragraphIndex) => (
											paragraph.trim() && (
												<p
													key={paragraphIndex}
													className="text-gray-700 leading-relaxed mb-4 text-justify text-lg"
												>
													{paragraph.trim()}
												</p>
											)
										))}
									</div>
								</div>
							)
						})}
					</div>

					{/* Agar ma'lumot bo'lmasa */}
					{activityData.length === 0 && (
						<div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-600 mb-2">
								{t.noDataTitle}
							</h3>
							<p className="text-gray-500">
								{t.noDataDescription}
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

export default ActiviteNavigate
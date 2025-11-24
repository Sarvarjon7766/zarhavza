import axios from "axios"
import { useEffect, useState } from "react"
import Footer from '../component/Footer'
import Navbar from '../component/Navbar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const OpeningDataNavigatsiya = () => {
	// State for current language
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')

	// State for open data
	const [openData, setOpenData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// Tilga mos sarlavhalar
	const sarlavha = {
		uz: "Ochiq Ma'lumotlar",
		ru: "Открытые Данные",
		en: "Open Data"
	}

	// Fetch data from API using axios
	useEffect(() => {
		const fetchOpenData = async () => {
			try {
				setLoading(true)
				setError(null)

				const response = await axios.get(`${BASE_URL}/api/opendata/getAll/${currentLang}`)

				if (response.data.success && response.data.opendatas) {
					setOpenData(response.data.opendatas)
				} else {
					throw new Error(response.data.message || 'Failed to fetch data')
				}
			} catch (err) {
				console.error('Error fetching open data:', err)
				setError(err.response?.data?.message || err.message || 'Failed to load data')
			} finally {
				setLoading(false)
			}
		}

		fetchOpenData()
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

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
				{/* 🔹 Navbar */}
				<header className="sticky top-0 z-50 bg-white shadow-md">
					<Navbar />
				</header>

				{/* 🔹 Kontent */}
				<main className="flex-1 px-5 md:px-16 py-10">
					<div className="max-w-6xl mx-auto text-center space-y-8">
						{/* Sarlavha */}
						<h1 className="text-3xl md:text-4xl font-bold text-gray-800">
							{sarlavha[currentLang] || sarlavha.uz}
						</h1>

						{/* Loading skeleton */}
						<div className="animate-pulse space-y-6">
							<div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
							<div className="space-y-3">
								<div className="h-4 bg-gray-300 rounded"></div>
								<div className="h-4 bg-gray-300 rounded"></div>
								<div className="h-4 bg-gray-300 rounded w-5/6 mx-auto"></div>
							</div>
							<div className="space-y-3 mt-6">
								<div className="h-4 bg-gray-300 rounded"></div>
								<div className="h-4 bg-gray-300 rounded w-4/6 mx-auto"></div>
							</div>
						</div>
					</div>
				</main>

				{/* 🔹 Footer */}
				<Footer />
			</div>
		)
	}

	// Error state
	if (error) {
		return (
			<div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
				{/* 🔹 Navbar */}
				<header className="sticky top-0 z-50 bg-white shadow-md">
					<Navbar />
				</header>

				{/* 🔹 Kontent */}
				<main className="flex-1 px-5 md:px-16 py-10">
					<div className="max-w-6xl mx-auto text-center space-y-8">
						{/* Sarlavha */}
						<h1 className="text-3xl md:text-4xl font-bold text-gray-800">
							{sarlavha[currentLang] || sarlavha.uz}
						</h1>

					</div>
				</main>

				{/* 🔹 Footer */}
				<Footer />
			</div>
		)
	}

	return (
		<div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
			{/* 🔹 Navbar */}
			<header className="sticky top-0 z-50 bg-white shadow-md">
				<Navbar />
			</header>

			{/* 🔹 Kontent */}
			<main className="flex-1 px-5 md:px-16 py-10">
				<div className="max-w-6xl mx-auto space-y-8">
					{/* Sarlavha */}
					<div className="text-center">
						<h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
							{sarlavha[currentLang] || sarlavha.uz}
						</h1>
						<div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
					</div>

					{/* Content Section - API dan kelgan ma'lumotlar */}
					<div className="space-y-6">
						{openData.map((data) => (
							<div
								key={data._id}
								className="bg-white rounded-xl shadow-lg p-6 md:p-8 transition-all duration-300 hover:shadow-xl border border-gray-100"
							>
								{/* Title */}
								<h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
									{data.title}
								</h2>

								{/* Description */}
								<div className="prose prose-lg max-w-none">
									{data.description.split('\n').map((paragraph, paragraphIndex) => (
										paragraph.trim() && (
											<p
												key={paragraphIndex}
												className="text-gray-700 leading-relaxed mb-4 text-justify"
											>
												{paragraph.trim()}
											</p>
										)
									))}
								</div>

							</div>
						))}
					</div>

					{/* Agar ma'lumot bo'lmasa */}
					{openData.length === 0 && (
						<div className="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-600 mb-2">
								Ma'lumot topilmadi
							</h3>
							<p className="text-gray-500">
								Hozircha hech qanday ochiq ma'lumot mavjud emas.
							</p>
						</div>
					)}
				</div>
			</main>

			{/* 🔹 Footer */}
			<Footer />
		</div>
	)
}

export default OpeningDataNavigatsiya
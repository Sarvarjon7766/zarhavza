import axios from "axios"
import { useEffect, useState } from "react"
import Footer from './component/Footer'
import Navbar from './component/Navbar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const StaticPage = ({ pageData }) => {
	// State for current language
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')

	// State for about data
	const [aboutData, setAboutData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	// Tilga mos sarlavhalar
	const sarlavha = {
		uz: "Biz haqimizda",
		ru: "О нас",
		en: "About Us"
	}
	// Breadcrumb navigation text
	const breadcrumbText = {
		uz: {
			home: "Bosh sahifa",
			about: "Biz haqimizda"
		},
		ru: {
			home: "Главная",
			about: "О нас"
		},
		en: {
			home: "Home",
			about: "About Us"
		}
	}

	// Fetch data from API using axios
	useEffect(() => {
		const fetchAboutData = async () => {
			try {
				setLoading(true)
				setError(null)

				const response = await axios.get(`${BASE_URL}/api/generalabout/getAll/${currentLang}/${pageData.key}`)
				console.log(response)

				if (response.data.success && response.data.abouts) {
					setAboutData(response.data.abouts)
				} else {
					throw new Error(response.data.message || 'Failed to fetch data')
				}
			} catch (err) {
				console.error('Error fetching about data:', err)
				setError(err.response?.data?.message || err.message || 'Failed to load data')
			} finally {
				setLoading(false)
			}
		}

		fetchAboutData()
	}, [currentLang, pageData.key])

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

	// Breadcrumb navigation render qilish
	const renderBreadcrumb = () => {
		const homeText = breadcrumbText[currentLang]?.home || breadcrumbText.uz.home

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
							{pageData?.title || breadcrumbText[currentLang]?.about || breadcrumbText.uz.about}
						</span>
					</li>
				</ol>
			</nav>
		)
	}

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						{/* Breadcrumb Navigation */}
						<div className="mb-6">
							{renderBreadcrumb()}
						</div>

						{/* Sarlavha Section */}
						<div className="text-center mb-16">
							<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
								{pageData?.title || sarlavha[currentLang] || sarlavha.uz}
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
						{/* Breadcrumb Navigation */}
						<div className="mb-6">
							{renderBreadcrumb()}
						</div>

						{/* Sarlavha Section */}
						<div className="text-center mb-16">
							<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
								{pageData?.title || sarlavha[currentLang] || sarlavha.uz}
							</h1>
							<div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
						</div>

						{/* Error message */}
						<div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
							<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-800 mb-2">
								Xatolik yuz berdi
							</h3>
							<p className="text-gray-600 mb-4">
								{error}
							</p>
							<button
								onClick={() => window.location.reload()}
								className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
							>
								Qayta yuklash
							</button>
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
					{/* Breadcrumb Navigation */}
					<div className="mb-6">
						{renderBreadcrumb()}
					</div>

					{/* Sarlavha Section - tilga mos */}
					<div className="text-center mb-16">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
							{pageData?.title || sarlavha[currentLang] || sarlavha.uz}
						</h1>
						<div className="w-24 h-1 bg-blue-500 mx-auto rounded-full"></div>
					</div>

					{/* Content Section - API dan kelgan ma'lumotlar */}
					<div className="space-y-8">
						{aboutData.map((about) => (
							<div
								key={about._id}
								className="bg-white rounded-2xl shadow-xl p-8 md:p-12 transition-all duration-300 hover:shadow-2xl"
							>
								{/* Title */}
								<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
									{about.title}
								</h2>

								{/* Description */}
								<div className="prose prose-lg max-w-none">
									{about.description.split('\n').map((paragraph, paragraphIndex) => (
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
						))}
					</div>

					{/* Agar ma'lumot bo'lmasa */}
					{aboutData.length === 0 && (
						<div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-600 mb-2">
								{currentLang === 'uz' ? "Ma'lumot topilmadi" :
									currentLang === 'ru' ? "Информация не найдена" :
										"No information found"}
							</h3>
							<p className="text-gray-500">
								{currentLang === 'uz' ? "Hozircha hech qanday ma'lumot mavjud emas." :
									currentLang === 'ru' ? "Пока нет никакой информации." :
										"No information is available yet."}
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

export default StaticPage
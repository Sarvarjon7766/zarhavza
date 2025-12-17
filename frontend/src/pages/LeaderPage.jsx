import axios from 'axios'
import { useEffect, useState } from 'react'
import Footer from './component/Footer'
import Navbar from './component/Navbar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const LeaderPage = ({ pageData }) => {
	// State for current language
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')
	const [leaders, setLeaders] = useState([])
	const [loading, setLoading] = useState(true)
	const [selectedLeader, setSelectedLeader] = useState(null)
	const [modalContent, setModalContent] = useState('') // 'task' yoki 'biography'
	const [modalTitle, setModalTitle] = useState('')
	const [modalText, setModalText] = useState('')

	// Tilga mos matnlar
	const translations = {
		uz: {
			title: "Rahbariyat",
			noData: "Hozircha rahbarlar haqida ma'lumot mavjud emas",
			loading: "Yuklanmoqda...",
			position: "Lavozim",
			phone: "Telefon",
			email: "Elektron pochta",
			address: "Manzil",
			workingHours: "Ish vaqti",
			tasks: "Vazifalar",
			biography: "Biografiya",
			contactInfo: "Aloqa ma'lumotlari",
			viewDetails: "Batafsil ko'rish",
			close: "Yopish",
			receptionHours: "Qabul kunlari",
			viewTasks: "Vazifalarni ko'rish",
			viewBiography: "Biografiyani ko'rish"
		},
		ru: {
			title: "Руководство",
			noData: "Информация о руководителях пока недоступна",
			loading: "Загрузка...",
			position: "Должность",
			phone: "Телефон",
			email: "Электронная почта",
			address: "Адрес",
			workingHours: "Время работы",
			tasks: "Задачи",
			biography: "Биография",
			contactInfo: "Контактная информация",
			viewDetails: "Подробнее",
			close: "Закрыть",
			receptionHours: "Приемные дни",
			viewTasks: "Посмотреть задачи",
			viewBiography: "Посмотреть биографию"
		},
		en: {
			title: "Leadership",
			noData: "No leader information available yet",
			loading: "Loading...",
			position: "Position",
			phone: "Phone",
			email: "Email",
			address: "Address",
			workingHours: "Working Hours",
			tasks: "Tasks",
			biography: "Biography",
			contactInfo: "Contact Information",
			viewDetails: "View Details",
			close: "Close",
			receptionHours: "Reception Hours",
			viewTasks: "View Tasks",
			viewBiography: "View Biography"
		}
	}

	// Breadcrumb navigation text
	const breadcrumbText = {
		uz: {
			home: "Bosh sahifa",
			leadership: "Rahbariyat"
		},
		ru: {
			home: "Главная",
			leadership: "Руководство"
		},
		en: {
			home: "Home",
			leadership: "Leadership"
		}
	}

	// API dan rahbarlar ma'lumotlarini olish
	const fetchLeaders = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/generalleader/getAll/${currentLang}/${pageData.key}`)

			if (response.data.success && response.data.leaders) {
				console.log(response.data.leaders)
				setLeaders(response.data.leaders)
			} else {
				setLeaders([])
			}
		} catch (err) {
			console.log("Rahbarlar ma'lumotlarini olishda xatolik:", err.message)
			setLeaders([])
		} finally {
			setLoading(false)
		}
	}

	// Listen for language changes and fetch data
	useEffect(() => {
		fetchLeaders()
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
	const getImageUrl = (imagePath) => {
		if (!imagePath) return "https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Rasm"
		if (imagePath.startsWith('http')) return imagePath

		// Pathni to'g'ri formatlash
		const formattedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
		return `${BASE_URL}${formattedPath}`
	}

	// Modalni ochish - vazifalar uchun
	const openTaskModal = (leader) => {
		setSelectedLeader(leader)
		setModalContent('task')
		setModalTitle(t.tasks)
		setModalText(leader.task || t.noData)
		// Modal ochilganda body'ga overflow hidden qo'shish
		document.body.style.overflow = 'hidden'
	}

	// Modalni ochish - biografiya uchun
	const openBiographyModal = (leader) => {
		setSelectedLeader(leader)
		setModalContent('biography')
		setModalTitle(t.biography)
		setModalText(leader.biography || t.noData)
		// Modal ochilganda body'ga overflow hidden qo'shish
		document.body.style.overflow = 'hidden'
	}

	// Modalni yopish
	const closeModal = () => {
		setSelectedLeader(null)
		setModalContent('')
		setModalTitle('')
		setModalText('')
		// Modal yopilganda body'dan overflow hidden ni olib tashlash
		document.body.style.overflow = 'auto'
	}

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!selectedLeader) return
			if (e.key === 'Escape') closeModal()
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [selectedLeader])

	// Component unmount bo'lganda cleanup
	useEffect(() => {
		return () => {
			// Component unmount bo'lganda body'dan overflow hidden ni olib tashlash
			document.body.style.overflow = 'auto'
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
							{pageData?.title || breadcrumbText[currentLang]?.leadership || breadcrumbText.uz.leadership}
						</span>
					</li>
				</ol>
			</nav>
		)
	}

	// Loading state
	if (loading) {
		return (
			<div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
				<Navbar />
				<main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-7xl mx-auto">
						{/* Breadcrumb Navigation */}
						<div className="mb-6">
							{renderBreadcrumb()}
						</div>

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
								<div key={item} className="bg-white rounded-xl shadow p-6 animate-pulse">
									<div className="flex items-center gap-6">
										<div className="w-32 h-32 bg-gray-300 rounded-full"></div>
										<div className="flex-grow space-y-4">
											<div className="h-6 bg-gray-300 rounded w-48"></div>
											<div className="h-4 bg-gray-300 rounded w-32"></div>
											<div className="h-4 bg-gray-300 rounded w-full"></div>
										</div>
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
			{/* Task/Biography Modal - To'liq tuzilgan */}
			{selectedLeader && modalContent && (
				<div className="fixed inset-0 z-55 flex items-center justify-center p-4">
					{/* Orqa fon */}
					<div
						className="absolute inset-0 bg-black/70 transition-opacity duration-300"
						onClick={closeModal}
					/>

					{/* Modal oynasi - flex container */}
					<div className="relative bg-white rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl transform transition-all duration-300 scale-100">
						{/* Modal header - fixed height */}
						<div className="p-4 border-b bg-gray-50 flex-shrink-0">
							<div className="flex justify-between items-center">
								<h2 className="text-xl font-semibold text-gray-800">{modalTitle}</h2>
								<button
									onClick={closeModal}
									className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
									aria-label={t.close}
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						</div>

						{/* Modal content - scrollable area */}
						<div className="flex-1 overflow-y-auto">
							<div className="p-6">
								{modalText ? (
									<div className="text-gray-700 whitespace-pre-line">
										{modalText}
									</div>
								) : (
									<div className="py-8 text-center">
										<svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<p className="text-gray-500 italic">
											{t.noData}
										</p>
									</div>
								)}
							</div>
						</div>

					</div>
				</div>
			)}

			{/* Navbar */}
			<Navbar />

			{/* Main Content */}
			<main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Breadcrumb Navigation */}
					<div className="mb-6">
						{renderBreadcrumb()}
					</div>

					{/* Sarlavha Section */}
					<div className="text-center mb-16">
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
							{pageData?.title || t.title}
						</h1>
						<div className="w-32 h-1 bg-gray-800 mx-auto rounded-full shadow-lg"></div>
					</div>

					{/* Leaders List - widthga yoyilgan holda */}
					<div className="space-y-4">
						{leaders.map((leader, index) => (
							<div
								key={leader._id}
								className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
								style={{
									animationDelay: `${index * 100}ms`,
									animation: 'fadeInUp 0.6s ease-out'
								}}
							>
								<div className="p-6 md:p-8">
									<div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
										{/* Left side - Rasm */}
										<div className="flex-shrink-0">
											<img
												src={getImageUrl(leader.photo)}
												alt={leader.fullName}
												className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
												onError={(e) => {
													e.target.src = "https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Rasm"
												}}
											/>
										</div>

										<div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6">
											<div className="space-y-2">
												<h3 className="text-2xl font-bold text-gray-800">
													{leader.fullName}
												</h3>
												<div className="h-1 w-16 bg-blue-600"></div>
												<p className="text-lg font-semibold text-blue-700">
													{leader.position}
												</p>
												<div className="flex gap-3 mt-4">
													{leader.task && (
														<button
															onClick={() => openTaskModal(leader)}
															className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
														>
															{t.tasks}
														</button>
													)}

													{leader.biography && (
														<button
															onClick={() => openBiographyModal(leader)}
															className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
														>
															{t.biography}
														</button>
													)}
												</div>
											</div>

											{/* Contact information in grid */}
											<div className="space-y-3">
												{leader.phone && (
													<div className="flex items-center gap-3">
														<svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
														</svg>
														<div>
															<p className="text-sm text-gray-500">{t.phone}</p>
															<a href={`tel:${leader.phone}`} className="text-gray-800 hover:text-blue-600 transition-colors font-medium">
																{leader.phone}
															</a>
														</div>
													</div>
												)}

												{leader.email && (
													<div className="flex items-center gap-3">
														<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
														</svg>
														<div>
															<p className="text-sm text-gray-500">{t.email}</p>
															<a href={`mailto:${leader.email}`} className="text-gray-800 hover:text-green-600 transition-colors font-medium truncate">
																{leader.email}
															</a>
														</div>
													</div>
												)}

												{leader.address && (
													<div className="flex items-start gap-3">
														<svg className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
														</svg>
														<div>
															<p className="text-sm text-gray-500">{t.address}</p>
															<p className="text-gray-800 font-medium">{leader.address}</p>
														</div>
													</div>
												)}

												{leader.workin && (
													<div className="flex items-center gap-3">
														<svg className="w-5 h-5 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
														<div>
															<p className="text-sm text-gray-500">{t.receptionHours}</p>
															<p className="text-gray-800 font-medium">{leader.workin}</p>
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* No data state */}
					{leaders.length === 0 && (
						<div className="bg-white rounded-2xl shadow-xl p-12 text-center">
							<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

export default LeaderPage
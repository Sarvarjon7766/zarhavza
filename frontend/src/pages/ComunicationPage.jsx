import axios from 'axios'
import { AlertCircle, CheckCircle, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import Footer from './component/Footer'
import Navbar from './component/Navbar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const CommunicationPage = ({ pageData }) => {
	const [language, setLanguage] = useState(localStorage.getItem('lang') || 'uz')
	const [loading, setLoading] = useState(false)
	const [communicationData, setCommunicationData] = useState(null)
	const [contentLoading, setContentLoading] = useState(true)

	// Form state
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		message: '',
	})

	const [submitStatus, setSubmitStatus] = useState(null)

	// Tilga mos matnlar
	const translations = {
		uz: {
			title: "Murojaat yuborish",
			loading: "Ma'lumotlar yuklanmoqda...",
			fullName: "To'liq ism familiya",
			fullNamePlaceholder: "Ism familiyangizni kiriting",
			email: "Email",
			emailPlaceholder: "email@example.com",
			phone: "Telefon raqam",
			phonePlaceholder: "+998 90 123 45 67",
			message: "Murojaat matni",
			messagePlaceholder: "Murojaatingizni bu yerga yozing",
			submit: "Murojaatni yuborish",
			sending: "Yuborilmoqda...",
			successMessage: "Murojaatingiz muvaffaqiyatli yuborildi!",
			errorMessage: "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
			requiredField: "Ushbu maydon to'ldirilishi shart",
			invalidEmail: "Noto'g'ri email formati",
			invalidPhone: "Noto'g'ri telefon formati",
		},
		ru: {
			title: "Отправить обращение",
			loading: "Данные загружаются...",
			fullName: "Полное имя фамилия",
			fullNamePlaceholder: "Введите ваше имя и фамилию",
			email: "Email",
			emailPlaceholder: "email@example.com",
			phone: "Номер телефона",
			phonePlaceholder: "+998 90 123 45 67",
			message: "Текст обращения",
			messagePlaceholder: "Напишите ваше обращение здесь",
			submit: "Отправить обращение",
			sending: "Отправляется...",
			successMessage: "Ваше обращение успешно отправлено!",
			errorMessage: "Произошла ошибка. Пожалуйста, попробуйте еще раз.",
			requiredField: "Это поле обязательно для заполнения",
			invalidEmail: "Неверный формат email",
			invalidPhone: "Неверный формат телефона",
		},
		en: {
			title: "Send Application",
			loading: "Loading data...",
			fullName: "Full name",
			fullNamePlaceholder: "Enter your full name",
			email: "Email",
			emailPlaceholder: "email@example.com",
			phone: "Phone number",
			phonePlaceholder: "+998 90 123 45 67",
			message: "Message",
			messagePlaceholder: "Write your application here",
			submit: "Send Application",
			sending: "Sending...",
			successMessage: "Your application has been sent successfully!",
			errorMessage: "An error occurred. Please try again.",
			requiredField: "This field is required",
			invalidEmail: "Invalid email format",
			invalidPhone: "Invalid phone format",
		},
	}

	// Breadcrumb navigation text
	const breadcrumbText = {
		uz: {
			home: 'Bosh sahifa',
			communication: 'Murojaat yuborish',
		},
		ru: {
			home: 'Главная',
			communication: 'Отправить обращение',
		},
		en: {
			home: 'Home',
			communication: 'Send Application',
		},
	}

	// Fetch communication data
	const fetchCommunicationData = async () => {
		try {
			setContentLoading(true)
			const key = pageData?.key || 'communication'

			const response = await axios.get(
				`${BASE_URL}/api/generalcommunication/getAll/${language}/${key}`
			)

			if (
				response.data.success &&
				response.data.communications &&
				response.data.communications.length > 0
			) {
				setCommunicationData(response.data.communications[0])
			} else {
				console.log("Communication ma'lumotlari topilmadi")
				setCommunicationData(null)
			}
		} catch (error) {
			console.error('Communication ma\'lumotlarini yuklashda xatolik:', error)
			setCommunicationData(null)
		} finally {
			setContentLoading(false)
		}
	}

	// Listen for language changes
	useEffect(() => {
		const handleStorageChange = () => {
			const newLang = localStorage.getItem('lang') || 'uz'
			setLanguage(newLang)
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

	// Til o'zgarganida yoki birinchi renderda ma'lumotlarni yuklash
	useEffect(() => {
		fetchCommunicationData()
	}, [language, pageData?.key])

	const t = translations[language] || translations.uz

	// Form input changes
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})

		if (submitStatus?.type === 'success') {
			setSubmitStatus(null)
		}
	}

	// Form validation
	const validateForm = () => {
		const errors = {}

		if (!formData.name.trim()) {
			errors.name = t.requiredField
		}

		if (!formData.email.trim()) {
			errors.email = t.requiredField
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = t.invalidEmail
		}

		if (!formData.phone.trim()) {
			errors.phone = t.requiredField
		} else if (!/^\+?[0-9\s\-\(\)]{7,15}$/.test(formData.phone)) {
			errors.phone = t.invalidPhone
		}

		if (!formData.message.trim()) {
			errors.message = t.requiredField
		}

		return errors
	}

	// Form submit
	const handleSubmit = async (e) => {
		e.preventDefault()

		const errors = validateForm()
		if (Object.keys(errors).length > 0) {
			setSubmitStatus({
				type: 'error',
				message: Object.values(errors)[0],
			})
			return
		}

		setLoading(true)
		setSubmitStatus(null)

		try {
			const response = await axios.post(
				`${BASE_URL}/api/application/create`,
				formData
			)

			if (response.data.success) {
				setSubmitStatus({
					type: 'success',
					message: response.data.message || t.successMessage,
				})
				setFormData({
					name: '',
					email: '',
					phone: '',
					message: '',
				})
			} else {
				setSubmitStatus({
					type: 'error',
					message: response.data.message || t.errorMessage,
				})
			}
		} catch (error) {
			console.error('Form yuborishda xatolik:', error)
			setSubmitStatus({
				type: 'error',
				message: error.response?.data?.message || t.errorMessage,
			})
		} finally {
			setLoading(false)
		}
	}

	// Breadcrumb navigation render qilish
	const renderBreadcrumb = () => {
		const t = breadcrumbText[language] || breadcrumbText.uz
		const homeText = t.home

		return (
			<nav className="flex" aria-label="Breadcrumb">
				<ol className="flex items-center space-x-2 text-sm text-gray-500">
					{/* Bosh sahifa */}
					<li>
						<a
							href="/"
							className="hover:text-blue-600 transition-colors duration-200"
						>
							{homeText}
						</a>
					</li>

					{/* ParentTitle bo'lsa */}
					{pageData?.parentTitle && (
						<>
							<li className="flex items-center">
								<svg
									className="w-4 h-4 mx-1"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
										clipRule="evenodd"
									/>
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
							<path
								fillRule="evenodd"
								d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
								clipRule="evenodd"
							/>
						</svg>
						<span className="text-blue-600 font-medium">{pageData.title}</span>
					</li>
				</ol>
			</nav>
		)
	}

	return (
		<div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
			{/* Navbar */}
			<Navbar />

			{/* Asosiy kontent */}
			<main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
				{/* Breadcrumb Navigation */}
				<div className="mb-6">{renderBreadcrumb()}</div>

				{/* Sarlavha */}
				<div className="text-center mb-12">
					{contentLoading ? (
						<div className="animate-pulse">
							<div className="h-10 bg-gray-300 rounded-lg mb-4 mx-auto max-w-md"></div>
							<div className="w-24 h-1 bg-gray-300 mx-auto rounded-full"></div>
						</div>
					) : (
						<>
							<h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
								{communicationData?.sarlavha || t.title}
							</h1>
							<div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
						</>
					)}
				</div>

				{/* Forma qismi */}
				<div className="max-w-5xl mx-auto">
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
						{/* Form header */}
						<div className="p-6 text-black text-center">
							{contentLoading ? (
								<div className="animate-pulse">
									<div className="h-8 bg-gray-300 rounded-lg mb-2 mx-auto max-w-xs"></div>
									<div className="h-4 bg-gray-200 rounded-lg mx-auto max-w-sm"></div>
								</div>
							) : (
								<>
									<h2 className="text-2xl font-bold mb-2">
										{communicationData?.formTitle || t.title}
									</h2>
									{communicationData?.formDescription && (
										<p className="text-gray-600">
											{communicationData.formDescription}
										</p>
									)}
								</>
							)}
						</div>

						{/* Status xabari */}
						{submitStatus && (
							<div
								className={`mx-6 mt-6 p-4 rounded-lg ${submitStatus.type === 'success'
									? 'bg-green-50 border border-green-200 text-green-700'
									: 'bg-red-50 border border-red-200 text-red-700'
									}`}
							>
								<div className="flex items-center gap-3">
									<div
										className={
											submitStatus.type === 'success'
												? 'text-green-500'
												: 'text-red-500'
										}
									>
										{submitStatus.type === 'success' ? (
											<CheckCircle size={24} />
										) : (
											<AlertCircle size={24} />
										)}
									</div>
									<p className="font-medium">{submitStatus.message}</p>
								</div>
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit} className="p-6 space-y-6">
							{/* Ism familiya */}
							<div className="space-y-2">
								<label className="block text-gray-700 font-medium">
									{t.fullName} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
									placeholder={t.fullNamePlaceholder}
									disabled={loading}
								/>
							</div>

							{/* Email va Telefon - bir qatorda */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<label className="block text-gray-700 font-medium">
										{t.email} <span className="text-red-500">*</span>
									</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
										placeholder={t.emailPlaceholder}
										disabled={loading}
									/>
								</div>

								<div className="space-y-2">
									<label className="block text-gray-700 font-medium">
										{t.phone} <span className="text-red-500">*</span>
									</label>
									<input
										type="tel"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
										placeholder={t.phonePlaceholder}
										disabled={loading}
									/>
								</div>
							</div>

							{/* Murojaat matni */}
							<div className="space-y-2">
								<label className="block text-gray-700 font-medium">
									{t.message} <span className="text-red-500">*</span>
								</label>
								<textarea
									name="message"
									value={formData.message}
									onChange={handleChange}
									rows="6"
									className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
									placeholder={t.messagePlaceholder}
									disabled={loading}
								></textarea>
							</div>

							{/* Yuborish tugmasi */}
							<div className="pt-4">
								<button
									type="submit"
									disabled={loading}
									className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${loading
										? 'bg-gray-400 cursor-not-allowed text-white'
										: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
										}`}
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
											{t.sending}
										</>
									) : (
										<>
											<Send size={20} />
											{t.submit}
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer />
		</div>
	)
}

export default CommunicationPage
import axios from 'axios'
import { useEffect, useState } from 'react'
import Footer from '../component/Footer'
import Navbar from '../component/Navbar'

const Contacts = () => {
	// State for current language
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: ""
	})

	const [loading, setLoading] = useState(false)
	const [submitStatus, setSubmitStatus] = useState(null)
	const BASE_URL = import.meta.env.VITE_BASE_URL

	// Tilga mos matnlar
	const translations = {
		uz: {
			title: "Bog'lanish",
			subtitle: "Biz bilan bog'laning",
			phone: "Telefon",
			fax: "Faks",
			email: "Elektron pochta",
			address: "Manzil",
			contactText: "Savollarni berish yoki fikrlaringizni biz bilan baham ko'rish uchun bemalol murojaat qiling.",
			formTitle: "Xabar qoldiring",
			fullName: "To'liq ism familiya",
			fullNamePlaceholder: "Ism familiyangizni kiriting",
			emailPlaceholder: "email@example.com",
			phonePlaceholder: "+998 90 123 45 67",
			subject: "Xabar mavzusi",
			subjectPlaceholder: "Xabar mavzusini kiriting",
			message: "Xabar matni",
			messagePlaceholder: "Xabaringizni bu yerga yozing",
			submit: "Xabarni yuborish",
			sending: "Yuborilmoqda...",
			successMessage: "Xabaringiz muvaffaqiyatli yuborildi!",
			errorMessage: "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
		},
		ru: {
			title: "Контакты",
			subtitle: "Свяжитесь с нами",
			phone: "Телефон",
			fax: "Факс",
			email: "Электронная почта",
			address: "Адрес",
			contactText: "Не стесняйтесь обращаться к нам с вопросами или чтобы поделиться своими мыслями.",
			formTitle: "Оставить сообщение",
			fullName: "Полное имя фамилия",
			fullNamePlaceholder: "Введите ваше имя и фамилию",
			emailPlaceholder: "email@example.com",
			phonePlaceholder: "+998 90 123 45 67",
			subject: "Тема сообщения",
			subjectPlaceholder: "Введите тему сообщения",
			message: "Текст сообщения",
			messagePlaceholder: "Напишите ваше сообщение здесь",
			submit: "Отправить сообщение",
			sending: "Отправляется...",
			successMessage: "Ваше сообщение успешно отправлено!",
			errorMessage: "Произошла ошибка. Пожалуйста, попробуйте еще раз."
		},
		en: {
			title: "Contact",
			subtitle: "Get in touch with us",
			phone: "Phone",
			fax: "Fax",
			email: "Email",
			address: "Address",
			contactText: "Feel free to contact us with questions or to share your thoughts.",
			formTitle: "Leave a message",
			fullName: "Full name",
			fullNamePlaceholder: "Enter your full name",
			emailPlaceholder: "email@example.com",
			phonePlaceholder: "+998 90 123 45 67",
			subject: "Subject",
			subjectPlaceholder: "Enter message subject",
			message: "Message",
			messagePlaceholder: "Write your message here",
			submit: "Send message",
			sending: "Sending...",
			successMessage: "Your message has been sent successfully!",
			errorMessage: "An error occurred. Please try again."
		}
	}

	// Kontakt ma'lumotlari
	const contactInfo = {
		phone: "+998 90 123 45 67",
		fax: "+998 71 234 56 78",
		email: "info@company.uz",
		address: {
			uz: "Toshkent shahar, Yunusobod tumani, 12-uy",
			ru: "г. Ташкент, Юнусабадский район, дом 12",
			en: "Tashkent city, Yunusabad district, house 12"
		}
	}

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

	// Form input changes
	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	// Form submit
	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setSubmitStatus(null)

		try {
			const response = await axios.post(`${BASE_URL}/api/application/create`, formData)

			if (response.data.success) {
				setSubmitStatus({
					type: 'success',
					message: response.data.message || t.successMessage
				})
				// Formani tozalash
				setFormData({
					name: "",
					email: "",
					phone: "",
					message: ""
				})
			} else {
				setSubmitStatus({
					type: 'error',
					message: response.data.message || t.errorMessage
				})
			}
		} catch (error) {
			console.error("Form yuborishda xatolik:", error)
			setSubmitStatus({
				type: 'error',
				message: error.response?.data?.message || t.errorMessage
			})
		} finally {
			setLoading(false)
		}
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
						<h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
							{t.title}
						</h1>
						<div className="w-20 h-1 bg-blue-500 mx-auto mb-4"></div>
						<p className="text-lg text-gray-600">
							{t.subtitle}
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Kontakt ma'lumotlari */}
						<div className="bg-white rounded-xl shadow-lg p-6">
							{/* Telefon */}
							<div className="flex items-start mb-6">
								<div className="bg-blue-100 p-3 rounded-lg mr-4">
									<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
									</svg>
								</div>
								<div>
									<h2 className="text-xl font-semibold text-gray-800 mb-1">{t.phone}</h2>
									<p className="text-gray-700">{contactInfo.phone}</p>
								</div>
							</div>

							{/* Faks */}
							<div className="flex items-start mb-6">
								<div className="bg-green-100 p-3 rounded-lg mr-4">
									<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
									</svg>
								</div>
								<div>
									<h2 className="text-xl font-semibold text-gray-800 mb-1">{t.fax}</h2>
									<p className="text-gray-700">{contactInfo.fax}</p>
								</div>
							</div>

							{/* Elektron pochta */}
							<div className="flex items-start mb-6">
								<div className="bg-purple-100 p-3 rounded-lg mr-4">
									<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>
								<div>
									<h2 className="text-xl font-semibold text-gray-800 mb-1">{t.email}</h2>
									<p className="text-gray-700">{contactInfo.email}</p>
								</div>
							</div>

							{/* Manzil */}
							<div className="flex items-start mb-6">
								<div className="bg-orange-100 p-3 rounded-lg mr-4">
									<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<div>
									<h2 className="text-xl font-semibold text-gray-800 mb-1">{t.address}</h2>
									<p className="text-gray-700">{contactInfo.address[currentLang] || contactInfo.address.uz}</p>
								</div>
							</div>

							{/* Qo'shimcha matn */}
							<div className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
								<p className="text-gray-700 text-sm italic">
									{t.contactText}
								</p>
							</div>
						</div>

						{/* Forma */}
						<div className="bg-white rounded-xl shadow-lg p-6">
							<h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t.formTitle}</h2>

							{/* Status xabari */}
							{submitStatus && (
								<div className={`mb-4 p-3 rounded-lg ${submitStatus.type === 'success'
									? 'bg-green-50 border border-green-200 text-green-700'
									: 'bg-red-50 border border-red-200 text-red-700'
									}`}>
									<div className="flex items-center gap-2">
										<div className={`w-2 h-2 rounded-full ${submitStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
										<p className="text-sm font-medium">{submitStatus.message}</p>
									</div>
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-4">
								{/* Ism familiya */}
								<div>
									<label className="block text-gray-700 mb-2 text-sm font-medium">{t.fullName}</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleChange}
										className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder={t.fullNamePlaceholder}
										disabled={loading}
									/>
								</div>

								{/* Elektron pochta */}
								<div>
									<label className="block text-gray-700 mb-2 text-sm font-medium">{t.email}</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder={t.emailPlaceholder}
										disabled={loading}
									/>
								</div>

								{/* Telefon raqami */}
								<div>
									<label className="block text-gray-700 mb-2 text-sm font-medium">{t.phone}</label>
									<input
										type="tel"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder={t.phonePlaceholder}
										disabled={loading}
									/>
								</div>

								{/* Xabar matni */}
								<div>
									<label className="block text-gray-700 mb-2 text-sm font-medium">{t.message}</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										rows="4"
										className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder={t.messagePlaceholder}
										disabled={loading}
									></textarea>
								</div>

								{/* Yuborish tugmasi */}
								<button
									type="submit"
									disabled={loading}
									className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${loading
										? 'bg-gray-400 cursor-not-allowed'
										: 'bg-blue-600 hover:bg-blue-700 text-white'
										}`}
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
											{t.sending}
										</>
									) : (
										t.submit
									)}
								</button>
							</form>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer />
		</div>
	)
}

export default Contacts
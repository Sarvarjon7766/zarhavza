import axios from 'axios'
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FullscreenControl, Map, Placemark, YMaps, ZoomControl } from 'react-yandex-maps'

const Contacts = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: ""
	})
	const [loading, setLoading] = useState(false)
	const [submitStatus, setSubmitStatus] = useState(null)
	const [language, setLanguage] = useState("uz")
	const [locations, setLocations] = useState([])
	const [loadingLocations, setLoadingLocations] = useState(true)
	const BASE_URL = import.meta.env.VITE_BASE_URL
	const mapInstance = useRef(null)

	// Tilni boshqarish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)

		const handleStorageChange = () => {
			const newLang = localStorage.getItem("lang") || "uz"
			setLanguage(newLang)
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [])

	// Lokatsiyalarni API'dan olish
	useEffect(() => {
		fetchLocations()
	}, [language])

	const fetchLocations = async () => {
		try {
			setLoadingLocations(true)
			const response = await axios.get(`${BASE_URL}/api/location/getAll/${language}`)

			if (response.data.success) {
				const apiLocations = response.data.locations.map(location => ({
					...location,
					coord: location.coord.split(',').map(coord => parseFloat(coord.trim()))
				}))
				setLocations(apiLocations)
			} else {
				console.error("Lokatsiyalarni olishda xatolik:", response.data.message)
				// Agar API'dan ma'lumot olinmasa, standart ma'lumotlarni ko'rsatish
				setLocations(getDefaultLocations())
			}
		} catch (error) {
			console.error("Lokatsiyalarni yuklashda xatolik:", error)
			// Xatolik yuz bersa, standart ma'lumotlarni ko'rsatish
			setLocations(getDefaultLocations())
		} finally {
			setLoadingLocations(false)
		}
	}

	// Standart lokatsiyalar (API ishlamasa foydalanish uchun)
	const getDefaultLocations = () => [
		{
			_id: "1",
			coord: [39.6559199, 66.9626416],
			title: "Bosh ofis",
			address: "Samarqand shahri, Markaziy ko'cha",
			phone: "+998 90 123 45 67",
			workHours: "Dushanba-Juma: 9:00-18:00"
		},
		{
			_id: "2",
			coord: [39.654500, 66.975000],
			title: "Gagarin filiali",
			address: "Samarqand, Registon maydoni",
			phone: "+998 91 234 56 78",
			workHours: "Dushanba-Shanba: 10:00-20:00"
		}
	]

	// Tarjima matnlari
	const translations = {
		uz: {
			title: "Biz bilan bog'laning",
			contactInfo: "Aloqa ma'lumotlari",
			address: "Manzil",
			phone: "Telefon",
			email: "Email",
			workTime: "Ish vaqti",
			location: "Joylashuv",
			proposals: "Taklif va murojaatlar",
			name: "Ismingiz *",
			namePlaceholder: "Ismingizni kiriting",
			emailPlaceholder: "email@example.com",
			phonePlaceholder: "+998 (XX) XXX-XX-XX",
			message: "Xabaringiz *",
			messagePlaceholder: "Xabaringizni bu yerda yozing...",
			sendButton: "Xabarni yuborish",
			sending: "Yuborilmoqda...",
			requiredFields: "* bilan belgilangan maydonlar to'ldirilishi shart",
			successMessage: "Arizangiz muvaffaqiyatli yuborildi!",
			errorMessage: "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
			loadingLocations: "Lokatsiyalar yuklanmoqda...",
			noLocations: "Lokatsiyalar mavjud emas",
			balloonAddress: "Manzil",
			balloonPhone: "Telefon",
			balloonWorkHours: "Ish vaqti"
		},
		ru: {
			title: "Свяжитесь с нами",
			contactInfo: "Контактная информация",
			address: "Адрес",
			phone: "Телефон",
			email: "Email",
			workTime: "Время работы",
			location: "Местоположение",
			proposals: "Предложения и обращения",
			name: "Ваше имя *",
			namePlaceholder: "Введите ваше имя",
			emailPlaceholder: "email@example.com",
			phonePlaceholder: "+998 (XX) XXX-XX-XX",
			message: "Ваше сообщение *",
			messagePlaceholder: "Напишите ваше сообщение здесь...",
			sendButton: "Отправить сообщение",
			sending: "Отправляется...",
			requiredFields: "* отмеченные поля обязательны для заполнения",
			successMessage: "Ваша заявка успешно отправлена!",
			errorMessage: "Произошла ошибка. Пожалуйста, попробуйте еще раз.",
			loadingLocations: "Загрузка локаций...",
			noLocations: "Локации не найдены",
			balloonAddress: "Адрес",
			balloonPhone: "Телефон",
			balloonWorkHours: "Время работы"
		},
		en: {
			title: "Contact Us",
			contactInfo: "Contact Information",
			address: "Address",
			phone: "Phone",
			email: "Email",
			workTime: "Working Hours",
			location: "Location",
			proposals: "Proposals and Inquiries",
			name: "Your Name *",
			namePlaceholder: "Enter your name",
			emailPlaceholder: "email@example.com",
			phonePlaceholder: "+998 (XX) XXX-XX-XX",
			message: "Your Message *",
			messagePlaceholder: "Write your message here...",
			sendButton: "Send Message",
			sending: "Sending...",
			requiredFields: "* marked fields are required",
			successMessage: "Your application has been sent successfully!",
			errorMessage: "An error occurred. Please try again.",
			loadingLocations: "Loading locations...",
			noLocations: "No locations found",
			balloonAddress: "Address",
			balloonPhone: "Phone",
			balloonWorkHours: "Working Hours"
		}
	}

	const t = translations[language] || translations.uz

	// Statik ma'lumotlar
	const contactDetails = {
		address: language === 'uz' ? "Urganch shahri, Al-Xorazmiy ko'chasi 15" :
			language === 'ru' ? "г. Ургенч, ул. Аль-Хорезми 15" :
				"Urgench city, Al-Khorezmi street 15",
		phones: ["+998 (71) 200-00-00", "+998 (71) 200-00-01"],
		emails: ["info@ufez.uz", "invest@ufez.uz"],
		workSchedule: language === 'uz' ? [
			"Dushanba - Juma: 9:00 - 18:00",
			"Shanba: 9:00 - 14:00",
			"Yakshanba: Dam olish kuni"
		] : language === 'ru' ? [
			"Понедельник - Пятница: 9:00 - 18:00",
			"Суббота: 9:00 - 14:00",
			"Воскресенье: Выходной"
		] : [
			"Monday - Friday: 9:00 - 18:00",
			"Saturday: 9:00 - 14:00",
			"Sunday: Day off"
		]
	}

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

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
				setFormData({ name: "", email: "", phone: "", message: "" })
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

	// Xarita markazini hisoblash
	const getMapCenter = () => {
		if (locations.length === 0) return [39.6559199, 66.9626416] // Default center

		const sumCoords = locations.reduce((acc, location) => {
			return [acc[0] + location.coord[0], acc[1] + location.coord[1]]
		}, [0, 0])

		return [sumCoords[0] / locations.length, sumCoords[1] / locations.length]
	}

	// Balloon kontentini yaratish - TO'LIQ MA'LUMOTLAR BILAN
	const createBalloonContent = (location) => {
		return `
			<div style="padding: 20px; min-width: 320px; max-width: 400px; font-family: Arial, sans-serif; background: white; border-radius: 8px;">
				<!-- Sarlavha -->
				<div style="margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
					<h3 style="margin: 0; font-size: 20px; color: #1f2937; font-weight: bold; line-height: 1.3;">
						${location.title}
					</h3>
				</div>
				
				<!-- Ma'lumotlar -->
				<div style="space-y-3">
					<!-- Manzil -->
					<div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
						<div style="color: #3b82f6; font-weight: bold; min-width: 80px; font-size: 14px;">${t.balloonAddress}:</div>
						<div style="color: #4b5563; line-height: 1.5; font-size: 14px; flex: 1;">
							${location.address}
						</div>
					</div>
					
					<!-- Telefon -->
					<div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
						<div style="color: #3b82f6; font-weight: bold; min-width: 80px; font-size: 14px;">${t.balloonPhone}:</div>
						<div style="color: #4b5563; font-size: 14px; flex: 1;">
							<a href="tel:${location.phone.replace(/\s/g, '')}" 
							   style="color: #059669; text-decoration: none; font-weight: 500; line-height: 1.5;">
								${location.phone}
							</a>
						</div>
					</div>
					
					<!-- Ish vaqti -->
					<div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
						<div style="color: #3b82f6; font-weight: bold; min-width: 80px; font-size: 14px;">${t.balloonWorkHours}:</div>
						<div style="color: #4b5563; line-height: 1.5; font-size: 14px; flex: 1;">
							${location.workHours}
						</div>
					</div>
				</div>
				
				<!-- Footer -->
				<div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; text-align: center;">
					<small style="color: #6b7280; font-size: 12px;">
						📍 Marker ustiga bosing
					</small>
				</div>
			</div>
		`
	}

	// Hint kontentini yaratish - TO'LIQ MA'LUMOTLAR BILAN
	const createHintContent = (location) => {
		return `
			<div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif; background: white; border-radius: 6px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
				<!-- Sarlavha -->
				<div style="font-weight: bold; color: #1f2937; margin-bottom: 8px; font-size: 14px; line-height: 1.3;">
					🏢 ${location.title}
				</div>
				
				<!-- Manzil -->
				<div style="color: #6b7280; font-size: 12px; margin-bottom: 6px; line-height: 1.4;">
					📍 ${location.address}
				</div>
				
				<!-- Telefon -->
				<div style="color: #6b7280; font-size: 12px; margin-bottom: 6px; line-height: 1.4;">
					📞 ${location.phone}
				</div>
				
				<!-- Ish vaqti -->
				<div style="color: #6b7280; font-size: 12px; line-height: 1.4;">
					🕒 ${location.workHours}
				</div>
				
				<!-- Ko'rsatma -->
				<div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #d1d5db;">
					<small style="color: #9ca3af; font-size: 10px;">
						Batafsil ma'lumot uchun bosing
					</small>
				</div>
			</div>
		`
	}

	// Aloqa elementlari komponenti
	const ContactItem = ({ icon: Icon, color, title, children }) => (
		<div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
			<div className={`flex-shrink-0 w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
				<Icon className="w-5 h-5 text-white" />
			</div>
			<div className="min-w-0 flex-1">
				<h4 className="font-semibold text-gray-800 mb-1 text-sm">{title}</h4>
				{children}
			</div>
		</div>
	)

	return (
		<section id="contacts" className="py-16 bg-white">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				{/* Sarlavha */}
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
						{t.title}
					</h2>
					<div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
					{/* Chap qism: Aloqa ma'lumotlari - 2/3 */}
					<div className="lg:col-span-2">
						<div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 h-full">
							<h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
								<div className="w-2 h-6 bg-blue-500 rounded-full"></div>
								{t.contactInfo}
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
								<ContactItem icon={MapPin} color="bg-blue-500" title={t.address}>
									<p className="text-gray-600 text-sm">{contactDetails.address}</p>
								</ContactItem>

								<ContactItem icon={Phone} color="bg-green-500" title={t.phone}>
									{contactDetails.phones.map((number, index) => (
										<p key={index} className="text-gray-600 text-sm">{number}</p>
									))}
								</ContactItem>

								<ContactItem icon={Mail} color="bg-purple-500" title={t.email}>
									{contactDetails.emails.map((email, index) => (
										<p key={index} className="text-gray-600 text-sm">{email}</p>
									))}
								</ContactItem>

								<ContactItem icon={Clock} color="bg-orange-500" title={t.workTime}>
									{contactDetails.workSchedule.map((schedule, index) => (
										<p key={index} className="text-gray-600 text-sm">{schedule}</p>
									))}
								</ContactItem>
							</div>

							{/* Xarita qismi */}
							<div className="mt-6">
								<div className="flex items-center justify-between mb-4">
									<h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
										<MapPin className="w-5 h-5 text-blue-500" />
										{t.location}
									</h4>
									<span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
										{locations.length} ta ofis
									</span>
								</div>

								{/* Yandex Xarita container */}
								<div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-300" style={{ height: '500px' }}>
									{loadingLocations ? (
										<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
											<div className="text-center">
												<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
												<p className="text-gray-600">{t.loadingLocations}</p>
											</div>
										</div>
									) : locations.length === 0 ? (
										<div className="absolute inset-0 flex items-center justify-center bg-gray-100">
											<div className="text-center">
												<MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
												<p className="text-gray-600">{t.noLocations}</p>
											</div>
										</div>
									) : (
										<YMaps
											query={{
												apikey: "41da0c7e-9daf-46c6-bb79-3519885b11bf",
												lang: 'ru_RU'
											}}
										>
											<Map
												defaultState={{
													center: getMapCenter(),
													zoom: 10,
												}}
												width="100%"
												height="100%"
												instanceRef={(ref) => {
													if (mapInstance.current && mapInstance.current.destroy) {
														mapInstance.current.destroy()
													}
													mapInstance.current = ref
												}}
												modules={[
													"control.ZoomControl",
													"control.FullscreenControl",
													"geoObject.addon.balloon",
													"geoObject.addon.hint"
												]}
											>
												{locations.map((location, index) => (
													<Placemark
														key={location._id || index}
														geometry={location.coord}
														properties={{
															balloonContentHeader: '',
															balloonContentBody: createBalloonContent(location),
															hintContent: createHintContent(location)
														}}
														options={{
															preset: "islands#blueIcon",
															iconColor: '#007bff',
															balloonCloseButton: true,
															hideIconOnBalloonOpen: false,
															balloonMaxWidth: 400,
															balloonMinWidth: 320
														}}
													/>
												))}
												<ZoomControl options={{ float: 'right' }} />
												<FullscreenControl />
											</Map>
										</YMaps>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* O'ng qism: Taklif va murojaatlar formasi - 1/3 */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
							<h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
								<div className="w-2 h-6 bg-green-500 rounded-full"></div>
								{t.proposals}
							</h3>

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
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										{t.name}
									</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										placeholder={t.namePlaceholder}
										disabled={loading}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										{t.email} *
									</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										placeholder={t.emailPlaceholder}
										disabled={loading}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										{t.phone}
									</label>
									<input
										type="tel"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										placeholder={t.phonePlaceholder}
										disabled={loading}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										{t.message}
									</label>
									<textarea
										name="message"
										value={formData.message}
										onChange={handleChange}
										required
										rows={4}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
										placeholder={t.messagePlaceholder}
										disabled={loading}
									/>
								</div>

								<button
									type="submit"
									disabled={loading}
									className={`w-full font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${loading
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
										<>
											<Send className="w-4 h-4" />
											{t.sendButton}
										</>
									)}
								</button>

								<div className="text-center text-xs text-gray-500">
									{t.requiredFields}
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Contacts
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
	const [contactData, setContactData] = useState(null)
	const [loadingContact, setLoadingContact] = useState(true)
	const BASE_URL = import.meta.env.VITE_BASE_URL
	const mapInstance = useRef(null)

	// Tilni boshqarish - yangilangan versiya
	useEffect(() => {
		// Dastlabki tilni o'rnatish
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)

		// Til o'zgarishini kuzatish
		const handleLanguageChange = () => {
			const newLang = localStorage.getItem("lang") || "uz"
			if (newLang !== language) {
				setLanguage(newLang)
			}
		}

		// Custom event qo'shish
		const handleCustomLanguageChange = () => {
			handleLanguageChange()
		}

		// Storage o'zgarishini kuzatish
		window.addEventListener('storage', handleLanguageChange)
		// Custom event ni kuzatish
		window.addEventListener('languageChanged', handleCustomLanguageChange)

		// Interval orqali tekshirish (qo'shimcha xavfsizlik)
		const interval = setInterval(handleLanguageChange, 500)

		return () => {
			window.removeEventListener('storage', handleLanguageChange)
			window.removeEventListener('languageChanged', handleCustomLanguageChange)
			clearInterval(interval)
		}
	}, [language]) // language dependency qo'shildi

	// Kontakt ma'lumotlarini API'dan olish - language o'zgarganda yangilansin
	useEffect(() => {
		if (language) {
			fetchContactData()
		}
	}, [language])

	// Lokatsiyalarni API'dan olish - language o'zgarganda yangilansin
	useEffect(() => {
		if (language) {
			fetchLocations()
		}
	}, [language])

	// Kontakt ma'lumotlarini olish
	const fetchContactData = async () => {
		try {
			setLoadingContact(true)
			console.log("🔄 Fetching contact data for language:", language)
			const response = await axios.get(`${BASE_URL}/api/contact/getActive/${language}`)

			if (response.data.success) {
				console.log("✅ Contact data received:", response.data.contact)
				setContactData(response.data.contact)
			} else {
				console.error("Kontakt ma'lumotlarini olishda xatolik:", response.data.message)
				// Agar API'dan ma'lumot olinmasa, standart ma'lumotlarni ko'rsatish
				setContactData(getDefaultContactData())
			}
		} catch (error) {
			console.error("Kontakt ma'lumotlarini yuklashda xatolik:", error)
			// Xatolik yuz bersa, standart ma'lumotlarni ko'rsatish
			setContactData(getDefaultContactData())
		} finally {
			setLoadingContact(false)
		}
	}

	// Standart kontakt ma'lumotlari (API ishlamasa foydalanish uchun)
	const getDefaultContactData = () => ({
		address_uz: "Samarqand shahar, Gagarin ko'chasi, 70-uy",
		address_ru: "г. Самарканд, ул. Гагарина, дом 70",
		address_en: "Samarkand city, Gagarin street, house 70",
		workin_uz: "Dushanba - Juma: 9:00 - 18:00",
		workin_ru: "Понедельник - Пятница: 9:00 - 18:00",
		workin_en: "Monday - Friday: 9:00 - 18:00",
		phone: "+998 (78) 210-08-93",
		phone_faks: "+998 (78) 210-08-93",
		email: "zar.havza@minwater.uz"
	})

	// Tilga mos manzilni olish
	const getAddressByLanguage = () => {
		if (!contactData) return ""

		switch (language) {
			case 'uz':
				return contactData.address_uz || contactData.address_ru || contactData.address_en || ""
			case 'ru':
				return contactData.address_ru || contactData.address_uz || contactData.address_en || ""
			case 'en':
				return contactData.address_en || contactData.address_uz || contactData.address_ru || ""
			default:
				return contactData.address_uz || ""
		}
	}

	// Tilga mos ish vaqtini olish
	const getWorkinByLanguage = () => {
		if (!contactData) return ""

		switch (language) {
			case 'uz':
				return contactData.workin_uz || contactData.workin_ru || contactData.workin_en || ""
			case 'ru':
				return contactData.workin_ru || contactData.workin_uz || contactData.workin_en || ""
			case 'en':
				return contactData.workin_en || contactData.workin_uz || contactData.workin_ru || ""
			default:
				return contactData.workin_uz || ""
		}
	}

	// Telefon raqamlarini massivga aylantirish
	const getPhonesArray = () => {
		if (!contactData) return []

		const phones = []
		if (contactData.phone) phones.push(contactData.phone)
		if (contactData.phone_faks && contactData.phone_faks !== contactData.phone) {
			phones.push(contactData.phone_faks)
		}
		return phones
	}

	// Email larni massivga aylantirish
	const getEmailsArray = () => {
		if (!contactData) return []
		return contactData.email ? [contactData.email] : []
	}

	// Ish vaqtini massivga aylantirish
	const getWorkSchedule = () => {
		if (!contactData) return []
		const workin = getWorkinByLanguage()
		return workin ? [workin] : []
	}

	const fetchLocations = async () => {
		try {
			setLoadingLocations(true)
			console.log("🔄 Fetching locations for language:", language)
			const response = await axios.get(`${BASE_URL}/api/location/getAll/${language}`)

			if (response.data.success) {
				console.log("✅ Locations data received:", response.data.locations)
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
			title: getLocationTitle("Bosh ofis", "Главный офис", "Head Office"),
			address: getLocationAddress(
				"Samarqand shahri, Markaziy ko'cha",
				"г. Самарканд, Центральная улица",
				"Samarkand city, Central street"
			),
			phone: "+998 90 123 45 67",
			workHours: getLocationWorkHours(
				"Dushanba-Juma: 9:00-18:00",
				"Понедельник-Пятница: 9:00-18:00",
				"Monday-Friday: 9:00-18:00"
			)
		},
		{
			_id: "2",
			coord: [39.654500, 66.975000],
			title: getLocationTitle("Gagarin filiali", "Филиал Гагарина", "Gagarin Branch"),
			address: getLocationAddress(
				"Samarqand, Registon maydoni",
				"Самарканд, площадь Регистан",
				"Samarkand, Registan square"
			),
			phone: "+998 91 234 56 78",
			workHours: getLocationWorkHours(
				"Dushanba-Shanba: 10:00-20:00",
				"Понедельник-Суббота: 10:00-20:00",
				"Monday-Saturday: 10:00-20:00"
			)
		}
	]

	// Tilga mos sarlavha olish
	const getLocationTitle = (uz, ru, en) => {
		switch (language) {
			case 'uz': return uz
			case 'ru': return ru
			case 'en': return en
			default: return uz
		}
	}

	// Tilga mos manzil olish
	const getLocationAddress = (uz, ru, en) => {
		switch (language) {
			case 'uz': return uz
			case 'ru': return ru
			case 'en': return en
			default: return uz
		}
	}

	// Tilga mos ish vaqti olish
	const getLocationWorkHours = (uz, ru, en) => {
		switch (language) {
			case 'uz': return uz
			case 'ru': return ru
			case 'en': return en
			default: return uz
		}
	}

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
			loadingContact: "Aloqa ma'lumotlari yuklanmoqda...",
			noLocations: "Lokatsiyalar mavjud emas",
			balloonAddress: "Manzil",
			balloonPhone: "Telefon",
			balloonWorkHours: "Ish vaqti",
			fax: "Faks",
			officesCount: "ta ofis"
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
			loadingContact: "Загрузка контактных данных...",
			noLocations: "Локации не найдены",
			balloonAddress: "Адрес",
			balloonPhone: "Телефон",
			balloonWorkHours: "Время работы",
			fax: "Факс",
			officesCount: "офисов"
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
			loadingContact: "Loading contact information...",
			noLocations: "No locations found",
			balloonAddress: "Address",
			balloonPhone: "Phone",
			balloonWorkHours: "Working Hours",
			fax: "Fax",
			officesCount: "offices"
		}
	}

	const t = translations[language] || translations.uz

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
						📍 ${language === 'uz' ? 'Marker ustiga bosing' : language === 'ru' ? 'Нажмите на маркер' : 'Click on the marker'}
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
						${language === 'uz' ? 'Batafsil ma\'lumot uchun bosing' : language === 'ru' ? 'Нажмите для подробной информации' : 'Click for more information'}
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

	// Yuklanish holatini ko'rsatish
	if (loadingContact) {
		return (
			<section id="contacts" className="py-16 bg-white">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
						<p className="text-gray-600">{t.loadingContact}</p>
					</div>
				</div>
			</section>
		)
	}

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
								{/* Manzil */}
								<ContactItem icon={MapPin} color="bg-blue-500" title={t.address}>
									<p className="text-gray-600 text-sm">{getAddressByLanguage()}</p>
								</ContactItem>

								{/* Telefon */}
								<ContactItem icon={Phone} color="bg-green-500" title={t.phone}>
									{getPhonesArray().map((number, index) => (
										<p key={index} className="text-gray-600 text-sm">{number}</p>
									))}
									{contactData?.phone_faks && contactData.phone_faks !== contactData.phone && (
										<div className="mt-1">
											<span className="text-xs text-gray-500 font-medium">{t.fax}: </span>
											<span className="text-gray-600 text-sm">{contactData.phone_faks}</span>
										</div>
									)}
								</ContactItem>

								{/* Email */}
								<ContactItem icon={Mail} color="bg-purple-500" title={t.email}>
									{getEmailsArray().map((email, index) => (
										<p key={index} className="text-gray-600 text-sm">{email}</p>
									))}
								</ContactItem>

								{/* Ish vaqti */}
								<ContactItem icon={Clock} color="bg-orange-500" title={t.workTime}>
									{getWorkSchedule().map((schedule, index) => (
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
										{locations.length} {t.officesCount}
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
												lang: language === 'ru' ? 'ru_RU' : language === 'en' ? 'en_US' : 'uz_UZ'
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
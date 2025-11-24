import axios from 'axios'
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

const Questions = () => {
	const [activeQuestion, setActiveQuestion] = useState(0)
	const [language, setLanguage] = useState("uz")
	const [askeds, setAskeds] = useState([])
	const [loading, setLoading] = useState(true)
	const BASE_URL = import.meta.env.VITE_BASE_URL

	// LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
		fetchAskeds(savedLang)
	}, [])

	// Til o'zgarganda yangilash
	useEffect(() => {
		const handleStorageChange = () => {
			const savedLang = localStorage.getItem("lang") || "uz"
			if (savedLang !== language) {
				setLanguage(savedLang)
				fetchAskeds(savedLang)
			}
		}

		window.addEventListener('storage', handleStorageChange)

		const interval = setInterval(() => {
			const savedLang = localStorage.getItem("lang") || "uz"
			if (savedLang !== language) {
				setLanguage(savedLang)
				fetchAskeds(savedLang)
			}
		}, 1000)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
	}, [language])

	// API dan savollarni olish
	const fetchAskeds = async (lang = language) => {
		try {
			setLoading(true)
			const res = await axios.get(`${BASE_URL}/api/asked/getAll/${lang}`)
			if (res.data.success && res.data.askeds.length > 0) {
				setAskeds(res.data.askeds)
			} else {
				// Agar ma'lumot bo'sh bo'lsa, example data ko'rsatish
				setAskeds(getExampleData())
			}
		} catch (error) {
			console.error("Savollarni olishda xatolik:", error)
			// Example data agar API ishlamasa
			setAskeds(getExampleData())
		} finally {
			setLoading(false)
		}
	}
	// Example data generator
	const getExampleData = () => {
		return [
			{
				id: 1,
				question: "Qanday qilib UFEZda loyiha ochish mumkin?",
				ask: "Urgut EIZda loyiha ochish uchun quyidagi bosqichlardan o'tishingiz kerak: 1) Loyiha taklifini tayyorlang, 2) Direksiyaga ariza bilan murojaat qiling, 3) Texnik-iqtisodiy asoslamani taqdim eting, 4) Investitsiya shartnomasini imzolang. Butun jarayon 30 ish kuni ichida yakunlanadi."
			},
			{
				id: 2,
				question: "Soliq imtiyozlari mavjudmi?",
				ask: "Ha, Urgut EIZda quyidagi soliq imtiyozlari mavjud: Daromad solig'i - 7 yil muddatga 0%, Mulk solig'i - 10 yil muddatga 100% imtiyoz, Yer solig'i - 10 yil muddatga 50% chegirma. Barcha imtiyozlar investitsiya hajmiga qarab belgilanadi."
			},
			{
				id: 3,
				question: "Qayerdan ro'yxatdan o'tish kerak?",
				ask: "Ro'yxatdan o'tish uchun Urgut EIZ Direksiyasining rasmiy veb-saytida elektron ariza topshirishingiz yoki bevosita direksiya binosiga kelib murojaat qilishingiz mumkin. Barcha hujjatlar onlayn tarzda taqdim etilishi mumkin. Direksiya manzili: Toshkent shahri, Urgut tumani."
			},
			{
				id: 4,
				question: "Investitsiya uchun minimal summa qancha?",
				ask: "Minimal investitsiya summasi loyiha turiga qarab farq qiladi: Ishlab chiqarish loyihalari - 500 ming dollar, Xizmat ko'rsatish loyihalari - 200 ming dollar, Texnologik loyihalar - 100 ming dollar. Kichik biznes loyihalari uchun maxsus dasturlar mavjud."
			},
			{
				id: 5,
				question: "Qanday infratuzilma imkoniyatlari mavjud?",
				ask: "Urgut EIZda zamonaviy infratuzilma mavjud: 24/7 elektr ta'minoti, suv ta'minoti, kanalizatsiya, yo'l tarmoqlari, internet aloqasi, logistika markazi. Hududda ishlab chiqarish binolari, omborxonalar va ofis maydonlari ijaraga beriladi."
			},
			{
				id: 6,
				question: "Loyiha uchun qancha vaqt kerak?",
				ask: "Loyihani amalga oshirish uchun zarur vaqt loyiha hajmiga bog'liq. O'rtacha 3-6 oy ichida barcha ruxsatnomalar olinadi va ish boshlanishi mumkin. Direksiya loyihalarni tezlashtirish uchun maxsus xizmatlar ko'rsatadi."
			},
			{
				id: 7,
				question: "Xorijiy investorlar uchun qanday shartlar?",
				ask: "Xorijiy investorlar uchun maxsus shartlar mavjud: 100% chet el kapitali, daromadni chet elga erkin chiqarish, viza va ishga qabul qilishda yordam. Direksiya xorijiy investorlar uchun barcha hujjatlar bilan yordam beradi."
			},
			{
				id: 8,
				question: "Ishchi kuchi mavjudmi?",
				ask: "Hududda malakali ishchi kuchi yetarlicha mavjud. Direksiya kadrlar tayyorlash va malaka oshirish dasturlarini taklif etadi. O'rtacha ish haqi mintaqa bo'yicha raqobatbardosh."
			},
			{
				id: 9,
				question: "Energiya ta'minoti qanday?",
				ask: "Hududda barqaror energiya ta'minoti mavjud. Zaxira generatorlar va muqobil energiya manbalari ham mavjud. Energiya narxlari mintaqaviy standartlarga mos keladi."
			},
			{
				id: 10,
				question: "Logistika imkoniyatlari qanday?",
				ask: "Urgut EIZ strategik joylashgan. Temir yo'l, avtomobil yo'llari va aeroportlar yaqin joyda. Direksiya logistika xizmatlari va bojxona rasmiylashtirishda yordam beradi."
			}
		]
	}

	// Tarjima matnlari - faqat taglar
	const translations = {
		uz: {
			title: "Ko'p So'raladigan Savollar",
			subtitle: "Bizga tez-tez beriladigan savollarga javoblar",
			questionsList: "Savollar Ro'yxati",
			loading: "Savollar yuklanmoqda..."
		},
		ru: {
			title: "Часто Задаваемые Вопросы",
			subtitle: "Ответы на часто задаваемые вопросы",
			questionsList: "Список Вопросов",
			loading: "Вопросы загружаются..."
		},
		en: {
			title: "Frequently Asked Questions",
			subtitle: "Answers to frequently asked questions",
			questionsList: "Questions List",
			loading: "Loading questions..."
		}
	}

	const t = translations[language] || translations.uz

	if (loading) {
		return (
			<section id="faq" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
				{/* Background decoration */}
				<div className="absolute inset-0 opacity-5">
					<div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl"></div>
					<div className="absolute bottom-20 right-20 w-16 h-16 bg-cyan-400 rounded-full blur-xl"></div>
				</div>

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
							{t.title}
						</h2>
						<div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mb-6 rounded-full"></div>
					</div>
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">{t.loading}</p>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section id="faq" className="py-5 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl"></div>
				<div className="absolute bottom-20 right-20 w-16 h-16 bg-cyan-400 rounded-full blur-xl"></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				{/* Sarlavha */}
				<div className="text-center mb-16">
					<div className="inline-flex items-center gap-3 mb-4">
						<h2 className="text-4xl md:text-5xl font-bold text-gray-800">
							{t.title}
						</h2>
					</div>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
						{t.subtitle}
					</p>
					<div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>
				</div>

				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col lg:flex-row gap-8">
						{/* Savollar ro'yxati - chap tomonda 1/3 */}
						<div className="lg:w-2/5">
							<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-6">
								<h3 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									{t.questionsList}
								</h3>
								<div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
									{askeds.map((asked, index) => (
										<button
											key={asked.id || index}
											onClick={() => setActiveQuestion(index)}
											className={`
												w-full text-left p-4 rounded-xl transition-all duration-300 group
												${activeQuestion === index
													? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105 border border-blue-300'
													: 'bg-white/60 hover:bg-white text-gray-700 hover:shadow-lg border border-gray-200/60 hover:border-blue-300 hover:scale-105'
												}
											`}
										>
											<div className="flex items-center gap-4">
												<div className={`
													flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300
													${activeQuestion === index
														? 'bg-white/20 text-white shadow-inner'
														: 'bg-blue-100 text-blue-600 group-hover:bg-blue-200 group-hover:text-blue-700 shadow-sm'
													}
												`}>
													{index + 1}
												</div>
												<div className="flex-1 min-w-0">
													<div className={`text-sm font-semibold leading-tight transition-all duration-300 ${activeQuestion === index ? 'text-white' : 'text-gray-800 group-hover:text-blue-600'}`}>
														{asked.question}
													</div>
												</div>
												<ChevronDown
													size={16}
													className={`
														flex-shrink-0 transition-all duration-300
														${activeQuestion === index
															? 'text-white rotate-180 scale-110'
															: 'text-gray-400 group-hover:text-blue-500 group-hover:scale-110'
														}
													`}
												/>
											</div>
										</button>
									))}
								</div>
							</div>
						</div>

						{/* Javoblar - o'ng tomonda 2/3 */}
						<div className="lg:w-3/5">
							<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 h-full">
								<div className="flex items-start gap-6 mb-8">
									<div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
										<span className="text-white font-bold text-xl">?</span>
									</div>
									<div className="flex-1">
										<h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3 leading-tight">
											{askeds[activeQuestion]?.question}
										</h3>
										<div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
									</div>
								</div>

								<div className="prose prose-lg max-w-none">
									<div className="text-gray-700 leading-relaxed text-lg space-y-4">
										{askeds[activeQuestion]?.ask.split('. ').map((sentence, index, array) =>
											sentence && (
												<div key={index} className="flex items-start gap-4 group">
													<div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1 group-hover:bg-blue-200 transition-colors duration-300">
														<div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
													</div>
													<p className="text-gray-700 leading-relaxed flex-1">
														{sentence}{index < array.length - 1 ? '.' : ''}
													</p>
												</div>
											)
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 4px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: #f1f5f9;
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #cbd5e1;
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #94a3b8;
				}
			`}</style>
		</section>
	)
}

export default Questions
import { Heart, Mail, MapPin, Phone } from "lucide-react"
import { useEffect, useState } from "react"

const Footer = () => {
	const [language, setLanguage] = useState("uz")

	// LocalStorage'dan tilni o'qish
	useEffect(() => {
		const savedLang = localStorage.getItem("lang") || "uz"
		setLanguage(savedLang)
	}, [])

	// Til o'zgarganda yangilash
	useEffect(() => {
		const handleStorageChange = () => {
			const savedLang = localStorage.getItem("lang") || "uz"
			setLanguage(savedLang)
		}

		window.addEventListener('storage', handleStorageChange)

		const interval = setInterval(() => {
			const savedLang = localStorage.getItem("lang") || "uz"
			if (savedLang !== language) {
				setLanguage(savedLang)
			}
		}, 1000)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			clearInterval(interval)
		}
	}, [language])

	// Tarjima matnlari - Zarafshon irrigatsiya tizimlari boshqarmasi uchun
	const translations = {
		uz: {
			organizationName: '"Zarafshon irrigatsiya tizimlari boshqarmasi"',
			organizationType: "Davlat muassasasi",
			description: "Suv resurslarini samarali boshqarish va qishloq xo'jaligini suv bilan ta'minlash bo'yicha yetakchi tashkilot. Zarafshon vodiysida irrigatsiya tizimlarini boshqarish va rivojlantirish.",
			contactInfo: "Aloqa Ma'lumotlari",
			trustPhone: "Ishonch telefoni",
			email: "Elektron manzil",
			address: "Bosh ofis",
			location: "Samarqand viloyati, O'zbekiston",
			projectBy: "Loyiha",
			developedBy: "tomonidan ishlab chiqilgan",
			allRights: "Barcha huquqlar himoyalangan"
		},
		ru: {
			organizationName: '"Управление Заравшанских ирригационных систем"',
			organizationType: "Государственное учреждение",
			description: "Ведущая организация по эффективному управлению водными ресурсами и водоснабжению сельского хозяйства. Управление и развитие ирригационных систем в долине Заравшана.",
			contactInfo: "Контактная Информация",
			trustPhone: "Телефон доверия",
			email: "Электронная почта",
			address: "Главный офис",
			location: "Самаркандская область, Узбекистан",
			projectBy: "Проект",
			developedBy: "разработан",
			allRights: "Все права защищены"
		},
		en: {
			organizationName: '"Zarafshon Irrigation Systems Administration"',
			organizationType: "State Institution",
			description: "Leading organization for efficient water resources management and agricultural water supply. Management and development of irrigation systems in the Zarafshon Valley.",
			contactInfo: "Contact Information",
			trustPhone: "Trust Phone",
			email: "Email",
			address: "Head Office",
			location: "Samarkand Region, Uzbekistan",
			projectBy: "Project",
			developedBy: "developed by",
			allRights: "All rights reserved"
		}
	}

	const t = translations[language] || translations.uz

	return (
		<footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
			{/* Asosiy footer kontenti */}
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
					{/* Chap qism: Logo va tashkilot ma'lumotlari */}
					<div className="space-y-6">
						{/* Logo va nom */}
						<div className="flex items-center gap-4">
							<img
								src="/logo.png"
								alt="Zarafshon Irrigation Logo"
								className="h-16 w-16 object-contain"
							/>
							<div>
								<h3 className="text-xl font-bold mb-1">
									{t.organizationName}
								</h3>
								<p className="text-blue-200 text-sm">
									{t.organizationType}
								</p>
							</div>
						</div>

						{/* Tashkilot haqida qisqacha */}
						<p className="text-blue-100 text-sm leading-relaxed max-w-md">
							{t.description}
						</p>
					</div>

					{/* O'ng qism: Aloqa ma'lumotlari */}
					<div className="space-y-4">
						<h4 className="text-lg font-semibold mb-4 border-l-4 border-yellow-400 pl-3">
							{t.contactInfo}
						</h4>

						{/* Telefon */}
						<div className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors">
							<div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
								<Phone size={18} />
							</div>
							<div>
								<p className="font-medium">+998 (66) 123-45-67</p>
								<p className="text-sm text-blue-200">{t.trustPhone}</p>
							</div>
						</div>

						{/* Email */}
						<div className="flex items-center gap-3 text-blue-100 hover:text-white transition-colors">
							<div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
								<Mail size={18} />
							</div>
							<div>
								<p className="font-medium">info@zarafshon-irrigation.uz</p>
								<p className="text-sm text-blue-200">{t.email}</p>
							</div>
						</div>

						{/* Manzil */}
						<div className="flex items-start gap-3 text-blue-100 hover:text-white transition-colors">
							<div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center mt-1">
								<MapPin size={18} />
							</div>
							<div>
								<p className="font-medium">{t.address}</p>
								<p className="text-sm text-blue-200">{t.location}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Pastki chiziq */}
			<div className="border-t border-blue-700"></div>

			{/* Pastki qism */}
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
					{/* Chap qism: Loyiha haqida */}
					<div className="text-blue-200 text-sm">
						<p>
							{t.projectBy}{" "}
							<span className="text-yellow-400 font-semibold">
								Samarqand AKTRM
							</span>{" "}
							{t.developedBy}{" "}
							<span className="text-white font-bold">2025</span>
						</p>
					</div>

					{/* O'ng qism: Huquqlar */}
					<div className="text-blue-200 text-sm flex items-center justify-center md:justify-end gap-1">
						<span>© {new Date().getFullYear()} {t.allRights}</span>
						<Heart size={14} className="text-red-400 fill-current" />
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer
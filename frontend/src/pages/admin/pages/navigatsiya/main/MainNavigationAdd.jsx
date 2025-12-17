import axios from 'axios'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_BASE_URL

const MainNavigationAdd = () => {
	const navigate = useNavigate()
	const { id } = useParams() // URL dan ID ni olish (agar mavjud bo'lsa)
	const [loading, setLoading] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState({
		title: {
			uz: '',
			en: '',
			ru: ''
		},
		slug: '',
		type: 'static',
		icon: '',
		order: 0,
		isActive: true,
		key: '',
		parent: null
	})

	// Iconlar ro'yxati
	const icons = [
		'🏠', 'ℹ', '📊', '🏃‍♂️', '📰', '🖼️', '📄', '🔗', '🧭', '⭐',
		'📸', '📅', '⚙️', '❓', '🈸', '📍', '📢', '🎯', '💼', '👥',
		'🌐', '📱', '💻', '🔒', '📈', '💰', '🏢', '📞', '✉️', '🔍'
	]

	// Type variantlari
	const typeOptions = [
		{ value: 'static', label: 'Static sahifa', icon: '📄' },
		{ value: 'news', label: 'Yangiliklar', icon: '📰' },
		{ value: 'gallery', label: 'Galereya', icon: '🖼️' },
		{ value: 'documents', label: 'Hujjatlar', icon: '📑' },
		{ value: 'leader', label: 'Rahbariyat', icon: '👥' },
		{ value: 'communication', label: 'Aloqa', icon: '📞' }
	]

	// Agar ID mavjud bo'lsa, ma'lumotlarni yuklash
	useEffect(() => {
		if (id) {
			setIsEditing(true)
			fetchPageData(id)
		}
	}, [id])

	// Ma'lumotlarni olish (yangilash uchun)
	const fetchPageData = async (pageId) => {
		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/pages/getMainOne/${pageId}`)

			if (response.data.success) {
				const pageData = response.data.page
				setFormData({
					title: pageData.title,
					slug: pageData.slug,
					type: pageData.type,
					icon: pageData.icon || '',
					order: pageData.order,
					isActive: pageData.isActive,
					key: pageData.key,
					parent: pageData.parent
				})
			} else {
				alert('Ma\'lumotlarni yuklashda xatolik: ' + response.data.message)
				navigate('/admin/main-navigation/list')
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Ma\'lumotlarni yuklashda xatolik yuz berdi')
			navigate('/admin/main-navigation/list')
		} finally {
			setLoading(false)
		}
	}

	const handleInputChange = (field, value) => {
		if (field.startsWith('title.')) {
			const lang = field.split('.')[1]
			setFormData(prev => ({
				...prev,
				title: {
					...prev.title,
					[lang]: value
				}
			}))
		} else {
			setFormData(prev => ({
				...prev,
				[field]: value
			}))
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			let response

			if (isEditing) {
				// Yangilash so'rovi
				response = await axios.put(`${BASE_URL}/api/pages/update/${id}`, formData)
			} else {
				// Yangi qo'shish so'rovi
				response = await axios.post(`${BASE_URL}/api/pages/create`, formData)
			}

			if (response.data.success) {
				const message = isEditing
					? 'Navigatsiya muvaffaqiyatli yangilandi!'
					: 'Navigatsiya muvaffaqiyatli qo\'shildi!'
				alert(message)
				navigate('/admin/main-navigation/list')
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			const message = isEditing
				? 'Navigatsiyani yangilashda xatolik yuz berdi: '
				: 'Navigatsiya qo\'shishda xatolik yuz berdi: '
			alert(message + (error.response?.data?.message || error.message))
		} finally {
			setLoading(false)
		}
	}

	const generateSlug = (text) => {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9 -]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.trim()
	}

	const generateKey = (text) => {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '_')
			.replace(/_+/g, '_')
			.trim()
	}

	const handleTitleChange = (lang, value) => {
		handleInputChange(`title.${lang}`, value)

		// Agar slug bo'sh bo'lsa, uz tilidagi title asosida avtomatik yaratish (faqat yangi qo'shishda)
		if (lang === 'uz' && !formData.slug && !isEditing) {
			const slug = generateSlug(value)
			setFormData(prev => ({ ...prev, slug }))
		}

		// Agar key bo'sh bo'lsa, uz tilidagi title asosida avtomatik yaratish (faqat yangi qo'shishda)
		if (lang === 'uz' && !formData.key && !isEditing) {
			const key = generateKey(value)
			setFormData(prev => ({ ...prev, key }))
		}
	}

	const handleKeyChange = (value) => {
		// Faqat kichik harflar, raqamlar va pastki chiziqga ruxsat berish
		const cleanedValue = value
			.toLowerCase()
			.replace(/[^a-z0-9_]/g, '_')
			.replace(/_+/g, '_')

		handleInputChange('key', cleanedValue)
	}

	const handleSlugChange = (value) => {
		// Faqat kichik harflar, raqamlar, chiziqcha va slash ga ruxsat berish
		const cleanedValue = value
			.toLowerCase()
			.replace(/[^a-z0-9\/_-]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-+|-+$/g, '')

		handleInputChange('slug', cleanedValue)
	}

	const selectIcon = (icon) => {
		handleInputChange('icon', icon)
	}

	// Type tanlanganda avtomatik icon o'rnatish
	const handleTypeChange = (value) => {
		const selectedOption = typeOptions.find(option => option.value === value)
		if (selectedOption && !formData.icon) {
			handleInputChange('icon', selectedOption.icon)
		}
		handleInputChange('type', value)
	}

	return (
		<div className="p-6">
			{/* Sarlavha */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-bold text-gray-800">
						{isEditing ? 'Navigatsiyani Yangilash' : 'Yangi Navigatsiya Qo\'shish'}
					</h1>
					{isEditing && (
						<span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
							ID: {id}
						</span>
					)}
				</div>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* O'zbekcha sarlavha */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Sarlavha (O'zbekcha) *
						</label>
						<input
							type="text"
							value={formData.title.uz}
							onChange={(e) => handleTitleChange('uz', e.target.value)}
							className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
							placeholder={formData.type === 'leader' ? 'Rahbariyat' :
								formData.type === 'communication' ? 'Aloqa' :
									'Biz haqimizda'}
							disabled={loading}
						/>
					</div>

					{/* Inglizcha sarlavha */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Sarlavha (Inglizcha) *
						</label>
						<input
							type="text"
							value={formData.title.en}
							onChange={(e) => handleInputChange('title.en', e.target.value)}
							className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
							placeholder={formData.type === 'leader' ? 'Leadership' :
								formData.type === 'communication' ? 'Contact' :
									'About Us'}
							disabled={loading}
						/>
					</div>

					{/* Ruscha sarlavha */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Sarlavha (Ruscha) *
						</label>
						<input
							type="text"
							value={formData.title.ru}
							onChange={(e) => handleInputChange('title.ru', e.target.value)}
							className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
							placeholder={formData.type === 'leader' ? 'Руководство' :
								formData.type === 'communication' ? 'Контакты' :
									'О нас'}
							disabled={loading}
						/>
					</div>

					{/* Slug */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Slug *
						</label>
						<div className="flex items-center">
							<input
								type="text"
								value={formData.slug}
								onChange={(e) => handleSlugChange(e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
								placeholder={formData.type === 'leader' ? '/leadership' :
									formData.type === 'communication' ? '/contact' :
										'/about-us'}
								disabled={loading || isEditing}
							/>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							URL manzili, masalan: {formData.type === 'leader' ? '/leadership' :
								formData.type === 'communication' ? '/contact' :
									'/about-us'}
							{isEditing && <span className="text-orange-500 ml-1">(Yangilashda o'zgarmaydi)</span>}
						</p>
					</div>

					{/* Key */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Kalit so'z (Key) *
						</label>
						<input
							type="text"
							value={formData.key}
							onChange={(e) => handleKeyChange(e.target.value)}
							className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
							placeholder={formData.type === 'leader' ? 'leadership' :
								formData.type === 'communication' ? 'contact' :
									'about'}
							disabled={loading || isEditing}
						/>
						<p className="text-xs text-gray-500 mt-1">
							Unikal kalit so'z (faqat kichik harflar, raqamlar va _)
							{isEditing && <span className="text-orange-500 ml-1">(Yangilashda o'zgarmaydi)</span>}
						</p>
					</div>

					{/* Type */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Turi *
						</label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
							{typeOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => !loading && handleTypeChange(option.value)}
									disabled={loading}
									className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${formData.type === option.value
										? 'border-blue-500 bg-blue-50 text-blue-700'
										: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
										} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
								>
									<span className="text-lg">{option.icon}</span>
									<span className="text-sm">{option.label}</span>
								</button>
							))}
						</div>
						<select
							value={formData.type}
							onChange={(e) => handleTypeChange(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={loading}
						>
							{typeOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<p className="text-xs text-gray-500 mt-1">
							{formData.type === 'leader' ? 'Rahbariyat sahifasi uchun' :
								formData.type === 'communication' ? 'Aloqa sahifasi uchun' :
									'Sahifa turini tanlang'}
						</p>
					</div>

					{/* Icon */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Icon
						</label>

						{/* Icon tanlash */}
						<div className="mb-3">
							<div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
								{icons.map((icon, index) => (
									<button
										key={index}
										type="button"
										onClick={() => !loading && selectIcon(icon)}
										disabled={loading}
										className={`w-10 h-10 flex items-center justify-center text-lg rounded border-2 transition-all hover:scale-110 ${formData.icon === icon
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-300 bg-white hover:border-gray-400'
											} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
									>
										{icon}
									</button>
								))}
							</div>
						</div>

						{/* Qo'lda icon kiritish */}
						<div>
							<label className="block text-xs text-gray-500 mb-1">
								Yoki qo'lda kiriting:
							</label>
							<input
								type="text"
								value={formData.icon}
								onChange={(e) => handleInputChange('icon', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder={formData.type === 'leader' ? '👥' :
									formData.type === 'communication' ? '📞' :
										'🏠'}
								maxLength="2"
								disabled={loading}
							/>
						</div>
					</div>

					{/* Order */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tartib raqami
						</label>
						<input
							type="number"
							value={formData.order}
							onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
							className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							min="0"
							disabled={loading}
						/>
					</div>

					{/* Status */}
					<div className="flex items-center">
						<input
							type="checkbox"
							id="isActive"
							checked={formData.isActive}
							onChange={(e) => handleInputChange('isActive', e.target.checked)}
							className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
							disabled={loading}
						/>
						<label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
							Faol
						</label>
					</div>

					{/* Type haqida qo'shimcha ma'lumot */}
					<div className="md:col-span-2">
						<div className={`p-3 rounded-lg ${formData.type === 'leader' ? 'bg-blue-50 border border-blue-200' :
							formData.type === 'communication' ? 'bg-green-50 border border-green-200' :
								'bg-gray-50 border border-gray-200'}`}>
							<h4 className="font-medium mb-1">
								{formData.type === 'leader' ? 'Rahbariyat sahifasi:' :
									formData.type === 'communication' ? 'Aloqa sahifasi:' :
										formData.type === 'gallery' ? 'Galereya sahifasi:' :
											formData.type === 'news' ? 'Yangiliklar sahifasi:' :
												formData.type === 'documents' ? 'Hujjatlar sahifasi:' :
													'Static sahifa:'}
							</h4>
							<p className="text-sm text-gray-600">
								{formData.type === 'leader' ? 'Rahbarlar haqida ma\'lumotlar (FIO, lavozim, telefon, email, manzil, ish vaqti, vazifalar, biografiya)' :
									formData.type === 'communication' ? 'Aloqa ma\'lumotlari (manzil, telefon, email, xaritada joylashuv)' :
										formData.type === 'gallery' ? 'Rasm va videolar galereyasi' :
											formData.type === 'news' ? 'Yangiliklar ro\'yxati' :
												formData.type === 'documents' ? 'Hujjatlar va fayllar' :
													'Oddiy matnli sahifa'}
							</p>
						</div>
					</div>
				</div>

				{/* Submit button */}
				<div className="mt-6 flex justify-end space-x-3">
					<button
						type="button"
						onClick={() => navigate('/admin/main-navigation/list')}
						className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={loading}
					>
						Bekor qilish
					</button>
					<button
						type="submit"
						disabled={loading}
						className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Save size={20} />
						{loading
							? (isEditing ? 'Yangilanmoqda...' : 'Saqlanmoqda...')
							: (isEditing ? 'Yangilash' : 'Saqlash')
						}
					</button>
				</div>
			</form>
		</div>
	)
}

export default MainNavigationAdd
import axios from 'axios'
import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_BASE_URL

const AdditionalNavigationAdd = () => {
	const navigate = useNavigate()
	const { id } = useParams()
	const [loading, setLoading] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [parentPages, setParentPages] = useState([])
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
		parent: null // Parent ID - asosiy navigatsiyalardan birini tanlash uchun
	})

	// Iconlar ro'yxati
	const icons = [
		'🏠', 'ℹ', '📊', '🏃‍♂️', '📰', '🖼️', '📄', '🔗', '🧭', '⭐',
		'📸', '📅', '⚙️', '❓', '🈸', '📍', '📢', '🎯', '💼', '👥',
		'🌐', '📱', '💻', '🔒', '📈', '💰', '🏢', '📞', '✉️', '🔍'
	]

	// Asosiy navigatsiyalarni olish (parent lar uchun)
	useEffect(() => {
		fetchParentPages()
	}, [])

	// Agar ID mavjud bo'lsa, ma'lumotlarni yuklash
	useEffect(() => {
		if (id) {
			setIsEditing(true)
			fetchPageData(id)
		}
	}, [id])

	// Asosiy navigatsiyalarni olish
	const fetchParentPages = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/api/pages/getMain`)
			if (response.data.success) {
				setParentPages(response.data.pages)
			}
		} catch (error) {
			console.error('Asosiy navigatsiyalarni olishda xatolik:', error)
			alert('Asosiy navigatsiyalarni yuklashda xatolik yuz berdi')
		}
	}

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
				navigate('/admin/additional-navigation/list')
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Ma\'lumotlarni yuklashda xatolik yuz berdi')
			navigate('/admin/additional-navigation/list')
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
					? 'Qo\'shimcha navigatsiya muvaffaqiyatli yangilandi!'
					: 'Qo\'shimcha navigatsiya muvaffaqiyatli qo\'shildi!'
				alert(message)
				navigate('/admin/additional-navigation/list')
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			const message = isEditing
				? 'Qo\'shimcha navigatsiyani yangilashda xatolik yuz berdi: '
				: 'Qo\'shimcha navigatsiya qo\'shishda xatolik yuz berdi: '
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

	const handleParentChange = (parentId) => {
		// Agar "Asosiy navigatsiya" tanlansa, null qilish
		const parentValue = parentId === '' ? null : parentId
		handleInputChange('parent', parentValue)
	}

	return (
		<div className="p-6">
			{/* Sarlavha */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-bold text-gray-800">
						{isEditing ? 'Qo\'shimcha Navigatsiyani Yangilash' : 'Yangi Qo\'shimcha Navigatsiya Qo\'shish'}
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
					{/* Asosiy Navigatsiya (Parent) */}
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Asosiy Navigatsiya *
						</label>
						<select
							value={formData.parent || ''}
							onChange={(e) => handleParentChange(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
							disabled={loading}
						>
							<option value="">Asosiy navigatsiyani tanlang</option>
							{parentPages.map((page) => (
								<option key={page._id} value={page._id}>
									{page.icon} {page.title.uz} ({page.slug})
								</option>
							))}
						</select>
						<p className="text-xs text-gray-500 mt-1">
							Ushbu qo'shimcha navigatsiya qaysi asosiy navigatsiya ostida bo'lishini tanlang
						</p>
					</div>

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
							placeholder="Bizning jamoa"
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
							placeholder="Our Team"
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
							placeholder="Наша команда"
							disabled={loading}
						/>
					</div>

					{/* Slug */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Slug *
						</label>
						<div className="flex items-center">
							<span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-500">
								/
							</span>
							<input
								type="text"
								value={formData.slug}
								onChange={(e) => handleSlugChange(e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								required
								placeholder="our-team"
								disabled={loading || isEditing}
							/>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							URL manzili, masalan: our-team
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
							placeholder="our_team"
							disabled={loading || isEditing}
						/>
						<p className="text-xs text-gray-500 mt-1">
							Unikal kalit so'z (faqat kichik harflar, raqamlar va _)
							{isEditing && <span className="text-orange-500 ml-1">(Yangilashda o'zgarmaydi)</span>}
						</p>
					</div>

					{/* Icon */}
					<div className="md:col-span-2">
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
								placeholder="👥 yoki ℹ"
								maxLength="2"
								disabled={loading}
							/>
						</div>
					</div>

					{/* Type */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Turi *
						</label>
						<select
							value={formData.type}
							onChange={(e) => handleInputChange('type', e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							disabled={loading}
						>
							<option value="static">Static sahifa</option>
							<option value="news">Yangiliklar</option>
							<option value="gallery">Galereya</option>
							<option value="documents">Hujjatlar</option>
						</select>
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
				</div>

				{/* Submit button */}
				<div className="mt-6 flex justify-end space-x-3">
					<button
						type="button"
						onClick={() => navigate('/admin/additional-navigation/list')}
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

export default AdditionalNavigationAdd
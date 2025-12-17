import axios from 'axios'
import {
	Briefcase,
	Clock,
	Edit,
	Mail, MapPin,
	Phone,
	Plus,
	Save,
	Search,
	Trash2,
	Upload,
	User,
	X
} from 'lucide-react'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const LeaderContent = ({ page, showForm, onShowFormChange }) => {
	// State'lar
	const [contents, setContents] = useState([])
	const [filteredContents, setFilteredContents] = useState([])
	const [loading, setLoading] = useState(false)
	const [contentLoading, setContentLoading] = useState(false)
	const [editingContent, setEditingContent] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedPhoto, setSelectedPhoto] = useState(null)
	const [photoPreview, setPhotoPreview] = useState(null)
	const [removedPhotos, setRemovedPhotos] = useState([])

	// Form ma'lumotlari
	const [formData, setFormData] = useState({
		fullName_uz: '',
		fullName_ru: '',
		fullName_en: '',
		position_uz: '',
		position_ru: '',
		position_en: '',
		phone: '',
		email: '',
		address_uz: '',
		address_ru: '',
		address_en: '',
		working_hours_uz: '',
		working_hours_ru: '',
		working_hours_en: '',
		task_uz: '',
		task_ru: '',
		task_en: '',
		biography_uz: '',
		biography_ru: '',
		biography_en: '',
	})

	// API funksiyalari
	const fetchContents = async () => {
		if (!page) return

		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/generalleader/getAll/${page.key}`)
			if (response.data.success) {
				setContents(response.data.leaders || [])
				setFilteredContents(response.data.leaders || [])
			} else {
				setContents([])
				setFilteredContents([])
			}
		} catch (error) {
			console.error('Rahbarlarni yuklashda xatolik:', error)
			setContents([])
			setFilteredContents([])
		} finally {
			setLoading(false)
		}
	}

	const handleAddNew = () => {
		setEditingContent(null)
		resetForm()
		onShowFormChange(true)
	}

	const handleEditContent = (content) => {
		setEditingContent(content)

		// Form ma'lumotlarini to'ldirish
		setFormData({
			fullName_uz: content.fullName_uz || '',
			fullName_ru: content.fullName_ru || '',
			fullName_en: content.fullName_en || '',
			position_uz: content.position_uz || '',
			position_ru: content.position_ru || '',
			position_en: content.position_en || '',
			phone: content.phone || '',
			email: content.email || '',
			address_uz: content.address_uz || '',
			address_ru: content.address_ru || '',
			address_en: content.address_en || '',
			working_hours_uz: content.working_hours_uz || '',
			working_hours_ru: content.working_hours_ru || '',
			working_hours_en: content.working_hours_en || '',
			task_uz: content.task_uz || '',
			task_ru: content.task_ru || '',
			task_en: content.task_en || '',
			biography_uz: content.biography_uz || '',
			biography_ru: content.biography_ru || '',
			biography_en: content.biography_en || '',
		})

		// Rasm preview'ni o'rnatish
		if (content.photo) {
			setPhotoPreview(`${BASE_URL}${content.photo}`)
		} else {
			setPhotoPreview(null)
		}

		setSelectedPhoto(null)
		setRemovedPhotos([])
		onShowFormChange(true)
	}

	const handleDeleteContent = async (contentId, content) => {
		const title = content.fullName_uz || 'Nomsiz rahbar'
		if (window.confirm(`"${title}" rahbarini o'chirishni istaysizmi?`)) {
			try {
				const response = await axios.delete(`${BASE_URL}/api/generalleader/delete/${contentId}`)
				if (response.data.success) {
					alert('Rahbar muvaffaqiyatli o\'chirildi!')
					fetchContents()
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert('Rahbarni o\'chirishda xatolik yuz berdi')
			}
		}
	}

	// Form funksiyalari
	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	const handlePhotoChange = (e) => {
		const file = e.target.files[0]
		if (!file) return

		// Eski preview'ni tozalash
		if (photoPreview && photoPreview.startsWith('blob:')) {
			URL.revokeObjectURL(photoPreview)
		}

		setSelectedPhoto(file)
		setPhotoPreview(URL.createObjectURL(file))
		e.target.value = ''
	}

	const removePhoto = () => {
		// Agar mavjud rasm bo'lsa, removedPhotos ga qo'shamiz
		if (photoPreview && photoPreview.startsWith(BASE_URL)) {
			const photoPath = photoPreview.replace(BASE_URL, '')
			setRemovedPhotos(prev => [...prev, photoPath])
		}

		// Preview'ni tozalash
		if (photoPreview && photoPreview.startsWith('blob:')) {
			URL.revokeObjectURL(photoPreview)
		}

		setPhotoPreview(null)
		setSelectedPhoto(null)
	}

	const resetForm = () => {
		setFormData({
			fullName_uz: '',
			fullName_ru: '',
			fullName_en: '',
			position_uz: '',
			position_ru: '',
			position_en: '',
			phone: '',
			email: '',
			address_uz: '',
			address_ru: '',
			address_en: '',
			working_hours_uz: '',
			working_hours_ru: '',
			working_hours_en: '',
			task_uz: '',
			task_ru: '',
			task_en: '',
			biography_uz: '',
			biography_ru: '',
			biography_en: '',
		})
		setSelectedPhoto(null)
		setPhotoPreview(null)
		setRemovedPhotos([])
	}

	const closeModal = () => {
		onShowFormChange(false)
		setEditingContent(null)
		resetForm()
	}

	// Submit funksiyasi
	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!page) {
			alert('Iltimos, sahifa tanlanganligini tekshiring!')
			return
		}

		// Validatsiya
		if (!formData.fullName_uz.trim()) {
			alert('O\'zbekcha ism-sharifni kiriting!')
			return
		}

		if (!formData.position_uz.trim()) {
			alert('O\'zbekcha lavozimni kiriting!')
			return
		}

		try {
			setContentLoading(true)

			// FormData yaratish
			const submitData = new FormData()

			// Asosiy ma'lumotlar
			submitData.append('fullName_uz', formData.fullName_uz)
			submitData.append('fullName_ru', formData.fullName_ru)
			submitData.append('fullName_en', formData.fullName_en)
			submitData.append('position_uz', formData.position_uz)
			submitData.append('position_ru', formData.position_ru)
			submitData.append('position_en', formData.position_en)

			// Aloqa ma'lumotlari
			submitData.append('phone', formData.phone)
			submitData.append('email', formData.email)
			submitData.append('address_uz', formData.address_uz)
			submitData.append('address_ru', formData.address_ru)
			submitData.append('address_en', formData.address_en)
			submitData.append('working_hours_uz', formData.working_hours_uz)
			submitData.append('working_hours_ru', formData.working_hours_ru)
			submitData.append('working_hours_en', formData.working_hours_en)

			// Vazifalar va biografiya
			submitData.append('task_uz', formData.task_uz)
			submitData.append('task_ru', formData.task_ru)
			submitData.append('task_en', formData.task_en)
			submitData.append('biography_uz', formData.biography_uz)
			submitData.append('biography_ru', formData.biography_ru)
			submitData.append('biography_en', formData.biography_en)

			// Sahifa va sarlavha ma'lumotlari
			submitData.append('key', page.key)
			submitData.append('title_uz', formData.fullName_uz)
			submitData.append('title_ru', formData.fullName_ru)
			submitData.append('title_en', formData.fullName_en)

			// Rasm
			if (selectedPhoto) {
				submitData.append('photo', selectedPhoto)
			}

			// O'chirilgan rasmlar
			if (editingContent && removedPhotos.length > 0) {
				removedPhotos.forEach(photoPath => {
					submitData.append('removedPhotos', photoPath)
				})
			}

			// API endpoint va method
			const endpoint = editingContent
				? `${BASE_URL}/api/generalleader/update/${editingContent._id}`
				: `${BASE_URL}/api/generalleader/create`

			const config = {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}

			const response = editingContent
				? await axios.put(endpoint, submitData, config)
				: await axios.post(endpoint, submitData, config)

			if (response.data.success) {
				const message = editingContent
					? 'Rahbar muvaffaqiyatli yangilandi!'
					: 'Rahbar muvaffaqiyatli qo\'shildi!'
				alert(message)
				closeModal()
				fetchContents()
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Rahbarni saqlashda xatolik yuz berdi: ' + (error.response?.data?.message || error.message))
		} finally {
			setContentLoading(false)
		}
	}

	// Qidiruv
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredContents(contents)
		} else {
			const filtered = contents.filter(item =>
				(item.fullName_uz && item.fullName_uz.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.fullName_ru && item.fullName_ru.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.fullName_en && item.fullName_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.position_uz && item.position_uz.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.position_ru && item.position_ru.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.position_en && item.position_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.phone && item.phone.includes(searchTerm)) ||
				(item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()))
			)
			setFilteredContents(filtered)
		}
	}, [searchTerm, contents])

	// Komponent yuklanganda ma'lumotlarni olish
	useEffect(() => {
		if (page) {
			fetchContents()
		}
	}, [page])

	// Rahbar kartasini render qilish
	const renderLeaderCard = (content) => {
		return (
			<div key={content._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
				<div className="flex gap-4">
					{/* Rasm qismi */}
					<div className="flex-shrink-0">
						{content.photo ? (
							<img
								src={`${BASE_URL}${content.photo}`}
								alt={content.fullName_uz}
								className="w-24 h-24 object-cover rounded-lg border-2 border-blue-100"
							/>
						) : (
							<div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
								<User className="w-12 h-12 text-blue-400" />
							</div>
						)}
					</div>

					{/* Ma'lumotlar qismi */}
					<div className="flex-1">
						<div className="flex justify-between items-start">
							<div>
								<h4 className="font-bold text-gray-800 text-lg mb-1">
									{content.fullName_uz || 'Nomsiz'}
								</h4>
								<p className="text-blue-600 font-medium mb-2">
									{content.position_uz || 'Lavozim ko\'rsatilmagan'}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<button
									onClick={() => handleEditContent(content)}
									className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
									title="Tahrirlash"
								>
									<Edit size={16} />
								</button>
								<button
									onClick={() => handleDeleteContent(content._id, content)}
									className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
									title="O'chirish"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>

						{/* Aloqa ma'lumotlari */}
						<div className="space-y-1 text-sm text-gray-600 mb-3">
							{content.phone && (
								<div className="flex items-center gap-2">
									<Phone size={14} />
									<span>{content.phone}</span>
								</div>
							)}
							{content.email && (
								<div className="flex items-center gap-2">
									<Mail size={14} />
									<span>{content.email}</span>
								</div>
							)}
							{content.address_uz && (
								<div className="flex items-center gap-2">
									<MapPin size={14} />
									<span className="line-clamp-1">{content.address_uz}</span>
								</div>
							)}
							{content.working_hours_uz && (
								<div className="flex items-center gap-2">
									<Clock size={14} />
									<span>{content.working_hours_uz}</span>
								</div>
							)}
						</div>

						{/* Qisqa biografiya */}
						{content.biography_uz && (
							<div className="mt-3 pt-3 border-t border-gray-100">
								<p className="text-sm text-gray-600 line-clamp-2">
									{content.biography_uz.length > 100
										? `${content.biography_uz.substring(0, 100)}...`
										: content.biography_uz}
								</p>
							</div>
						)}

						{/* Sana ma'lumotlari */}
						<div className="mt-3 pt-3 border-t border-gray-100">
							<div className="flex items-center gap-2 text-xs text-gray-500">
								<span>Yaratilgan: {new Date(content.createdAt).toLocaleDateString()}</span>
								<span>•</span>
								<span>Yangilangan: {new Date(content.updatedAt).toLocaleDateString()}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Sarlavha va qidiruv */}
			<div className="bg-white rounded-xl shadow-lg p-6">
				<div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<span className="text-2xl">{page.icon}</span>
						<div>
							<h3 className="text-xl font-bold text-gray-800">{page.title.uz}</h3>
							<p className="text-gray-600">{page.slug} • Rahbariyat</p>
						</div>
					</div>
					<button
						onClick={handleAddNew}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<Plus size={20} />
						Yangi Rahbar
					</button>
				</div>

				{/* Qidiruv paneli */}
				<div className="relative">
					<Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
					<input
						type="text"
						placeholder="Rahbarlarni qidirish (FIO, lavozim, telefon, email)..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* Kontentlar ro'yxati */}
			<div className="bg-white rounded-xl shadow-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-gray-800">Mavjud Rahbarlar</h3>
					<span className="text-sm text-gray-600">
						{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredContents.length} ta` : `Jami: ${filteredContents.length} ta`}
					</span>
				</div>

				{loading ? (
					<div className="animate-pulse space-y-3">
						{[1, 2, 3].map(i => (
							<div key={i} className="h-32 bg-gray-200 rounded"></div>
						))}
					</div>
				) : filteredContents.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-gray-600 mb-2">Rahbarlar topilmadi</h3>
						<p className="text-gray-500 text-sm mb-4">
							{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi rahbarni yarating"}
						</p>
						{!searchTerm && (
							<button
								onClick={handleAddNew}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
							>
								Yangi Rahbar
							</button>
						)}
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{filteredContents.map(renderLeaderCard)}
					</div>
				)}
			</div>

			{/* Modal forma */}
			{showForm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal sarlavhasi */}
						<div className="bg-blue-600 text-white p-6 rounded-t-xl">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-bold">
									{editingContent ? 'Rahbarni Yangilash' : 'Yangi Rahbar Qo\'shish'}
								</h3>
								<button
									onClick={closeModal}
									className="text-white hover:text-gray-200 p-1 rounded"
								>
									<X size={24} />
								</button>
							</div>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="p-6 space-y-8">
							{/* 1. Rasm qismi */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
									Rahbar Rasmi
								</h3>
								{photoPreview ? (
									<div className="flex items-start gap-6">
										<div className="relative">
											<img
												src={photoPreview}
												alt="Rahbar rasmi"
												className="w-48 h-48 object-cover rounded-lg border-2 border-blue-200"
											/>
											<button
												type="button"
												onClick={removePhoto}
												className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
											>
												<X size={16} />
											</button>
										</div>
										<div className="flex-1">
											<p className="text-sm text-gray-600 mb-3">
												Rahbar rasmi. Rasm formati: JPEG, PNG, JPG.
												Rasm o'lchami: 500x500 piksel yoki undan katta.
											</p>
											<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
												<input
													type="file"
													accept="image/*"
													onChange={handlePhotoChange}
													className="hidden"
													id="leader-photo-upload"
												/>
												<label htmlFor="leader-photo-upload" className="cursor-pointer flex flex-col items-center">
													<Upload className="w-8 h-8 text-gray-400 mb-2" />
													<p className="text-gray-600">Rasmni almashtirish</p>
													<p className="text-sm text-gray-500 mt-1">Yangi rasmni tanlang</p>
												</label>
											</div>
										</div>
									</div>
								) : (
									<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
										<input
											type="file"
											accept="image/*"
											onChange={handlePhotoChange}
											className="hidden"
											id="leader-photo-upload"
										/>
										<label htmlFor="leader-photo-upload" className="cursor-pointer flex flex-col items-center">
											<Upload className="w-12 h-12 text-gray-400 mb-4" />
											<p className="text-gray-600 text-lg mb-2">Rasm yuklang</p>
											<p className="text-sm text-gray-500 mb-3">Rahbar uchun rasmini tanlang</p>
											<button
												type="button"
												onClick={() => document.getElementById('leader-photo-upload').click()}
												className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
											>
												Rasm tanlash
											</button>
										</label>
									</div>
								)}
							</div>

							{/* 2. Asosiy ma'lumotlar */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<User size={20} />
									Asosiy Ma'lumotlar
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Familiya Ismi Sharifi (O'zbekcha) *
										</label>
										<input
											type="text"
											value={formData.fullName_uz}
											onChange={(e) => handleInputChange('fullName_uz', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Abdullayev Akmaljon Bahodirovich"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Full Name (English) *
										</label>
										<input
											type="text"
											value={formData.fullName_en}
											onChange={(e) => handleInputChange('fullName_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Abdullayev Akmaljon Bahodirovich"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Фамилия Имя Отчество (Русский) *
										</label>
										<input
											type="text"
											value={formData.fullName_ru}
											onChange={(e) => handleInputChange('fullName_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Абдуллаев Акмалжон Баходирович"
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Lavozimi (O'zbekcha) *
										</label>
										<input
											type="text"
											value={formData.position_uz}
											onChange={(e) => handleInputChange('position_uz', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Direktor"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Position (English) *
										</label>
										<input
											type="text"
											value={formData.position_en}
											onChange={(e) => handleInputChange('position_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Director"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Должность (Русский) *
										</label>
										<input
											type="text"
											value={formData.position_ru}
											onChange={(e) => handleInputChange('position_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Директор"
											required
										/>
									</div>
								</div>
							</div>

							{/* 3. Aloqa ma'lumotlari */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<Phone size={20} />
									Aloqa Ma'lumotlari
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
											<Phone size={16} />
											Telefon raqami *
										</label>
										<input
											type="tel"
											value={formData.phone}
											onChange={(e) => handleInputChange('phone', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="+998901234567"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
											<Mail size={16} />
											Elektron pochta *
										</label>
										<input
											type="email"
											value={formData.email}
											onChange={(e) => handleInputChange('email', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="example@mail.uz"
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Manzil (O'zbekcha)
										</label>
										<textarea
											value={formData.address_uz}
											onChange={(e) => handleInputChange('address_uz', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="3"
											placeholder="Toshkent shahri, Amir Temur ko'chasi"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Address (English)
										</label>
										<textarea
											value={formData.address_en}
											onChange={(e) => handleInputChange('address_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="3"
											placeholder="Tashkent city, Amir Temur street"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Адрес (Русский)
										</label>
										<textarea
											value={formData.address_ru}
											onChange={(e) => handleInputChange('address_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="3"
											placeholder="г. Ташкент, улица Амира Темура"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Ish vaqti (O'zbekcha)
										</label>
										<input
											type="text"
											value={formData.working_hours_uz}
											onChange={(e) => handleInputChange('working_hours_uz', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500"
											placeholder="Dushanba - Juma, 09:00 - 18:00"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Working Hours (English)
										</label>
										<input
											type="text"
											value={formData.working_hours_en}
											onChange={(e) => handleInputChange('working_hours_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Monday - Friday, 09:00 - 18:00"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Рабочее время (Русский)
										</label>
										<input
											type="text"
											value={formData.working_hours_ru}
											onChange={(e) => handleInputChange('working_hours_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Понедельник - Пятница, 09:00 - 18:00"
										/>
									</div>
								</div>
							</div>

							{/* 4. Vazifalar va Biografiya */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<Briefcase size={20} />
									Vazifalar va Biografiya
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Vazifalari (O'zbekcha)
										</label>
										<textarea
											value={formData.task_uz}
											onChange={(e) => handleInputChange('task_uz', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="5"
											placeholder="Boshqaruv faoliyati, qabul qilish, mas'uliyatlar..."
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Responsibilities (English)
										</label>
										<textarea
											value={formData.task_en}
											onChange={(e) => handleInputChange('task_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="5"
											placeholder="Management activities, receptions, responsibilities..."
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Обязанности (Русский)
										</label>
										<textarea
											value={formData.task_ru}
											onChange={(e) => handleInputChange('task_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="5"
											placeholder="Управленческая деятельность, приемы, обязанности..."
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Biografiya (O'zbekcha)
										</label>
										<textarea
											value={formData.biography_uz}
											onChange={(e) => handleInputChange('biography_uz', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="6"
											placeholder="Tug'ilgan yili, ta'lim, ish tajribasi..."
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Biography (English)
										</label>
										<textarea
											value={formData.biography_en}
											onChange={(e) => handleInputChange('biography_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="6"
											placeholder="Year of birth, education, work experience..."
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Биография (Русский)
										</label>
										<textarea
											value={formData.biography_ru}
											onChange={(e) => handleInputChange('biography_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											rows="6"
											placeholder="Год рождения, образование, трудовой стаж..."
										/>
									</div>
								</div>
							</div>

							{/* Tugmalar */}
							<div className="flex space-x-3 pt-4 border-t">
								<button
									type="button"
									onClick={closeModal}
									className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg"
								>
									Bekor qilish
								</button>
								<button
									type="submit"
									disabled={contentLoading}
									className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center"
								>
									{contentLoading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Yuklanmoqda...
										</>
									) : (
										<>
											<Save size={20} className="mr-2" />
											{editingContent ? 'Yangilash' : 'Saqlash'}
										</>
									)}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default LeaderContent
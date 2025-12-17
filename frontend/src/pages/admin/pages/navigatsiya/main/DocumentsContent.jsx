import { Editor } from '@tinymce/tinymce-react'
import axios from 'axios'
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Download,
	Edit,
	Eye,
	FileImage,
	Globe,
	Image,
	Plus,
	Save,
	Search,
	Trash2,
	Upload,
	X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const DocumentsContent = ({ page, showForm, onShowFormChange }) => {
	// State'lar
	const [contents, setContents] = useState([])
	const [filteredContents, setFilteredContents] = useState([])
	const [loading, setLoading] = useState(false)
	const [contentLoading, setContentLoading] = useState(false)
	const [editingContent, setEditingContent] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedImages, setSelectedImages] = useState([])
	const [imagePreviews, setImagePreviews] = useState([])
	const [removedImages, setRemovedImages] = useState([])
	const [viewingContent, setViewingContent] = useState(null)
	const [currentImageIndex, setCurrentImageIndex] = useState(0)

	// Form ma'lumotlari
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		description_uz: '',
		description_ru: '',
		description_en: '',
	})

	// TinyMCE editor ref'lari
	const editorRefUz = useRef(null)
	const editorRefRu = useRef(null)
	const editorRefEn = useRef(null)

	// TinyMCE konfiguratsiyasi
	const editorConfig = {
		height: 300,
		menubar: 'file edit view insert format tools table help',
		plugins: [
			'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
			'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
			'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
			'emoticons', 'quickbars', 'codesample', 'directionality'
		],
		toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
			'fontfamily fontsize blocks | forecolor backcolor | ' +
			'alignleft aligncenter alignright alignjustify | ' +
			'bullist numlist outdent indent | link image media | ' +
			'table emoticons codesample | removeformat | code | fullscreen | help',
		content_style: `
      body { 
        font-family: 'Arial', sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #000000;
        margin: 0;
        padding: 8px;
      }
      p { margin-bottom: 1em; line-height: 1.6; }
      img { 
        max-width: 100%; 
        height: auto;
        border-radius: 4px;
      }
    `,
		images_upload_handler: async (blobInfo) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => {
					resolve(reader.result)
				}
				reader.onerror = () => {
					reject('Rasm yuklashda xatolik')
				}
				reader.readAsDataURL(blobInfo.blob())
			})
		},
	}

	// API funksiyalari
	const fetchContents = async () => {
		if (!page) return

		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/generalannouncement/getAll/${page.key}`)
			if (response.data.success) {
				setContents(response.data.announcements || [])
				setFilteredContents(response.data.announcements || [])
			} else {
				setContents([])
				setFilteredContents([])
			}
		} catch (error) {
			console.error('Hujjatlarni yuklashda xatolik:', error)
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
			title_uz: content.title_uz || '',
			title_ru: content.title_ru || '',
			title_en: content.title_en || '',
			description_uz: content.description_uz || '',
			description_ru: content.description_ru || '',
			description_en: content.description_en || '',
		})

		// Rasm previewlarni o'rnatish
		if (content.photos && content.photos.length > 0) {
			const existingPreviews = content.photos.map(photo => ({
				type: 'image',
				url: `${BASE_URL}${photo}`,
				name: typeof photo === 'string' ? photo.split('/').pop() : photo,
				isExisting: true
			}))
			setImagePreviews(existingPreviews)
		} else {
			setImagePreviews([])
		}

		setSelectedImages([])
		setRemovedImages([])
		onShowFormChange(true)
	}

	const handleDeleteContent = async (contentId, content) => {
		const title = content.title_uz || 'Nomsiz hujjat'
		if (window.confirm(`"${title}" hujjatini o'chirishni istaysizmi?`)) {
			try {
				const response = await axios.delete(`${BASE_URL}/api/generalannouncement/delete/${contentId}`)
				if (response.data.success) {
					alert('Hujjat muvaffaqiyatli o\'chirildi!')
					fetchContents()
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert('Hujjatni o\'chirishda xatolik yuz berdi')
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

	const handleEditorChange = (content, language) => {
		setFormData(prev => ({
			...prev,
			[`description_${language}`]: content
		}))
	}

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files)

		// Faqat rasm fayllarini filter qilish
		const imageFiles = files.filter(file =>
			file.type.startsWith('image/') &&
			['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
		)

		if (imageFiles.length === 0) {
			alert('Iltimos, faqat rasm fayllarini tanlang (JPG, PNG, GIF, WEBP)')
			e.target.value = ''
			return
		}

		const newSelectedImages = [...selectedImages, ...imageFiles]
		setSelectedImages(newSelectedImages)

		// Preview yaratish
		const newPreviews = imageFiles.map(file => ({
			type: 'image',
			url: URL.createObjectURL(file),
			name: file.name,
			size: file.size,
			isExisting: false
		}))

		setImagePreviews(prev => [...prev, ...newPreviews])
		e.target.value = ''
	}

	const removeImagePreview = (index) => {
		const newPreviews = [...imagePreviews]
		const removedPreview = newPreviews.splice(index, 1)[0]

		// Blob URL'ni tozalash
		if (!removedPreview.isExisting && removedPreview.url.startsWith('blob:')) {
			URL.revokeObjectURL(removedPreview.url)
		}

		// Agar mavjud rasm bo'lsa, removedImages ga qo'shamiz
		if (removedPreview.isExisting) {
			const imagePath = removedPreview.url.replace(BASE_URL, '')
			setRemovedImages(prev => [...prev, imagePath])
		}

		// SelectedImages'dan ham o'chirish
		const newImages = [...selectedImages]
		if (!removedPreview.isExisting) {
			newImages.splice(index, 1)
		}
		setSelectedImages(newImages)

		setImagePreviews(newPreviews)
	}

	const resetForm = () => {
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			description_uz: '',
			description_ru: '',
			description_en: '',
		})
		setSelectedImages([])
		setImagePreviews([])
		setRemovedImages([])
	}

	const closeModal = () => {
		onShowFormChange(false)
		setEditingContent(null)
		resetForm()
	}

	// HTML taglarini olib tashlash
	const stripHtml = (html) => {
		if (!html) return ''
		const tmp = document.createElement("DIV")
		tmp.innerHTML = html
		return tmp.textContent || tmp.innerText || ""
	}

	// Rasm ko'rish modalini ochish
	const handleViewImages = (content) => {
		setViewingContent(content)
		setCurrentImageIndex(0)
		document.body.style.overflow = 'hidden'
	}

	// Rasm ko'rish modalini yopish
	const handleCloseViewer = () => {
		setViewingContent(null)
		setCurrentImageIndex(0)
		document.body.style.overflow = 'auto'
	}

	// Keyingi rasmga o'tish
	const handleNextImage = () => {
		if (viewingContent?.photos?.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === viewingContent.photos.length - 1 ? 0 : prev + 1
			)
		}
	}

	// Oldingi rasmga qaytish
	const handlePrevImage = () => {
		if (viewingContent?.photos?.length > 0) {
			setCurrentImageIndex((prev) =>
				prev === 0 ? viewingContent.photos.length - 1 : prev - 1
			)
		}
	}

	// Rasmni yuklab olish
	const handleDownloadImage = (imageUrl, imageName) => {
		const link = document.createElement('a')
		link.href = imageUrl
		link.download = imageName || 'image'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	// ESC tugmasi bilan modalni yopish
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') {
				if (viewingContent) handleCloseViewer()
				if (showForm) closeModal()
			}
			if (viewingContent) {
				if (e.key === 'ArrowRight') handleNextImage()
				if (e.key === 'ArrowLeft') handlePrevImage()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [viewingContent, showForm])

	// Submit funksiyasi
	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!page) {
			alert('Iltimos, sahifa tanlanganligini tekshiring!')
			return
		}

		// Validatsiya
		if (!formData.title_uz.trim()) {
			alert('O\'zbekcha sarlavhani kiriting!')
			return
		}

		try {
			setContentLoading(true)

			// FormData yaratish (faqat rasmlar uchun)
			const submitData = new FormData()

			// Asosiy ma'lumotlar
			submitData.append('title_uz', formData.title_uz)
			submitData.append('title_ru', formData.title_ru)
			submitData.append('title_en', formData.title_en)
			submitData.append('description_uz', formData.description_uz)
			submitData.append('description_ru', formData.description_ru)
			submitData.append('description_en', formData.description_en)
			submitData.append('key', page.key)

			// Yangi rasmlarni qo'shish
			selectedImages.forEach(image => {
				submitData.append('photos', image)
			})

			// O'chirilgan rasmlarni yuborish (faqat tahrirlashda)
			if (editingContent && removedImages.length > 0) {
				removedImages.forEach(imagePath => {
					submitData.append('removedPhotos', imagePath)
				})
			}

			// API endpoint va method
			const endpoint = editingContent
				? `${BASE_URL}/api/generalannouncement/update/${editingContent._id}`
				: `${BASE_URL}/api/generalannouncement/create`

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
					? 'Hujjat muvaffaqiyatli yangilandi!'
					: 'Hujjat muvaffaqiyatli qo\'shildi!'
				alert(message)
				closeModal()
				fetchContents()
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Hujjatni saqlashda xatolik yuz berdi: ' + (error.response?.data?.message || error.message))
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
				(item.title_uz && item.title_uz.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.title_ru && item.title_ru.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.title_en && item.title_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.description_uz && stripHtml(item.description_uz).toLowerCase().includes(searchTerm.toLowerCase()))
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

	// Hujjat kartasini render qilish
	const renderDocumentCard = (content) => {
		const shortDescription = stripHtml(content.description_uz || '')
		const truncatedDescription = shortDescription.length > 100
			? `${shortDescription.substring(0, 100)}...`
			: shortDescription

		return (
			<div key={content._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="flex items-start gap-4">
							{/* Rasm preview qismi */}
							{content.photos && content.photos.length > 0 && (
								<div className="flex-shrink-0">
									<div
										className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
										onClick={() => handleViewImages(content)}
									>
										<img
											src={`${BASE_URL}${content.photos[0]}`}
											alt={content.title_uz}
											className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
											onError={(e) => {
												e.target.src = '/placeholder-image.jpg'
											}}
										/>
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
											<Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
										</div>

										{/* Rasm soni */}
										{content.photos.length > 1 && (
											<div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
												+{content.photos.length - 1}
											</div>
										)}
									</div>
								</div>
							)}

							<div className="flex-1">
								<h4 className="font-bold text-gray-800 text-lg mb-2">
									{content.title_uz || 'Nomsiz hujjat'}
								</h4>

								<div className="flex flex-wrap gap-2 mb-3">
									{content.title_ru && (
										<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
											<Globe size={10} /> RU
										</span>
									)}
									{content.title_en && (
										<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1">
											<Globe size={10} /> EN
										</span>
									)}
									{content.photos && content.photos.length > 0 && (
										<span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1">
											<Image size={10} /> {content.photos.length} rasm
										</span>
									)}
								</div>

								{truncatedDescription && (
									<p className="text-gray-600 text-sm mb-3 leading-relaxed">
										{truncatedDescription}
									</p>
								)}

								{/* Rasm thumbnail'lar */}
								{content.photos && content.photos.length > 1 && (
									<div className="mb-3">
										<div className="grid grid-cols-4 gap-1">
											{content.photos.slice(1, 5).map((photo, index) => (
												<div
													key={index}
													className="aspect-square rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
													onClick={() => {
														setViewingContent(content)
														setCurrentImageIndex(index + 1)
														document.body.style.overflow = 'hidden'
													}}
												>
													<img
														src={`${BASE_URL}${photo}`}
														alt={`${content.title_uz} - ${index + 2}`}
														className="w-full h-full object-cover"
													/>
												</div>
											))}
											{content.photos.length > 5 && (
												<div
													className="aspect-square bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
													onClick={() => handleViewImages(content)}
												>
													<span className="text-gray-600 text-xs">+{content.photos.length - 5}</span>
												</div>
											)}
										</div>
									</div>
								)}

								<div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
									<span className="flex items-center gap-1">
										<Calendar size={10} />
										{new Date(content.createdAt).toLocaleDateString()}
									</span>
									<span>•</span>
									<span>Yangilangan: {new Date(content.updatedAt).toLocaleDateString()}</span>
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center space-x-2 ml-4">
						<button
							onClick={() => handleViewImages(content)}
							className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
							title="Ko'rish"
						>
							<Eye size={16} />
						</button>
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
							<p className="text-gray-600">{page.slug} • Hujjatlar (Rasmlar)</p>
						</div>
					</div>
					<button
						onClick={handleAddNew}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<Plus size={20} />
						Yangi Hujjat
					</button>
				</div>

				{/* Qidiruv paneli */}
				<div className="relative">
					<Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
					<input
						type="text"
						placeholder="Hujjatlarni qidirish (sarlavha, tavsif)..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* Kontentlar ro'yxati */}
			<div className="bg-white rounded-xl shadow-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-gray-800">Mavjud Hujjatlar</h3>
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
						<FileImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-gray-600 mb-2">Hujjatlar topilmadi</h3>
						<p className="text-gray-500 text-sm mb-4">
							{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi hujjatni yarating"}
						</p>
						{!searchTerm && (
							<button
								onClick={handleAddNew}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
							>
								Yangi Hujjat
							</button>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{filteredContents.map(renderDocumentCard)}
					</div>
				)}
			</div>

			{/* Modal forma */}
			{showForm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal sarlavhasi */}
						<div className="bg-blue-600 text-white p-6 rounded-t-xl">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-bold">
									{editingContent ? 'Hujjatni Yangilash' : 'Yangi Hujjat Qo\'shish'}
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
							{/* 1. Sarlavhalar */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
									Hujjat Sarlavhalari
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Sarlavha (O'zbekcha) *
										</label>
										<input
											type="text"
											value={formData.title_uz}
											onChange={(e) => handleInputChange('title_uz', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Hujjat sarlavhasi"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Sarlavha (Inglizcha) *
										</label>
										<input
											type="text"
											value={formData.title_en}
											onChange={(e) => handleInputChange('title_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Document title"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Sarlavha (Ruscha) *
										</label>
										<input
											type="text"
											value={formData.title_ru}
											onChange={(e) => handleInputChange('title_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Название документа"
											required
										/>
									</div>
								</div>
							</div>

							{/* 2. Tavsiflar */}
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
									Hujjat Tavsifi
								</h3>

								{/* O'zbekcha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tavsif (O'zbekcha)
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => editorRefUz.current = editor}
											value={formData.description_uz}
											onEditorChange={(content) => handleEditorChange(content, 'uz')}
											init={editorConfig}
										/>
									</div>
								</div>

								{/* Ruscha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tavsif (Ruscha)
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => editorRefRu.current = editor}
											value={formData.description_ru}
											onEditorChange={(content) => handleEditorChange(content, 'ru')}
											init={editorConfig}
										/>
									</div>
								</div>

								{/* Inglizcha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tavsif (Inglizcha)
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => editorRefEn.current = editor}
											value={formData.description_en}
											onEditorChange={(content) => handleEditorChange(content, 'en')}
											init={editorConfig}
										/>
									</div>
								</div>
							</div>

							{/* 3. Rasmlar */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<Image size={20} />
									Rasmlar
								</h3>

								{imagePreviews.length > 0 && (
									<div className="space-y-3">
										<h4 className="text-sm font-medium text-gray-700">
											Tanlangan rasmlar ({imagePreviews.length} ta):
										</h4>
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{imagePreviews.map((preview, index) => (
												<div key={index} className="group relative rounded-lg overflow-hidden border border-gray-200">
													<div className="aspect-square bg-gray-100">
														<img
															src={preview.url}
															alt={`Preview ${index + 1}`}
															className="w-full h-full object-cover group-hover:scale-105 transition-transform"
														/>
													</div>

													{/* Rasm nomi */}
													<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
														<p className="text-white text-xs truncate">{preview.name}</p>
													</div>

													{/* O'chirish tugmasi */}
													<button
														type="button"
														onClick={() => removeImagePreview(index)}
														className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
														title="O'chirish"
													>
														<X size={12} />
													</button>
												</div>
											))}
										</div>
									</div>
								)}

								<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
									<input
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="hidden"
										id="image-upload"
										multiple
									/>
									<label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
										<Upload className="w-12 h-12 text-gray-400 mb-4" />
										<p className="text-gray-600 text-lg mb-2">Rasmlarni yuklang</p>
										<p className="text-sm text-gray-500 mb-3">
											Rasmlarni tanlang yoki tortib tashlang
										</p>
										<div className="flex items-center justify-center gap-4 text-xs text-gray-500">
											<div className="flex items-center gap-1">
												<Image className="w-4 h-4" />
												<span>JPG, PNG, GIF, WEBP</span>
											</div>
										</div>
										<button
											type="button"
											onClick={() => document.getElementById('image-upload').click()}
											className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
										>
											Rasmlarni tanlash
										</button>
									</label>
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

			{/* Rasm ko'rish modal */}
			{viewingContent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
					<div className="relative w-full max-w-6xl max-h-[95vh]">
						{/* Yopish tugmasi */}
						<button
							onClick={handleCloseViewer}
							className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
						>
							<X size={24} />
						</button>

						{/* Yuklab olish tugmasi */}
						<button
							onClick={() => handleDownloadImage(
								`${BASE_URL}${viewingContent.photos[currentImageIndex]}`,
								`${viewingContent.title_uz || 'image'}-${currentImageIndex + 1}`
							)}
							className="absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all duration-200"
							title="Yuklab olish"
						>
							<Download size={24} />
						</button>

						{/* Asosiy rasm */}
						<div className="relative">
							{/* Oldingi rasm tugmasi */}
							{viewingContent.photos.length > 1 && (
								<button
									onClick={handlePrevImage}
									className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200"
								>
									<ChevronLeft size={24} />
								</button>
							)}

							{/* Rasm */}
							<div className="flex justify-center">
								<img
									src={`${BASE_URL}${viewingContent.photos[currentImageIndex]}`}
									alt={`${viewingContent.title_uz} - ${currentImageIndex + 1}`}
									className="max-w-full max-h-[85vh] object-contain rounded-lg"
									onError={(e) => {
										e.target.src = '/placeholder-image.jpg'
									}}
								/>
							</div>

							{/* Keyingi rasm tugmasi */}
							{viewingContent.photos.length > 1 && (
								<button
									onClick={handleNextImage}
									className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all duration-200"
								>
									<ChevronRight size={24} />
								</button>
							)}
						</div>

						{/* Rasm counter */}
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full">
							{currentImageIndex + 1} / {viewingContent.photos.length}
						</div>

						{/* Thumbnail'lar */}
						{viewingContent.photos.length > 1 && (
							<div className="absolute bottom-20 left-0 right-0 overflow-x-auto py-4">
								<div className="flex justify-center gap-2 px-4">
									{viewingContent.photos.map((photo, index) => (
										<button
											key={index}
											onClick={() => setCurrentImageIndex(index)}
											className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${index === currentImageIndex
													? 'border-blue-500'
													: 'border-transparent'
												} hover:border-blue-300 transition-all`}
										>
											<img
												src={`${BASE_URL}${photo}`}
												alt={`Thumbnail ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										</button>
									))}
								</div>
							</div>
						)}

						{/* Hujjat ma'lumotlari */}
						<div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg max-w-lg text-center">
							<h3 className="font-semibold truncate">{viewingContent.title_uz}</h3>
							<p className="text-sm opacity-80">
								{viewingContent.photos.length} ta rasm
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default DocumentsContent
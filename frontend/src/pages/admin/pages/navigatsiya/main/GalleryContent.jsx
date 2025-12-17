import axios from 'axios'
import {
	Calendar,
	Edit,
	FileImage,
	Globe,
	Grid,
	Image,
	Plus,
	Save,
	Search,
	Trash2,
	Upload,
	Video,
	X
} from 'lucide-react'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const GalleryContent = ({ page, showForm, onShowFormChange }) => {
	// State'lar
	const [contents, setContents] = useState([])
	const [filteredContents, setFilteredContents] = useState([])
	const [loading, setLoading] = useState(false)
	const [contentLoading, setContentLoading] = useState(false)
	const [editingContent, setEditingContent] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedMedia, setSelectedMedia] = useState([])
	const [mediaPreviews, setMediaPreviews] = useState([])
	const [removedMedia, setRemovedMedia] = useState([])

	// Form ma'lumotlari
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
	})

	// Media turini aniqlash
	const getMediaType = (fileName) => {
		if (!fileName) return 'image'

		const extension = fileName.split('.').pop()?.toLowerCase()
		const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
		const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']

		if (videoExtensions.includes(extension)) return 'video'
		if (imageExtensions.includes(extension)) return 'image'

		return 'image'
	}

	// Fayl o'lchamini formatlash
	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	// Media turi bo'yicha icon olish
	const getMediaIcon = (mediaType) => {
		switch (mediaType) {
			case 'video': return <Video className="w-5 h-5 text-red-500" />
			case 'image': return <Image className="w-5 h-5 text-blue-500" />
			default: return <FileImage className="w-5 h-5 text-gray-500" />
		}
	}

	// API funksiyalari
	const fetchContents = async () => {
		if (!page) return

		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/generalgallery/getAll/${page.key}`)
			if (response.data.success) {
				setContents(response.data.gallarys || [])
				setFilteredContents(response.data.gallarys || [])
			} else {
				setContents([])
				setFilteredContents([])
			}
		} catch (error) {
			console.error('Galereya ma\'lumotlarini yuklashda xatolik:', error)
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
		})

		// Media previewlarni o'rnatish
		if (content.photos && content.photos.length > 0) {
			const existingPreviews = content.photos.map(photo => {
				const fileName = typeof photo === 'string' ? photo.split('/').pop() : photo.name
				const mediaType = getMediaType(fileName)
				return {
					type: mediaType,
					url: `${BASE_URL}${photo}`,
					name: fileName,
					isExisting: true,
					size: 0
				}
			})
			setMediaPreviews(existingPreviews)
		} else {
			setMediaPreviews([])
		}

		setSelectedMedia([])
		setRemovedMedia([])
		onShowFormChange(true)
	}

	const handleDeleteContent = async (contentId, content) => {
		const title = content.title_uz || 'Nomsiz galereya'
		if (window.confirm(`"${title}" galereyasini o'chirishni istaysizmi?`)) {
			try {
				const response = await axios.delete(`${BASE_URL}/api/generalgallery/delete/${contentId}`)
				if (response.data.success) {
					alert('Galereya muvaffaqiyatli o\'chirildi!')
					fetchContents()
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert('Galereyani o\'chirishda xatolik yuz berdi')
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

	const handleMediaChange = (e) => {
		const files = Array.from(e.target.files)
		const newSelectedMedia = [...selectedMedia, ...files]
		setSelectedMedia(newSelectedMedia)

		// Preview yaratish
		const newPreviews = files.map(file => {
			const mediaType = getMediaType(file.name)
			return {
				type: mediaType,
				url: URL.createObjectURL(file),
				name: file.name,
				size: file.size,
				isExisting: false
			}
		})

		setMediaPreviews(prev => [...prev, ...newPreviews])
		e.target.value = ''
	}

	const removeMediaPreview = (index) => {
		const newPreviews = [...mediaPreviews]
		const removedPreview = newPreviews.splice(index, 1)[0]

		// Blob URL'ni tozalash
		if (!removedPreview.isExisting && removedPreview.url.startsWith('blob:')) {
			URL.revokeObjectURL(removedPreview.url)
		}

		// Agar mavjud media bo'lsa, removedMedia ga qo'shamiz
		if (removedPreview.isExisting) {
			const mediaPath = removedPreview.url.replace(BASE_URL, '')
			setRemovedMedia(prev => [...prev, mediaPath])
		}

		// SelectedMedia'dan ham o'chirish
		const newMedia = [...selectedMedia]
		if (!removedPreview.isExisting) {
			newMedia.splice(index, 1)
		}
		setSelectedMedia(newMedia)

		setMediaPreviews(newPreviews)
	}

	const resetForm = () => {
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
		})
		setSelectedMedia([])
		setMediaPreviews([])
		setRemovedMedia([])
	}

	const closeModal = () => {
		onShowFormChange(false)
		setEditingContent(null)
		resetForm()
	}

	// Media statistikasini hisoblash
	const getMediaStats = (mediaItems) => {
		const images = mediaItems.filter(item => getMediaType(item) === 'image').length
		const videos = mediaItems.filter(item => getMediaType(item) === 'video').length
		return { images, videos, total: images + videos }
	}

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

		if (mediaPreviews.length === 0) {
			alert('Iltimos, kamida bitta rasm yoki video yuklang!')
			return
		}

		try {
			setContentLoading(true)

			// FormData yaratish (media fayllari uchun)
			const submitData = new FormData()

			// Asosiy ma'lumotlar
			submitData.append('title_uz', formData.title_uz)
			submitData.append('title_ru', formData.title_ru)
			submitData.append('title_en', formData.title_en)
			submitData.append('key', page.key)

			// Yangi media fayllarni qo'shish
			selectedMedia.forEach(media => {
				submitData.append('photos', media)
			})

			// O'chirilgan media'larni yuborish (faqat tahrirlashda)
			if (editingContent && removedMedia.length > 0) {
				removedMedia.forEach(mediaPath => {
					submitData.append('removedPhotos', mediaPath)
				})
			}

			// API endpoint va method
			const endpoint = editingContent
				? `${BASE_URL}/api/generalgallery/update/${editingContent._id}`
				: `${BASE_URL}/api/generalgallery/create`

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
					? 'Galereya muvaffaqiyatli yangilandi!'
					: 'Galereya muvaffaqiyatli qo\'shildi!'
				alert(message)
				closeModal()
				fetchContents()
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Galereyani saqlashda xatolik yuz berdi: ' + (error.response?.data?.message || error.message))
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
				(item.title_en && item.title_en.toLowerCase().includes(searchTerm.toLowerCase()))
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

	// Galereya kartasini render qilish
	const renderGalleryCard = (content) => {
		const mediaStats = getMediaStats(content.photos || [])

		return (
			<div key={content._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="flex items-start gap-4">
							{/* Media preview */}
							{content.photos && content.photos.length > 0 && (
								<div className="flex-shrink-0">
									<div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 group">
										{getMediaType(content.photos[0]) === 'video' ? (
											<>
												<div className="w-full h-full bg-gray-800 flex items-center justify-center">
													<Video className="w-8 h-8 text-white" />
												</div>
												<div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
													VIDEO
												</div>
											</>
										) : (
											<img
												src={`${BASE_URL}${content.photos[0]}`}
												alt={content.title_uz}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
											/>
										)}
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

										{/* Media count badge */}
										<div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
											{mediaStats.total}
										</div>
									</div>
								</div>
							)}

							<div className="flex-1">
								<h4 className="font-bold text-gray-800 text-lg mb-2">
									{content.title_uz || 'Nomsiz galereya'}
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
								</div>

								{/* Media statistikasi */}
								<div className="flex items-center gap-4 mb-3">
									{mediaStats.images > 0 && (
										<div className="flex items-center gap-1 text-sm text-gray-600">
											<Image className="w-4 h-4 text-blue-500" />
											<span>{mediaStats.images} rasm</span>
										</div>
									)}
									{mediaStats.videos > 0 && (
										<div className="flex items-center gap-1 text-sm text-gray-600">
											<Video className="w-4 h-4 text-red-500" />
											<span>{mediaStats.videos} video</span>
										</div>
									)}
								</div>

								{/* Media preview grid (max 4 ta) */}
								{content.photos && content.photos.length > 1 && (
									<div className="mb-3">
										<div className="grid grid-cols-4 gap-1">
											{content.photos.slice(1, 5).map((photo, index) => (
												<div key={index} className="aspect-square rounded overflow-hidden relative">
													{getMediaType(photo) === 'video' ? (
														<div className="w-full h-full bg-gray-800 flex items-center justify-center">
															<Video className="w-3 h-3 text-white" />
														</div>
													) : (
														<img
															src={`${BASE_URL}${photo}`}
															alt={`${content.title_uz} ${index + 2}`}
															className="w-full h-full object-cover"
														/>
													)}
													{index === 3 && content.photos.length > 5 && (
														<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
															<span className="text-white text-xs">+{content.photos.length - 5}</span>
														</div>
													)}
												</div>
											))}
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
							<p className="text-gray-600">{page.slug} • Galereya</p>
						</div>
					</div>
					<button
						onClick={handleAddNew}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<Plus size={20} />
						Yangi Galereya
					</button>
				</div>

				{/* Qidiruv paneli */}
				<div className="relative">
					<Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
					<input
						type="text"
						placeholder="Galereyalarni qidirish (sarlavha)..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* Galereyalar ro'yxati */}
			<div className="bg-white rounded-xl shadow-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-gray-800">Mavjud Galereyalar</h3>
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
						<Grid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-gray-600 mb-2">Galereyalar topilmadi</h3>
						<p className="text-gray-500 text-sm mb-4">
							{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi galereyani yarating"}
						</p>
						{!searchTerm && (
							<button
								onClick={handleAddNew}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
							>
								Yangi Galereya
							</button>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{filteredContents.map(renderGalleryCard)}
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
									{editingContent ? 'Galereyani Yangilash' : 'Yangi Galereya Qo\'shish'}
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
									Galereya Sarlavhalari
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
											placeholder="Galereya sarlavhasi"
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
											placeholder="Gallery title"
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
											placeholder="Название галереи"
											required
										/>
									</div>
								</div>
							</div>

							{/* 2. Media fayllar */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<Grid size={20} />
									Media Fayllar
								</h3>

								{mediaPreviews.length > 0 && (
									<div className="space-y-3">
										<h4 className="text-sm font-medium text-gray-700">
											Tanlangan media fayllar ({mediaPreviews.length} ta):
										</h4>

										{/* Media statistikasi */}
										<div className="flex items-center gap-4 mb-3">
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1 text-sm text-gray-600">
													<Image className="w-4 h-4 text-blue-500" />
													<span>{mediaPreviews.filter(m => m.type === 'image').length} rasm</span>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<div className="flex items-center gap-1 text-sm text-gray-600">
													<Video className="w-4 h-4 text-red-500" />
													<span>{mediaPreviews.filter(m => m.type === 'video').length} video</span>
												</div>
											</div>
										</div>

										{/* Media grid */}
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{mediaPreviews.map((preview, index) => (
												<div key={index} className="group relative rounded-lg overflow-hidden border border-gray-200">
													{preview.type === 'video' ? (
														<div className="aspect-video bg-gray-800 relative">
															<div className="w-full h-full flex items-center justify-center">
																<Video className="w-8 h-8 text-white/70" />
															</div>
															<div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
																VIDEO
															</div>
														</div>
													) : (
														<div className="aspect-square bg-gray-100">
															<img
																src={preview.url}
																alt={`Preview ${index + 1}`}
																className="w-full h-full object-cover group-hover:scale-105 transition-transform"
															/>
														</div>
													)}

													{/* Fayl nomi */}
													<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
														<p className="text-white text-xs truncate">{preview.name}</p>
														{preview.size > 0 && (
															<p className="text-white/70 text-xs">{formatFileSize(preview.size)}</p>
														)}
													</div>

													{/* O'chirish tugmasi */}
													<button
														type="button"
														onClick={() => removeMediaPreview(index)}
														className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
														title="O'chirish"
													>
														<X size={12} />
													</button>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Media yuklash qismi */}
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
									<input
										type="file"
										accept="image/*,video/*"
										onChange={handleMediaChange}
										className="hidden"
										id="media-upload"
										multiple
									/>
									<label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center">
										<Upload className="w-12 h-12 text-gray-400 mb-4" />
										<p className="text-gray-600 text-lg mb-2">Media fayllarni yuklang</p>
										<p className="text-sm text-gray-500 mb-3">Rasm va videolarni tanlang yoki tortib tashlang</p>
										<div className="flex items-center justify-center gap-4 text-xs text-gray-500">
											<div className="flex items-center gap-1">
												<Image className="w-4 h-4" />
												<span>JPG, PNG, GIF</span>
											</div>
											<div className="flex items-center gap-1">
												<Video className="w-4 h-4" />
												<span>MP4, MOV, AVI</span>
											</div>
										</div>
										<button
											type="button"
											onClick={() => document.getElementById('media-upload').click()}
											className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
										>
											Fayllarni tanlash
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
									disabled={contentLoading || mediaPreviews.length === 0}
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

export default GalleryContent
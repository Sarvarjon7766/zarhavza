import axios from 'axios'
import { Edit, FileText, Plus, Save, Search, Trash2, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const AdditionalNavigationContent = () => {
	const [pages, setPages] = useState([])
	const [selectedPage, setSelectedPage] = useState(null)
	const [contents, setContents] = useState([])
	const [filteredContents, setFilteredContents] = useState([])
	const [loading, setLoading] = useState(true)
	const [contentLoading, setContentLoading] = useState(false)
	const [showContentForm, setShowContentForm] = useState(false)
	const [editingContent, setEditingContent] = useState(null)
	const [uploadingPhotos, setUploadingPhotos] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		description_uz: '',
		description_ru: '',
		description_en: '',
		photos: []
	})
	const [selectedMedia, setSelectedMedia] = useState([])
	const [mediaPreviews, setMediaPreviews] = useState([])
	const [removedMedia, setRemovedMedia] = useState([])

	useEffect(() => {
		fetchPages()
	}, [])

	useEffect(() => {
		if (selectedPage) {
			fetchContents()
		}
	}, [selectedPage])

	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredContents(contents)
		} else {
			const filtered = contents.filter(item =>
				getContentTitle(item)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				getContentDescription(item)?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredContents(filtered)
		}
	}, [searchTerm, contents])

	const fetchPages = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/pages/AdditCon`)

			if (response.data.success) {
				setPages(response.data.pages)
			} else {
				alert('Navigatsiyalarni yuklashda xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Navigatsiyalarni yuklashda xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	const fetchContents = async () => {
		if (!selectedPage) return

		try {
			setContentLoading(true)
			let endpoint = ''
			let responseKey = ''

			switch (selectedPage.type) {
				case 'static':
					endpoint = `${BASE_URL}/api/generalabout/getAll/${selectedPage.key}`
					responseKey = 'abouts'
					break
				case 'news':
					endpoint = `${BASE_URL}/api/generalnews/getAll/${selectedPage.key}`
					responseKey = 'news'
					break
				case 'gallery':
					endpoint = `${BASE_URL}/api/generalgallery/getAll/${selectedPage.key}`
					responseKey = 'gallarys'
					break
				case 'documents':
					endpoint = `${BASE_URL}/api/generalannouncement/getAll/${selectedPage.key}`
					responseKey = 'announcements'
					break
				default:
					return
			}

			const response = await axios.get(endpoint)
			if (response.data.success) {
				const contentData = response.data[responseKey] || []
				setContents(contentData)
				setFilteredContents(contentData)
			} else {
				setContents([])
				setFilteredContents([])
			}
		} catch (error) {
			console.error('Kontentlarni yuklashda xatolik:', error)
			setContents([])
			setFilteredContents([])
		} finally {
			setContentLoading(false)
		}
	}

	const handlePageSelect = (page) => {
		setSelectedPage(page)
		setShowContentForm(false)
		setEditingContent(null)
		setSearchTerm('')
		resetForm()
	}

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	// Fayl turini aniqlash (video yoki rasm)
	const getMediaType = (file) => {
		if (!file) return 'image'
		const fileName = file.name || file
		const extension = fileName.split('.').pop()?.toLowerCase()
		const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
		return videoExtensions.includes(extension) ? 'video' : 'image'
	}

	// 🖼️ Media fayllarni yuklash
	const handleMediaChange = (e) => {
		const files = Array.from(e.target.files)
		const newSelectedMedia = [...selectedMedia, ...files]
		setSelectedMedia(newSelectedMedia)

		// Preview yaratish
		const newPreviews = files.map(file => {
			const type = getMediaType(file)
			if (type === 'video') {
				return {
					type: 'video',
					url: URL.createObjectURL(file),
					name: file.name
				}
			} else {
				return {
					type: 'image',
					url: URL.createObjectURL(file),
					name: file.name
				}
			}
		})
		setMediaPreviews(prev => [...prev, ...newPreviews])
		e.target.value = ''
	}

	// 🗑️ Tanlangan mediani o'chirish
	const removeMediaPreview = (index) => {
		const newPreviews = [...mediaPreviews]
		const removedPreview = newPreviews.splice(index, 1)[0]

		if (removedPreview.url.startsWith('blob:')) {
			URL.revokeObjectURL(removedPreview.url)
		}

		setMediaPreviews(newPreviews)

		const newMedia = [...selectedMedia]
		newMedia.splice(index, 1)
		setSelectedMedia(newMedia)
	}

	// 🗑️ Mavjud mediani o'chirish
	const removeExistingMedia = (index) => {
		const updatedPreviews = [...mediaPreviews]
		const removedPreview = updatedPreviews.splice(index, 1)[0]

		// Agar bu mavjud media bo'lsa, removedMedia ga qo'shamiz
		if (removedPreview.url.startsWith(BASE_URL)) {
			const mediaPath = removedPreview.url.replace(BASE_URL, '')
			setRemovedMedia(prev => [...prev, mediaPath])
		}

		setMediaPreviews(updatedPreviews)
	}

	const handleSubmitContent = async (e) => {
		e.preventDefault()
		if (!selectedPage) {
			alert('Iltimos, avval navigatsiyani tanlang!')
			return
		}

		try {
			setContentLoading(true)

			let endpoint = ''
			let submitData

			if (selectedPage.type === 'gallery' || selectedPage.type === 'documents') {
				// Gallery va Documents uchun FormData yaratamiz
				submitData = new FormData()
				submitData.append('title_uz', formData.title_uz)
				submitData.append('title_ru', formData.title_ru)
				submitData.append('title_en', formData.title_en)
				submitData.append('key', selectedPage.key)

				// Gallery va Documents uchun description qo'shamiz
				if (selectedPage.type === 'documents') {
					submitData.append('description_uz', formData.description_uz)
					submitData.append('description_ru', formData.description_ru)
					submitData.append('description_en', formData.description_en)
				}

				// Yangi media fayllarni qo'shish
				selectedMedia.forEach(media => {
					submitData.append('photos', media)
				})

				// O'chirilgan media'larni yuborish (faqat tahrirlashda)
				if (editingContent) {
					removedMedia.forEach(mediaPath => {
						submitData.append('removedPhotos', mediaPath)
					})
				}

				// Endpointlarni aniqlash
				switch (selectedPage.type) {
					case 'gallery':
						endpoint = editingContent
							? `${BASE_URL}/api/generalgallery/update/${editingContent._id}`
							: `${BASE_URL}/api/generalgallery/create`
						break
					case 'documents':
						endpoint = editingContent
							? `${BASE_URL}/api/generalannouncement/update/${editingContent._id}`
							: `${BASE_URL}/api/generalannouncement/create`
						break
				}
			} else {
				// Static va News uchun oddiy JSON data
				submitData = {
					...formData,
					key: selectedPage.key
				}

				switch (selectedPage.type) {
					case 'static':
						endpoint = editingContent
							? `${BASE_URL}/api/generalabout/update/${editingContent._id}`
							: `${BASE_URL}/api/generalabout/create`
						break
					case 'news':
						endpoint = editingContent
							? `${BASE_URL}/api/generalnews/update/${editingContent._id}`
							: `${BASE_URL}/api/generalnews/create`
						break
					default:
						return
				}
			}

			const response = editingContent
				? await axios.put(endpoint, submitData, (selectedPage.type === 'gallery' || selectedPage.type === 'documents') ? {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				} : {})
				: await axios.post(endpoint, submitData, (selectedPage.type === 'gallery' || selectedPage.type === 'documents') ? {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				} : {})

			if (response.data.success) {
				const message = editingContent ? 'Kontent muvaffaqiyatli yangilandi!' : 'Kontent muvaffaqiyatli qo\'shildi!'
				alert(message)
				closeModal()
				fetchContents()
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Kontentni saqlashda xatolik yuz berdi: ' + (error.response?.data?.message || error.message))
		} finally {
			setContentLoading(false)
		}
	}

	const handleAddNew = () => {
		setEditingContent(null)
		resetForm()
		setShowContentForm(true)
	}

	const handleEditContent = (content) => {
		setEditingContent(content)
		setFormData({
			title_uz: content.title_uz || '',
			title_ru: content.title_ru || '',
			title_en: content.title_en || '',
			description_uz: content.description_uz || '',
			description_ru: content.description_ru || '',
			description_en: content.description_en || '',
			photos: content.photos || []
		})

		// Gallery va Documents uchun media previewlarni o'rnatish
		if (selectedPage?.type === 'gallery' || selectedPage?.type === 'documents') {
			const existingPreviews = (content.photos || []).map(photo => {
				const type = getMediaType(photo)
				return {
					type: type,
					url: `${BASE_URL}${photo}`,
					name: photo
				}
			})
			setMediaPreviews(existingPreviews)
		} else {
			// Boshqa turlar uchun oddiy photo preview
			setMediaPreviews((content.photos || []).map(photo => `${BASE_URL}${photo}`))
		}

		setSelectedMedia([])
		setRemovedMedia([])
		setShowContentForm(true)
	}

	const handleDeleteContent = async (contentId, contentTitle) => {
		const title = getContentTitle({ title_uz: contentTitle.title_uz, title: contentTitle })
		if (window.confirm(`"${title}" kontentini o'chirishni istaysizmi?`)) {
			try {
				let endpoint = ''
				switch (selectedPage.type) {
					case 'static':
						endpoint = `${BASE_URL}/api/generalabout/delete/${contentId}`
						break
					case 'news':
						endpoint = `${BASE_URL}/api/generalnews/delete/${contentId}`
						break
					case 'gallery':
						endpoint = `${BASE_URL}/api/generalgallery/delete/${contentId}`
						break
					case 'documents':
						endpoint = `${BASE_URL}/api/generalannouncement/delete/${contentId}`
						break
				}

				const response = await axios.delete(endpoint)

				if (response.data.success) {
					alert('Kontent muvaffaqiyatli o\'chirildi!')
					fetchContents()
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert('Kontentni o\'chirishda xatolik yuz berdi')
			}
		}
	}

	const resetForm = () => {
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			description_uz: '',
			description_ru: '',
			description_en: '',
			photos: []
		})
		setSelectedMedia([])
		setMediaPreviews([])
		setRemovedMedia([])
	}

	const closeModal = () => {
		setShowContentForm(false)
		setEditingContent(null)
		resetForm()
	}

	const getContentTitle = (content) => {
		return content.title_uz || content.title?.uz || 'Nomsiz'
	}

	const getContentDescription = (content) => {
		return content.description_uz || content.description?.uz || ''
	}

	// Media'lar sonini hisoblash
	const getMediaCounts = (content) => {
		if (!content.photos) return { images: 0, videos: 0 }

		const images = content.photos.filter(photo => getMediaType(photo) === 'image').length
		const videos = content.photos.filter(photo => getMediaType(photo) === 'video').length

		return { images, videos }
	}

	const renderPhotoSection = () => {
		if (!['news', 'gallery', 'documents'].includes(selectedPage?.type)) return null

		if (selectedPage.type === 'gallery') {
			// Gallery uchun maxsus media section
			return (
				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Media Fayllar ({mediaPreviews.length} ta) *
						<span className="text-xs text-gray-500 ml-2">(Rasm va Video qo'shish mumkin)</span>
					</label>

					{mediaPreviews.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{mediaPreviews.map((preview, index) => (
								<div key={index} className="relative group">
									{preview.type === 'video' ? (
										<div className="w-full h-24 bg-gray-800 rounded-lg flex items-center justify-center relative">
											<video className="w-full h-full object-cover rounded-lg">
												<source src={preview.url} type="video/mp4" />
											</video>
											<div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
												<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
													<path d="M8 5v14l11-7z" />
												</svg>
											</div>
											<div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded">
												VIDEO
											</div>
										</div>
									) : (
										<img
											src={preview.url}
											alt={`Preview ${index + 1}`}
											className="w-full h-24 object-cover rounded-lg border"
										/>
									)}
									<button
										type="button"
										onClick={() => {
											if (preview.url.startsWith(BASE_URL)) {
												removeExistingMedia(index)
											} else {
												removeMediaPreview(index)
											}
										}}
										className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
									>
										<X size={12} />
									</button>
								</div>
							))}
						</div>
					)}

					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
						<input
							type="file"
							accept="image/*,video/*"
							onChange={handleMediaChange}
							className="hidden"
							id="media-upload"
							multiple
						/>
						<label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center">
							<Upload className="w-8 h-8 text-gray-400 mb-2" />
							<p className="text-gray-600">Rasm va Videolarni tanlang</p>
							<p className="text-sm text-gray-500 mt-1">(MP4, AVI, MOV, JPEG, PNG va boshqalar)</p>
						</label>
					</div>
				</div>
			)
		} else {
			// News va Documents uchun oddiy rasm yuklash
			return (
				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Rasmlar ({mediaPreviews.length} ta)
					</label>

					{mediaPreviews.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{mediaPreviews.map((preview, index) => (
								<div key={index} className="relative">
									<img
										src={typeof preview === 'string' ? preview : preview.url}
										alt={`Preview ${index + 1}`}
										className="w-full h-24 object-cover rounded-lg border"
									/>
									<button
										type="button"
										onClick={() => {
											const previewUrl = typeof preview === 'string' ? preview : preview.url
											if (previewUrl.startsWith(BASE_URL)) {
												removeExistingMedia(index)
											} else {
												removeMediaPreview(index)
											}
										}}
										className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
									>
										<X size={12} />
									</button>
								</div>
							))}
						</div>
					)}

					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
						<input
							type="file"
							accept="image/*"
							onChange={handleMediaChange}
							className="hidden"
							id="photo-upload"
							multiple
						/>
						<label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
							<Upload className="w-8 h-8 text-gray-400 mb-2" />
							<p className="text-gray-600">Rasmlarni tanlang</p>
							<p className="text-sm text-gray-500 mt-1">Bir nechta rasm tanlash mumkin</p>
						</label>
					</div>
				</div>
			)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-8 px-4">
				<div className="mx-auto">
					<div className="animate-pulse space-y-4">
						<div className="h-10 bg-gray-300 rounded"></div>
						<div className="h-32 bg-gray-300 rounded"></div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-8 px-4">
			<div className="mx-auto">
				{/* Sarlavha */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Qo'shimcha Navigatsiyaga Ma'lumot Qo'shish</h1>
					<p className="text-gray-600">Tanlangan qo'shimcha navigatsiya bo'yicha kontentlarni boshqaring</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Navigatsiyalar ro'yxati */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-lg p-6">
							<h2 className="text-lg font-semibold text-gray-800 mb-4">Qo'shimcha Navigatsiyalar</h2>
							<div className="space-y-2">
								{pages.map((page) => (
									<button
										key={page._id}
										onClick={() => handlePageSelect(page)}
										className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPage?._id === page._id
											? 'bg-green-50 border-green-500 text-green-700'
											: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
											}`}
									>
										<div className="flex items-center gap-3">
											<span className="text-lg">{page.icon}</span>
											<div>
												<div className="font-medium">{page.title.uz}</div>
												<div className="text-xs text-gray-500">
													{page.slug} • {page.type}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Kontentlar va form */}
					<div className="lg:col-span-3">
						{!selectedPage ? (
							<div className="bg-white rounded-xl shadow-lg p-8 text-center">
								<FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-800 mb-2">Navigatsiya tanlang</h3>
								<p className="text-gray-600">Kontent qo'shish uchun chap tomondan qo'shimcha navigatsiyani tanlang</p>
							</div>
						) : (
							<div className="space-y-6">
								{/* Tanlangan navigatsiya ma'lumoti va qidiruv */}
								<div className="bg-white rounded-xl shadow-lg p-6">
									<div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
										<div className="flex items-center gap-3">
											<span className="text-2xl">{selectedPage.icon}</span>
											<div>
												<h3 className="text-xl font-bold text-gray-800">{selectedPage.title.uz}</h3>
												<p className="text-gray-600">
													{selectedPage.slug} • {selectedPage.type}
												</p>
											</div>
										</div>
										<button
											onClick={handleAddNew}
											className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
										>
											<Plus size={20} />
											Yangi Kontent
										</button>
									</div>

									{/* Qidiruv paneli */}
									<div className="flex-1 w-full">
										<div className="relative">
											<Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
											<input
												type="text"
												placeholder="Kontentlarni qidirish..."
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
											/>
										</div>
									</div>
								</div>

								{/* Mavjud kontentlar ro'yxati */}
								<div className="bg-white rounded-xl shadow-lg p-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg font-semibold text-gray-800">Mavjud Kontentlar</h3>
										<span className="text-sm text-gray-600">
											{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredContents.length} ta` : `Jami: ${filteredContents.length} ta`}
										</span>
									</div>

									{contentLoading ? (
										<div className="animate-pulse space-y-3">
											{[1, 2, 3].map(i => (
												<div key={i} className="h-16 bg-gray-200 rounded"></div>
											))}
										</div>
									) : filteredContents.length === 0 ? (
										<div className="text-center py-8 text-gray-500">
											<FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
											<h3 className="text-gray-600 mb-2">Kontentlar topilmadi</h3>
											<p className="text-gray-500 text-sm mb-4">
												{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi kontentni yarating"}
											</p>
											{!searchTerm && (
												<button
													onClick={handleAddNew}
													className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
												>
													Yangi Kontent
												</button>
											)}
										</div>
									) : (
										<div className="space-y-4">
											{filteredContents.map((content) => {
												const mediaCounts = selectedPage?.type === 'gallery' ? getMediaCounts(content) : null
												return (
													<div key={content._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
														<div className="flex justify-between items-start">
															<div className="flex-1">
																<h4 className="font-semibold text-gray-800 text-lg mb-2">
																	{getContentTitle(content)}
																</h4>
																{selectedPage?.type !== 'gallery' && (
																	<p className="text-gray-600 mb-3 leading-relaxed">
																		{getContentDescription(content)}
																	</p>
																)}

																{/* Til versiyalari */}
																<div className="flex flex-wrap gap-2 mb-3">
																	{content.title_ru && (
																		<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
																			RU: {content.title_ru}
																		</span>
																	)}
																	{content.title_en && (
																		<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
																			EN: {content.title_en}
																		</span>
																	)}
																</div>

																{/* Gallery uchun media statistikasi */}
																{selectedPage?.type === 'gallery' && mediaCounts && (
																	<div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
																		{mediaCounts.images > 0 && (
																			<span className="flex items-center gap-1">
																				<svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
																				</svg>
																				{mediaCounts.images} rasm
																			</span>
																		)}
																		{mediaCounts.videos > 0 && (
																			<span className="flex items-center gap-1">
																				<svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
																				</svg>
																				{mediaCounts.videos} video
																			</span>
																		)}
																	</div>
																)}

																{content.photos && content.photos.length > 0 && (
																	<div className="flex gap-2 mt-3">
																		{content.photos.slice(0, 3).map((photo, index) => {
																			const type = getMediaType(photo)
																			return type === 'video' ? (
																				<div key={index} className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center relative">
																					<div className="absolute inset-0 bg-black bg-opacity-30 rounded flex items-center justify-center">
																						<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
																							<path d="M8 5v14l11-7z" />
																						</svg>
																					</div>
																					<div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">
																						V
																					</div>
																				</div>
																			) : (
																				<img
																					key={index}
																					src={`${BASE_URL}${photo}`}
																					alt={`Content ${index + 1}`}
																					className="w-12 h-12 object-cover rounded"
																				/>
																			)
																		})}
																		{content.photos.length > 3 && (
																			<div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
																				+{content.photos.length - 3}
																			</div>
																		)}
																	</div>
																)}

																{/* Sana ma'lumotlari */}
																<div className="flex items-center space-x-4 text-xs text-gray-500 mt-3 pt-3 border-t">
																	<span>Yaratilgan: {new Date(content.createdAt).toLocaleDateString()}</span>
																	<span>Yangilangan: {new Date(content.updatedAt).toLocaleDateString()}</span>
																</div>
															</div>
															<div className="flex items-center space-x-2 ml-4">
																<button
																	onClick={() => handleEditContent(content)}
																	className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
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
											})}
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Modal */}
				{showContentForm && (
					<div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50 p-4">

						<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="bg-green-600 text-white p-6 rounded-t-xl">
								<div className="flex justify-between items-center">
									<h3 className="text-xl font-bold">
										{editingContent ? 'Kontentni Yangilash' : 'Yangi Kontent Qo\'shish'}
									</h3>
									<button
										onClick={closeModal}
										className="text-white hover:text-gray-200 p-1 rounded"
									>
										<X size={24} />
									</button>
								</div>
							</div>

							<form onSubmit={handleSubmitContent} className="p-6 space-y-6">
								{/* Sarlavhalar */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Sarlavha</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Sarlavha (O'zbekcha) *
											</label>
											<input
												type="text"
												value={formData.title_uz}
												onChange={(e) => handleInputChange('title_uz', e.target.value)}
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
												required
											/>
										</div>
									</div>
								</div>

								{/* Tavsiflar (Gallery uchun kerak emas) */}
								{selectedPage?.type !== 'gallery' && (
									<div className="space-y-4">
										<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Tavsif</h3>
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Tavsif (O'zbekcha) {selectedPage?.type !== 'gallery' ? '*' : ''}
												</label>
												<textarea
													value={formData.description_uz}
													onChange={(e) => handleInputChange('description_uz', e.target.value)}
													rows="4"
													className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
													required={selectedPage?.type !== 'gallery'}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Tavsif (Inglizcha) {selectedPage?.type !== 'gallery' ? '*' : ''}
												</label>
												<textarea
													value={formData.description_en}
													onChange={(e) => handleInputChange('description_en', e.target.value)}
													rows="4"
													className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
													required={selectedPage?.type !== 'gallery'}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Tavsif (Ruscha) {selectedPage?.type !== 'gallery' ? '*' : ''}
												</label>
												<textarea
													value={formData.description_ru}
													onChange={(e) => handleInputChange('description_ru', e.target.value)}
													rows="4"
													className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
													required={selectedPage?.type !== 'gallery'}
												/>
											</div>
										</div>
									</div>
								)}

								{/* Rasm/Media yuklash qismi */}
								{renderPhotoSection()}

								{/* Tugmalar */}
								<div className="flex space-x-3 pt-4">
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
										className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center"
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
		</div>
	)
}

export default AdditionalNavigationContent
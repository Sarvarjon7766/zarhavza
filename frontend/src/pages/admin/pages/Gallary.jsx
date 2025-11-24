import axios from 'axios'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const Gallary = () => {
	const [galleries, setGalleries] = useState([])
	const [filteredGalleries, setFilteredGalleries] = useState([])
	const [loading, setLoading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [editingGallery, setEditingGallery] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		photos: []
	})
	const [selectedMedia, setSelectedMedia] = useState([])
	const [mediaPreviews, setMediaPreviews] = useState([])
	const [removedMedia, setRemovedMedia] = useState([])

	// 🌐 Barcha galereyalarni olish
	useEffect(() => {
		fetchGalleries()
	}, [])

	// 🔍 Qidiruvni boshqarish
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredGalleries(galleries)
		} else {
			const filtered = galleries.filter(item =>
				item.title_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_en.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredGalleries(filtered)
		}
	}, [searchTerm, galleries])

	const fetchGalleries = async () => {
		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const res = await axios.get(`${BASE_URL}/api/gallary/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data?.gallarys) {
				setGalleries(res.data.gallarys)
				setFilteredGalleries(res.data.gallarys)
			}
		} catch (err) {
			console.error("Galereyalarni olishda xatolik:", err.message)
		} finally {
			setLoading(false)
		}
	}

	// 📝 Form inputlarini boshqarish
	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
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

	// ➕ Yangi galereya qo'shish
	const handleAddNew = () => {
		setEditingGallery(null)
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			photos: []
		})
		setSelectedMedia([])
		setMediaPreviews([])
		setRemovedMedia([])
		setShowForm(true)
	}

	// ✏️ Galereyani tahrirlash
	const handleEdit = (gallery) => {
		setEditingGallery(gallery)
		setFormData({
			title_uz: gallery.title_uz,
			title_ru: gallery.title_ru,
			title_en: gallery.title_en,
			photos: gallery.photos
		})

		// Mavjud media'larni preview qilish
		const existingPreviews = gallery.photos.map(photo => {
			const type = getMediaType(photo)
			return {
				type: type,
				url: `${BASE_URL}${photo}`,
				name: photo
			}
		})
		setMediaPreviews(existingPreviews)
		setSelectedMedia([])
		setRemovedMedia([])
		setShowForm(true)
	}

	// 📤 Formani yuborish
	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const submitData = new FormData()

			// Matn ma'lumotlarini qo'shish
			submitData.append('title_uz', formData.title_uz)
			submitData.append('title_ru', formData.title_ru)
			submitData.append('title_en', formData.title_en)

			// Yangi media fayllarni qo'shish
			selectedMedia.forEach(media => {
				submitData.append('photos', media)
			})

			// O'chirilgan media'larni yuborish
			if (editingGallery) {
				removedMedia.forEach(mediaPath => {
					submitData.append('removedPhotos', mediaPath)
				})
			}

			let res
			if (editingGallery) {
				res = await axios.put(
					`${BASE_URL}/api/gallary/update/${editingGallery._id}`,
					submitData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
							Authorization: `Bearer ${token}`,
						},
					}
				)
			} else {
				res = await axios.post(`${BASE_URL}/api/gallary/create`, submitData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${token}`,
					},
				})
			}

			if (res.data.success) {
				alert(`✅ Galereya ${editingGallery ? "yangilandi" : "yaratildi"}!`)
				resetForm()
				fetchGalleries()
				setShowForm(false)
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi!")
		} finally {
			setLoading(false)
		}
	}

	// 🗑️ Galereyani o'chirish
	const handleDelete = async (galleryId) => {
		if (!window.confirm("Haqiqatan ham bu galereyani o'chirmoqchimisiz?")) {
			return
		}

		try {
			const token = localStorage.getItem("token")
			const res = await axios.delete(`${BASE_URL}/api/gallary/delete/${galleryId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data.success) {
				alert("✅ Galereya o'chirildi!")
				fetchGalleries()
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi!")
		}
	}

	// 🔄 Formani tozalash
	const resetForm = () => {
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			photos: []
		})
		setSelectedMedia([])
		setMediaPreviews([])
		setRemovedMedia([])
		setEditingGallery(null)
	}

	// ❌ Formani yopish
	const handleCancel = () => {
		setShowForm(false)
		resetForm()
	}

	// 🗑️ Media previewni o'chirish
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
	const removeExistingMedia = (galleryId, mediaPath, index) => {
		if (!window.confirm("Bu mediani o'chirmoqchimisiz?")) return

		if (editingGallery && editingGallery._id === galleryId) {
			const updatedPreviews = [...mediaPreviews]
			updatedPreviews.splice(index, 1)
			setMediaPreviews(updatedPreviews)
			setRemovedMedia(prev => [...prev, mediaPath])
		}
	}

	// Media'lar sonini hisoblash
	const getMediaCounts = (gallery) => {
		if (!gallery.photos) return { images: 0, videos: 0 }

		const images = gallery.photos.filter(photo => getMediaType(photo) === 'image').length
		const videos = gallery.photos.filter(photo => getMediaType(photo) === 'video').length

		return { images, videos }
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
			<div className="mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Galereya Boshqaruvi</h1>
				</div>

				{/* Search and Actions */}
				<div className="p-6 mb-8">
					<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
						{/* Search */}
						<div className="flex-1 w-full md:max-w-md">
							<div className="relative">
								<input
									type="text"
									placeholder="Galereyalarni qidirish..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 text-black py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
								<svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
						</div>

						{/* Add Button */}
						<button
							onClick={handleAddNew}
							className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<span>Qo'shish</span>
						</button>
					</div>
				</div>

				{/* Loading */}
				{loading && (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
					</div>
				)}

				{/* Create/Edit Form Modal */}
				{showForm && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="bg-purple-600 text-white p-6 rounded-t-xl">
								<div className="flex justify-between items-center">
									<h2 className="text-xl font-bold">
										{editingGallery ? "Galereyani Tahrirlash" : "Yangi Galereya Yaratish"}
									</h2>
									<button
										onClick={handleCancel}
										className="text-white hover:text-gray-200 p-1 rounded"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>

							{/* Form */}
							<form onSubmit={handleSubmit} className="p-6 space-y-6">
								{/* Titles */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha (O'zbekcha)</label>
										<input
											type="text"
											name="title_uz"
											value={formData.title_uz}
											onChange={handleInputChange}
											placeholder="o'zbekcha ... "
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha (Ruscha)</label>
										<input
											type="text"
											name="title_ru"
											value={formData.title_ru}
											onChange={handleInputChange}
											placeholder='ruscha ... '
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha (Inglizcha)</label>
										<input
											type="text"
											name="title_en"
											value={formData.title_en}
											onChange={handleInputChange}
											placeholder='inglizcha ... '
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
											required
										/>
									</div>
								</div>

								{/* Media Files */}
								<div className="space-y-4">
									<label className="block text-sm font-medium text-gray-700">
										Media Fayllar ({mediaPreviews.length} ta)
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
																const mediaIndex = formData.photos.findIndex(photo =>
																	`${BASE_URL}${photo}` === preview.url
																)
																if (mediaIndex !== -1) {
																	removeExistingMedia(editingGallery._id, formData.photos[mediaIndex], index)
																}
															} else {
																removeMediaPreview(index)
															}
														}}
														className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
													>
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
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
										<label htmlFor="media-upload" className="cursor-pointer">
											<svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<p className="text-gray-600">Rasm va Videolarni tanlang</p>
											<p className="text-gray-500 text-sm mt-1">(MP4, AVI, MOV, JPEG, PNG va boshqalar)</p>
										</label>
									</div>
								</div>

								{/* Buttons */}
								<div className="flex space-x-3 pt-4">
									<button
										type="submit"
										disabled={loading}
										className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center"
									>
										{loading ? (
											<>
												<svg className="animate-spin h-4 w-4 text-white mr-2" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												Yuklanmoqda...
											</>
										) : (
											editingGallery ? "Yangilash" : "Yaratish"
										)}
									</button>
									<button
										type="button"
										onClick={handleCancel}
										className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg"
									>
										Bekor qilish
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Galleries List */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* List Header */}
					<div className="text-black p-6">
						<h2 className="text-xl font-bold">Barcha Galereyalar</h2>
						<p className="text-black">
							{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredGalleries.length} ta` : `Jami: ${filteredGalleries.length} ta`}
						</p>
					</div>

					{/* Gallery Items */}
					<div className="p-6">
						{filteredGalleries.length === 0 && !loading ? (
							<div className="text-center py-8">
								<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<h3 className="text-gray-600 mb-2">Galereyalar topilmadi</h3>
								<p className="text-gray-500 text-sm mb-4">
									{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi galereyani yarating"}
								</p>
								{!searchTerm && (
									<button
										onClick={handleAddNew}
										className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
									>
										Yangi Galereya
									</button>
								)}
							</div>
						) : (
							<div className="space-y-4">
								{filteredGalleries.map((gallery) => {
									const mediaCounts = getMediaCounts(gallery)
									return (
										<div key={gallery._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className="font-semibold text-gray-800 mb-2">{gallery.title_uz}</h3>
													<div className="flex items-center space-x-4 text-xs text-gray-500">
														<span>{new Date(gallery.createdAt).toLocaleDateString()}</span>
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
												</div>
												<div className="flex space-x-2 ml-4">
													<button
														onClick={() => handleEdit(gallery)}
														className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg"
														title="Tahrirlash"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
													<button
														onClick={() => handleDelete(gallery._id)}
														className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
														title="O'chirish"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
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
			</div>
		</div>
	)
}

export default Gallary
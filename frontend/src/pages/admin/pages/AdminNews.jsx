import axios from 'axios'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const AdminNews = () => {
	const [news, setNews] = useState([])
	const [filteredNews, setFilteredNews] = useState([])
	const [loading, setLoading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [editingNews, setEditingNews] = useState(null)
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
	const [selectedPhotos, setSelectedPhotos] = useState([])
	const [photoPreviews, setPhotoPreviews] = useState([])
	const [removedPhotos, setRemovedPhotos] = useState([])

	// 🌐 Barcha yangiliklarni olish
	useEffect(() => {
		fetchNews()
	}, [])

	// 🔍 Qidiruvni boshqarish
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredNews(news)
		} else {
			const filtered = news.filter(item =>
				item.title_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_en.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredNews(filtered)
		}
	}, [searchTerm, news])

	const fetchNews = async () => {
		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const res = await axios.get(`${BASE_URL}/api/news/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data?.news) {
				setNews(res.data.news)
				setFilteredNews(res.data.news)
			}
		} catch (err) {
			console.error("Yangiliklarni olishda xatolik:", err.message)
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

	// 🖼️ Rasmlarni yuklash
	const handlePhotoChange = (e) => {
		const files = Array.from(e.target.files)
		const newSelectedPhotos = [...selectedPhotos, ...files]
		setSelectedPhotos(newSelectedPhotos)

		const newPreviews = files.map(file => URL.createObjectURL(file))
		setPhotoPreviews(prev => [...prev, ...newPreviews])
		e.target.value = ''
	}

	// ➕ Yangi yangilik qo'shish
	const handleAddNew = () => {
		setEditingNews(null)
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			description_uz: '',
			description_ru: '',
			description_en: '',
			photos: []
		})
		setSelectedPhotos([])
		setPhotoPreviews([])
		setRemovedPhotos([])
		setShowForm(true)
	}

	// ✏️ Yangilikni tahrirlash
	const handleEdit = (newsItem) => {
		setEditingNews(newsItem)
		setFormData({
			title_uz: newsItem.title_uz,
			title_ru: newsItem.title_ru,
			title_en: newsItem.title_en,
			description_uz: newsItem.description_uz,
			description_ru: newsItem.description_ru,
			description_en: newsItem.description_en,
			photos: newsItem.photos
		})
		setPhotoPreviews(newsItem.photos.map(photo => `${BASE_URL}${photo}`))
		setSelectedPhotos([])
		setRemovedPhotos([])
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
			submitData.append('description_uz', formData.description_uz)
			submitData.append('description_ru', formData.description_ru)
			submitData.append('description_en', formData.description_en)

			// Yangi rasmlarni qo'shish
			selectedPhotos.forEach(photo => {
				submitData.append('photos', photo)
			})

			// O'chirilgan rasmlarni yuborish
			if (editingNews) {
				removedPhotos.forEach(photoPath => {
					submitData.append('removedPhotos', photoPath)
				})
			}

			let res
			if (editingNews) {
				res = await axios.put(
					`${BASE_URL}/api/news/update/${editingNews._id}`,
					submitData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
							Authorization: `Bearer ${token}`,
						},
					}
				)
			} else {
				res = await axios.post(`${BASE_URL}/api/news/create`, submitData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${token}`,
					},
				})
			}

			if (res.data.success) {
				alert(`✅ Yangilik ${editingNews ? "yangilandi" : "yaratildi"}!`)
				resetForm()
				fetchNews()
				setShowForm(false)
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi!")
		} finally {
			setLoading(false)
		}
	}

	// 🗑️ Yangilikni o'chirish
	const handleDelete = async (newsId) => {
		if (!window.confirm("Haqiqatan ham bu yangilikni o'chirmoqchimisiz?")) {
			return
		}

		try {
			const token = localStorage.getItem("token")
			const res = await axios.delete(`${BASE_URL}/api/news/delete/${newsId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data.success) {
				alert("✅ Yangilik o'chirildi!")
				fetchNews()
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
			description_uz: '',
			description_ru: '',
			description_en: '',
			photos: []
		})
		setSelectedPhotos([])
		setPhotoPreviews([])
		setRemovedPhotos([])
		setEditingNews(null)
	}

	// ❌ Formani yopish
	const handleCancel = () => {
		setShowForm(false)
		resetForm()
	}

	// 🗑️ Rasmni o'chirish
	const removePhotoPreview = (index) => {
		const newPreviews = [...photoPreviews]
		const removedPreview = newPreviews.splice(index, 1)[0]

		if (removedPreview.startsWith('blob:')) {
			URL.revokeObjectURL(removedPreview)
		}

		setPhotoPreviews(newPreviews)

		const newPhotos = [...selectedPhotos]
		newPhotos.splice(index, 1)
		setSelectedPhotos(newPhotos)
	}

	// 🗑️ Mavjud rasmni o'chirish
	const removeExistingPhoto = (newsId, photoPath, index) => {
		if (!window.confirm("Bu rasmni o'chirmoqchimisiz?")) return

		if (editingNews && editingNews._id === newsId) {
			const updatedPreviews = [...photoPreviews]
			updatedPreviews.splice(index, 1)
			setPhotoPreviews(updatedPreviews)
			setRemovedPhotos(prev => [...prev, photoPath])
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Yangiliklar Boshqaruvi</h1>
				</div>

				{/* Search and Actions */}
				<div className="p-6 mb-8">
					<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
						{/* Search */}
						<div className="flex-1 w-full md:max-w-md">
							<div className="relative">
								<input
									type="text"
									placeholder="Yangiliklarni qidirish..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 text-black py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
						</div>

						{/* Add Button */}
						<button
							onClick={handleAddNew}
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
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
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				)}

				{/* Create/Edit Form Modal */}
				{showForm && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="bg-blue-600 text-white p-6 rounded-t-xl">
								<div className="flex justify-between items-center">
									<h2 className="text-xl font-bold">
										{editingNews ? "Yangilikni Tahrirlash" : "Yangi Yangilik Yaratish"}
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
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
								</div>

								{/* Descriptions */}
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Tavsif (O'zbekcha)</label>
										<textarea
											name="description_uz"
											value={formData.description_uz}
											onChange={handleInputChange}
											rows="3"
											placeholder="o'zbekcha ... "
											className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Tavsif (Ruscha)</label>
										<textarea
											name="description_ru"
											value={formData.description_ru}
											onChange={handleInputChange}
											rows="3"
											placeholder='ruscha ... '
											className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Tavsif (Inglizcha)</label>
										<textarea
											name="description_en"
											value={formData.description_en}
											onChange={handleInputChange}
											rows="3"
											placeholder='inglizcha ... '
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
								</div>

								{/* Photos */}
								<div className="space-y-4">
									<label className="block text-sm font-medium text-gray-700">Rasmlar ({photoPreviews.length} ta)</label>

									{photoPreviews.length > 0 && (
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{photoPreviews.map((preview, index) => (
												<div key={index} className="relative">
													<img
														src={preview}
														alt={`Preview ${index + 1}`}
														className="w-full h-24 object-cover rounded-lg border"
													/>
													<button
														type="button"
														onClick={() => {
															if (preview.startsWith(BASE_URL)) {
																const photoIndex = formData.photos.findIndex(photo =>
																	`${BASE_URL}${photo}` === preview
																)
																if (photoIndex !== -1) {
																	removeExistingPhoto(editingNews._id, formData.photos[photoIndex], index)
																}
															} else {
																removePhotoPreview(index)
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
											accept="image/*"
											onChange={handlePhotoChange}
											className="hidden"
											id="photo-upload"
											multiple
										/>
										<label htmlFor="photo-upload" className="cursor-pointer">
											<svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<p className="text-gray-600">Rasmlarni tanlang</p>
										</label>
									</div>
								</div>

								{/* Buttons */}
								<div className="flex space-x-3 pt-4">
									<button
										type="submit"
										disabled={loading}
										className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center"
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
											editingNews ? "Yangilash" : "Yaratish"
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

				{/* News List */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* List Header */}
					<div className="text-black p-6">
						<h2 className="text-xl font-bold">Barcha Yangiliklar</h2>
						<p className="text-black">
							{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredNews.length} ta` : `Jami: ${filteredNews.length} ta`}
						</p>
					</div>

					{/* News Items */}
					<div className="p-6">
						{filteredNews.length === 0 && !loading ? (
							<div className="text-center py-8">
								<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<h3 className="text-gray-600 mb-2">Yangiliklar topilmadi</h3>
								<p className="text-gray-500 text-sm mb-4">
									{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi yangilikni yarating"}
								</p>
								{!searchTerm && (
									<button
										onClick={handleAddNew}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
									>
										Yangi Yangilik
									</button>
								)}
							</div>
						) : (
							<div className="space-y-4">
								{filteredNews.map((newsItem) => (
									<div key={newsItem._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<h3 className="font-semibold text-gray-800 mb-1">{newsItem.title_uz}</h3>
												<p className="text-gray-600 text-sm mb-2 line-clamp-2">
													{newsItem.description_uz}
												</p>
												<div className="flex items-center space-x-4 text-xs text-gray-500">
													<span>{new Date(newsItem.createdAt).toLocaleDateString()}</span>
													<span>{newsItem.photos.length} ta rasm</span>
												</div>
											</div>
											<div className="flex space-x-2 ml-4">
												<button
													onClick={() => handleEdit(newsItem)}
													className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
													title="Tahrirlash"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => handleDelete(newsItem._id)}
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
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminNews
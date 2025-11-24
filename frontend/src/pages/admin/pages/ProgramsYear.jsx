import axios from 'axios'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const ProgramsYear = () => {
	const [programs, setPrograms] = useState([])
	const [filteredPrograms, setFilteredPrograms] = useState([])
	const [loading, setLoading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [editingProgram, setEditingProgram] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		description_uz: '',
		description_ru: '',
		description_en: '',
		photo: null
	})
	const [selectedPhoto, setSelectedPhoto] = useState(null)
	const [photoPreview, setPhotoPreview] = useState('')

	// 🌐 Barcha dasturlarni olish
	useEffect(() => {
		fetchPrograms()
	}, [])

	// 🔍 Qidiruvni boshqarish
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredPrograms(programs)
		} else {
			const filtered = programs.filter(item =>
				item.title_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_en?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredPrograms(filtered)
		}
	}, [searchTerm, programs])

	const fetchPrograms = async () => {
		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const res = await axios.get(`${BASE_URL}/api/program/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data?.programs) {
				setPrograms(res.data.programs)
				setFilteredPrograms(res.data.programs)
			}
		} catch (err) {
			console.error("Dasturlarni olishda xatolik:", err.message)
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

	// 🖼️ Rasm yuklash
	const handlePhotoChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			setSelectedPhoto(file)
			const previewUrl = URL.createObjectURL(file)
			setPhotoPreview(previewUrl)
		}
		e.target.value = ''
	}

	// ➕ Yangi dastur qo'shish
	const handleAddNew = () => {
		setEditingProgram(null)
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			description_uz: '',
			description_ru: '',
			description_en: '',
			photo: null
		})
		setSelectedPhoto(null)
		setPhotoPreview('')
		setShowForm(true)
	}

	// ✏️ Dasturni tahrirlash
	const handleEdit = (program) => {
		setEditingProgram(program)
		setFormData({
			title_uz: program.title_uz || '',
			title_ru: program.title_ru || '',
			title_en: program.title_en || '',
			description_uz: program.description_uz || '',
			description_ru: program.description_ru || '',
			description_en: program.description_en || '',
			photo: null
		})
		setPhotoPreview(program.photo ? `${BASE_URL}${program.photo}` : '')
		setSelectedPhoto(null)
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

			// Rasm qo'shish
			if (selectedPhoto) {
				submitData.append('photo', selectedPhoto)
			}

			let res
			if (editingProgram) {
				res = await axios.put(
					`${BASE_URL}/api/program/update/${editingProgram._id}`,
					submitData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
							Authorization: `Bearer ${token}`,
						},
					}
				)
			} else {
				res = await axios.post(`${BASE_URL}/api/program/create`, submitData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${token}`,
					},
				})
			}

			if (res.data.success) {
				alert(`✅ Dastur ${editingProgram ? "yangilandi" : "yaratildi"}!`)
				resetForm()
				fetchPrograms()
				setShowForm(false)
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi!")
		} finally {
			setLoading(false)
		}
	}

	// 🗑️ Dasturni o'chirish
	const handleDelete = async (programId) => {
		if (!window.confirm("Haqiqatan ham bu dasturni o'chirmoqchimisiz?")) {
			return
		}

		try {
			const token = localStorage.getItem("token")
			const res = await axios.delete(`${BASE_URL}/api/program/delete/${programId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data.success) {
				alert("✅ Dastur o'chirildi!")
				fetchPrograms()
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
			photo: null
		})
		setSelectedPhoto(null)
		setPhotoPreview('')
		setEditingProgram(null)
	}

	// ❌ Formani yopish
	const handleCancel = () => {
		setShowForm(false)
		resetForm()
	}

	// 🗑️ Rasmni o'chirish
	const removePhotoPreview = () => {
		if (photoPreview.startsWith('blob:')) {
			URL.revokeObjectURL(photoPreview)
		}
		setPhotoPreview('')
		setSelectedPhoto(null)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Dasturlar Boshqaruvi</h1>
					<p className="text-gray-600">Yil dasturlarini boshqaring va yangilarini qo'shing</p>
				</div>

				{/* Search and Actions */}
				<div className="p-6 mb-8">
					<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
						{/* Search */}
						<div className="flex-1 w-full md:max-w-md">
							<div className="relative">
								<input
									type="text"
									placeholder="Dasturlarni qidirish..."
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
							<span>Yangi Dastur</span>
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
										{editingProgram ? "Dasturni Tahrirlash" : "Yangi Dastur Yaratish"}
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
											placeholder="O'zbekcha sarlavha..."
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
											placeholder='Ruscha sarlavha...'
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
											placeholder='Inglizcha sarlavha...'
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
											rows="4"
											placeholder="O'zbekcha tavsif..."
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
											rows="4"
											placeholder='Ruscha tavsif...'
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
											rows="4"
											placeholder='Inglizcha tavsif...'
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
								</div>

								{/* Photo */}
								<div className="space-y-4">
									<label className="block text-sm font-medium text-gray-700">Rasm</label>

									{photoPreview && (
										<div className="relative inline-block">
											<img
												src={photoPreview}
												alt="Preview"
												className="w-48 h-32 object-cover rounded-lg border"
											/>
											<button
												type="button"
												onClick={removePhotoPreview}
												className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
											>
												<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									)}

									<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
										<input
											type="file"
											accept="image/*"
											onChange={handlePhotoChange}
											className="hidden"
											id="photo-upload"
										/>
										<label htmlFor="photo-upload" className="cursor-pointer">
											<svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
											</svg>
											<p className="text-gray-600">Rasm tanlang</p>
											<p className="text-gray-500 text-sm">PNG, JPG, WEBP (Max: 5MB)</p>
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
											editingProgram ? "Yangilash" : "Yaratish"
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

				{/* Programs List */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* List Header */}
					<div className="text-black p-6">
						<h2 className="text-xl font-bold">Barcha Dasturlar</h2>
						<p className="text-black">
							{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredPrograms.length} ta` : `Jami: ${filteredPrograms.length} ta`}
						</p>
					</div>

					{/* Programs Items */}
					<div className="p-6">
						{filteredPrograms.length === 0 && !loading ? (
							<div className="text-center py-8">
								<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<h3 className="text-gray-600 mb-2">Dasturlar topilmadi</h3>
								<p className="text-gray-500 text-sm mb-4">
									{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi dasturni yarating"}
								</p>
								{!searchTerm && (
									<button
										onClick={handleAddNew}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
									>
										Yangi Dastur
									</button>
								)}
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredPrograms.map((program) => (
									<div key={program._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
										{/* Rasm */}
										<div className="h-48 overflow-hidden">
											<img
												src={`${BASE_URL}${program.photo}`}
												alt={program.title_uz}
												className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
												onError={(e) => {
													e.target.src = 'https://via.placeholder.com/400x200?text=Rasm+Yuklanmadi'
												}}
											/>
										</div>

										{/* Kontent */}
										<div className="p-4">
											<h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{program.title_uz}</h3>
											<p className="text-gray-600 text-sm mb-3 line-clamp-3">
												{program.description_uz}
											</p>
											<div className="flex items-center justify-between">
												<div className="text-xs text-gray-500">
													{new Date(program.createdAt).toLocaleDateString()}
												</div>
												<div className="flex space-x-2">
													<button
														onClick={() => handleEdit(program)}
														className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
														title="Tahrirlash"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
													<button
														onClick={() => handleDelete(program._id)}
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

export default ProgramsYear
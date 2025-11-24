import axios from 'axios'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const AdminLocations = () => {
	const [locations, setLocations] = useState([])
	const [filteredLocations, setFilteredLocations] = useState([])
	const [loading, setLoading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [editingLocation, setEditingLocation] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		address_uz: '',
		address_ru: '',
		address_en: '',
		phone: '',
		workHours_uz: '',
		workHours_ru: '',
		workHours_en: '',
		coord: ''
	})

	// 🌐 Barcha lokatsiyalarni olish
	useEffect(() => {
		fetchLocations()
	}, [])

	// 🔍 Qidiruvni boshqarish
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredLocations(locations)
		} else {
			const filtered = locations.filter(item =>
				item.title_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.address_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.address_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.address_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.phone?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredLocations(filtered)
		}
	}, [searchTerm, locations])

	const fetchLocations = async () => {
		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const res = await axios.get(`${BASE_URL}/api/location/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			// Agar ma'lumot bo'lsa olamiz, bo'lmasa bo'sh array qaytaramiz
			if (res.data && res.data.success) {
				setLocations(res.data.locations || [])
				setFilteredLocations(res.data.locations || [])
			} else {
				// Agar success false bo'lsa yoki ma'lumot bo'lmasa
				setLocations([])
				setFilteredLocations([])
			}
		} catch (err) {
			// 400 yoki boshqa xatolik bo'lsa, faqat console ga yozamiz, alert chiqarmaymiz
			console.log("Lokatsiyalarni olishda xatolik:", err.response?.data?.message || err.message)
			setLocations([])
			setFilteredLocations([])
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

	// ➕ Yangi lokatsiya qo'shish
	const handleAddNew = () => {
		setEditingLocation(null)
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			address_uz: '',
			address_ru: '',
			address_en: '',
			phone: '',
			workHours_uz: '',
			workHours_ru: '',
			workHours_en: '',
			coord: ''
		})
		setShowForm(true)
	}

	// ✏️ Lokatsiyani tahrirlash
	const handleEdit = (location) => {
		setEditingLocation(location)
		setFormData({
			title_uz: location.title_uz || '',
			title_ru: location.title_ru || '',
			title_en: location.title_en || '',
			address_uz: location.address_uz || '',
			address_ru: location.address_ru || '',
			address_en: location.address_en || '',
			phone: location.phone || '',
			workHours_uz: location.workHours_uz || '',
			workHours_ru: location.workHours_ru || '',
			workHours_en: location.workHours_en || '',
			coord: location.coord || ''
		})
		setShowForm(true)
	}

	// 📤 Formani yuborish
	const handleSubmit = async (e) => {
		e.preventDefault()

		// Koordinata formatini tekshirish
		if (formData.coord && !isValidCoordinate(formData.coord)) {
			alert("❌ Koordinata noto'g'ri formatda. Format: 41.311081, 69.240562")
			return
		}

		try {
			setLoading(true)
			const token = localStorage.getItem("token")

			const submitData = {
				title_uz: formData.title_uz,
				title_ru: formData.title_ru,
				title_en: formData.title_en,
				address_uz: formData.address_uz,
				address_ru: formData.address_ru,
				address_en: formData.address_en,
				phone: formData.phone,
				workHours_uz: formData.workHours_uz,
				workHours_ru: formData.workHours_ru,
				workHours_en: formData.workHours_en,
				coord: formData.coord
			}

			let res
			if (editingLocation) {
				res = await axios.put(
					`${BASE_URL}/api/location/update/${editingLocation._id}`,
					submitData,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)
			} else {
				res = await axios.post(`${BASE_URL}/api/location/create`, submitData, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
			}

			if (res.data.success) {
				alert(`✅ Lokatsiya ${editingLocation ? "yangilandi" : "yaratildi"}!`)
				resetForm()
				fetchLocations()
				setShowForm(false)
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi! " + (err.response?.data?.message || ''))
		} finally {
			setLoading(false)
		}
	}

	// 🗑️ Lokatsiyani o'chirish
	const handleDelete = async (locationId) => {
		if (!window.confirm("Haqiqatan ham bu lokatsiyani o'chirmoqchimisiz?")) {
			return
		}

		try {
			const token = localStorage.getItem("token")
			const res = await axios.delete(`${BASE_URL}/api/location/delete/${locationId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data.success) {
				alert("✅ Lokatsiya o'chirildi!")
				fetchLocations()
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
			address_uz: '',
			address_ru: '',
			address_en: '',
			phone: '',
			workHours_uz: '',
			workHours_ru: '',
			workHours_en: '',
			coord: ''
		})
		setEditingLocation(null)
	}

	// ❌ Formani yopish
	const handleCancel = () => {
		setShowForm(false)
		resetForm()
	}

	// 📍 Koordinata formatini tekshirish
	const isValidCoordinate = (coord) => {
		const coordRegex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/
		return coordRegex.test(coord)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="mx-auto">
				{/* Search and Actions */}
				<div className="p-6 mb-8">
					<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
						{/* Search */}
						<div className="flex-1 w-full md:max-w-md">
							<div className="relative">
								<input
									type="text"
									placeholder="Lokatsiyalarni qidirish..."
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
										{editingLocation ? "Lokatsiyani Tahrirlash" : "Yangi Lokatsiya Yaratish"}
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
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Nomi</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Nomi (O'zbekcha) *</label>
											<input
												type="text"
												name="title_uz"
												value={formData.title_uz}
												onChange={handleInputChange}
												placeholder="Bosh ofis"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Nomi (Ruscha) *</label>
											<input
												type="text"
												name="title_ru"
												value={formData.title_ru}
												onChange={handleInputChange}
												placeholder="Главный офис"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Nomi (Inglizcha) *</label>
											<input
												type="text"
												name="title_en"
												value={formData.title_en}
												onChange={handleInputChange}
												placeholder="Head Office"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
									</div>
								</div>

								{/* Addresses */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Manzil</h3>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Manzil (O'zbekcha) *</label>
											<textarea
												name="address_uz"
												value={formData.address_uz}
												onChange={handleInputChange}
												rows="2"
												placeholder="Samarqand shahri, Markaziy ko'cha 12"
												className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Manzil (Ruscha) *</label>
											<textarea
												name="address_ru"
												value={formData.address_ru}
												onChange={handleInputChange}
												rows="2"
												placeholder="Город Самарканд, Центральная улица 12"
												className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Manzil (Inglizcha) *</label>
											<textarea
												name="address_en"
												value={formData.address_en}
												onChange={handleInputChange}
												rows="2"
												placeholder="Samarkand city, Central street 12"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
									</div>
								</div>

								{/* Contact Info */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Aloqa ma'lumotlari</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Telefon raqami *</label>
											<input
												type="text"
												name="phone"
												value={formData.phone}
												onChange={handleInputChange}
												placeholder="+998 90 123 45 67"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Koordinatalar *</label>
											<div className="flex space-x-2">
												<input
													type="text"
													name="coord"
													value={formData.coord}
													onChange={handleInputChange}
													placeholder="41.311081, 69.240562"
													className="flex-1 px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
													required
												/>
											</div>
											<p className="text-xs text-gray-500 mt-1">Format: latitude, longitude (41.311081, 69.240562)</p>
										</div>
									</div>
								</div>

								{/* Work Hours */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Ish vaqti</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Ish vaqti (O'zbekcha) *</label>
											<input
												type="text"
												name="workHours_uz"
												value={formData.workHours_uz}
												onChange={handleInputChange}
												placeholder="Dushanba-Juma: 9:00-18:00"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Ish vaqti (Ruscha) *</label>
											<input
												type="text"
												name="workHours_ru"
												value={formData.workHours_ru}
												onChange={handleInputChange}
												placeholder="Пн-Пт: 9:00-18:00"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Ish vaqti (Inglizcha) *</label>
											<input
												type="text"
												name="workHours_en"
												value={formData.workHours_en}
												onChange={handleInputChange}
												placeholder="Mon-Fri: 9:00-18:00"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
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
											editingLocation ? "Yangilash" : "Yaratish"
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

				{/* Locations List */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* List Header */}
					<div className="text-black p-6">
						<h2 className="text-xl font-bold">Barcha Lokatsiyalar</h2>
						<p className="text-black">
							{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredLocations.length} ta` : `Jami: ${filteredLocations.length} ta`}
						</p>
					</div>

					{/* Locations Items */}
					<div className="p-6">
						{filteredLocations.length === 0 && !loading ? (
							<div className="text-center py-8">
								<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								<h3 className="text-gray-600 mb-2">Lokatsiyalar topilmadi</h3>
								<p className="text-gray-500 text-sm mb-4">
									{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi lokatsiyani yarating"}
								</p>
								{!searchTerm && (
									<button
										onClick={handleAddNew}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
									>
										Yangi Lokatsiya
									</button>
								)}
							</div>
						) : (
							<div className="space-y-4">
								{filteredLocations.map((location) => (
									<div key={location._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
										<div className="flex justify-between items-start">
											<div className="flex-1">
												{/* Title - Endi aniq ko'rinadi */}
												<div className="mb-3">
													<h3 className="font-semibold text-lg text-gray-800 mb-1">
														{location.title_uz || "Nomi yo'q"}
													</h3>
													<div className="flex flex-wrap gap-2 text-xs">
														{location.title_ru && (
															<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">RU: {location.title_ru}</span>
														)}
														{location.title_en && (
															<span className="bg-green-100 text-green-800 px-2 py-1 rounded">EN: {location.title_en}</span>
														)}
													</div>
												</div>

												{/* Ma'lumotlar gridi */}
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
													<div className="space-y-2">
														<div>
															<strong className="text-gray-700">Manzil (UZ):</strong>
															<p className="mt-1">{location.address_uz}</p>
														</div>
														<div>
															<strong className="text-gray-700">Telefon:</strong>
															<p className="mt-1">{location.phone}</p>
														</div>
													</div>
													<div className="space-y-2">
														<div>
															<strong className="text-gray-700">Ish vaqti (UZ):</strong>
															<p className="mt-1">{location.workHours_uz}</p>
														</div>
														<div>
															<strong className="text-gray-700">Koordinata:</strong>
															<p className="mt-1 font-mono text-xs">{location.coord}</p>
														</div>
													</div>
												</div>

												{/* Sana ma'lumotlari */}
												<div className="flex items-center space-x-4 text-xs text-gray-500 mt-3 pt-2 border-t">
													<span>Yaratilgan: {new Date(location.createdAt).toLocaleDateString()}</span>
													<span>Yangilangan: {new Date(location.updatedAt).toLocaleDateString()}</span>
												</div>
											</div>

											{/* Tahrirlash va o'chirish tugmalari */}
											<div className="flex space-x-2 ml-4">
												<button
													onClick={() => handleEdit(location)}
													className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
													title="Tahrirlash"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => handleDelete(location._id)}
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

export default AdminLocations
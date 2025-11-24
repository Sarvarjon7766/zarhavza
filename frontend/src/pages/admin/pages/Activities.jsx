import axios from 'axios'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const Activities = () => {
	const [activities, setActivities] = useState([])
	const [filteredActivities, setFilteredActivities] = useState([])
	const [loading, setLoading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [editingActivity, setEditingActivity] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		description_uz: '',
		description_ru: '',
		description_en: ''
	})

	// 🌐 Barcha activity ma'lumotlarini olish
	useEffect(() => {
		fetchActivities()
	}, [])

	// 🔍 Qidiruvni boshqarish
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredActivities(activities)
		} else {
			const filtered = activities.filter(item =>
				item.title_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.description_en?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredActivities(filtered)
		}
	}, [searchTerm, activities])

	const fetchActivities = async () => {
		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const res = await axios.get(`${BASE_URL}/api/activity/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			// Agar ma'lumot bo'lsa olamiz, bo'lmasa bo'sh array qaytaramiz
			if (res.data && res.data.success) {
				setActivities(res.data.activitys || [])
				setFilteredActivities(res.data.activitys || [])
			} else {
				// Agar success false bo'lsa yoki ma'lumot bo'lmasa
				setActivities([])
				setFilteredActivities([])
			}
		} catch (err) {
			// 400 yoki boshqa xatolik bo'lsa, faqat console ga yozamiz, alert chiqarmaymiz
			console.log("Activity ma'lumotlarini olishda xatolik:", err.response?.data?.message || err.message)
			setActivities([])
			setFilteredActivities([])
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

	// ➕ Yangi activity qo'shish
	const handleAddNew = () => {
		setEditingActivity(null)
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			description_uz: '',
			description_ru: '',
			description_en: ''
		})
		setShowForm(true)
	}

	// ✏️ Activity ni tahrirlash
	const handleEdit = (activity) => {
		setEditingActivity(activity)
		setFormData({
			title_uz: activity.title_uz || '',
			title_ru: activity.title_ru || '',
			title_en: activity.title_en || '',
			description_uz: activity.description_uz || '',
			description_ru: activity.description_ru || '',
			description_en: activity.description_en || ''
		})
		setShowForm(true)
	}

	// 📤 Formani yuborish
	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			setLoading(true)
			const token = localStorage.getItem("token")

			const submitData = {
				title_uz: formData.title_uz,
				title_ru: formData.title_ru,
				title_en: formData.title_en,
				description_uz: formData.description_uz,
				description_ru: formData.description_ru,
				description_en: formData.description_en
			}

			let res
			if (editingActivity) {
				res = await axios.put(
					`${BASE_URL}/api/activity/update/${editingActivity._id}`,
					submitData,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)
			} else {
				res = await axios.post(`${BASE_URL}/api/activity/create`, submitData, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
			}

			if (res.data.success) {
				alert(`✅ Faoliyat ${editingActivity ? "yangilandi" : "yaratildi"}!`)
				resetForm()
				fetchActivities()
				setShowForm(false)
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi! " + (err.response?.data?.message || ''))
		} finally {
			setLoading(false)
		}
	}

	// 🗑️ Activity ni o'chirish
	const handleDelete = async (activityId) => {
		if (!window.confirm("Haqiqatan ham bu faoliyatni o'chirmoqchimisiz?")) {
			return
		}

		try {
			const token = localStorage.getItem("token")
			const res = await axios.delete(`${BASE_URL}/api/activity/delete/${activityId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data.success) {
				alert("✅ Faoliyat o'chirildi!")
				fetchActivities()
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
			description_en: ''
		})
		setEditingActivity(null)
	}

	// ❌ Formani yopish
	const handleCancel = () => {
		setShowForm(false)
		resetForm()
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
									placeholder="Faoliyatlarni qidirish..."
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
										{editingActivity ? "Faoliyatni Tahrirlash" : "Yangi Faoliyat Yaratish"}
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
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Sarlavha</h3>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha (O'zbekcha) *</label>
											<input
												type="text"
												name="title_uz"
												value={formData.title_uz}
												onChange={handleInputChange}
												placeholder="Faoliyat sarlavhasi"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha (Ruscha) *</label>
											<input
												type="text"
												name="title_ru"
												value={formData.title_ru}
												onChange={handleInputChange}
												placeholder="Заголовок деятельности"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha (Inglizcha) *</label>
											<input
												type="text"
												name="title_en"
												value={formData.title_en}
												onChange={handleInputChange}
												placeholder="Activity title"
												className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
									</div>
								</div>

								{/* Descriptions */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Tavsif</h3>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Tavsif (O'zbekcha) *</label>
											<textarea
												name="description_uz"
												value={formData.description_uz}
												onChange={handleInputChange}
												rows="4"
												placeholder="Faoliyat tavsifi..."
												className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Tavsif (Ruscha) *</label>
											<textarea
												name="description_ru"
												value={formData.description_ru}
												onChange={handleInputChange}
												rows="4"
												placeholder="Описание деятельности..."
												className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Tavsif (Inglizcha) *</label>
											<textarea
												name="description_en"
												value={formData.description_en}
												onChange={handleInputChange}
												rows="4"
												placeholder="Activity description..."
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
											editingActivity ? "Yangilash" : "Yaratish"
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

				{/* Activities List */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* List Header */}
					<div className="text-black p-6">
						<h2 className="text-xl font-bold">Faoliyatlar</h2>
						<p className="text-black">
							{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredActivities.length} ta` : `Jami: ${filteredActivities.length} ta`}
						</p>
					</div>

					{/* Activity Items */}
					<div className="p-6">
						{filteredActivities.length === 0 && !loading ? (
							<div className="text-center py-8">
								<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
								</svg>
								<h3 className="text-gray-600 mb-2">Faoliyatlar topilmadi</h3>
								<p className="text-gray-500 text-sm mb-4">
									{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi faoliyatni yarating"}
								</p>
								{!searchTerm && (
									<button
										onClick={handleAddNew}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
									>
										Yangi Faoliyat
									</button>
								)}
							</div>
						) : (
							<div className="space-y-6">
								{filteredActivities.map((activity) => (
									<div key={activity._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
										<div className="flex justify-between items-start mb-4">
											<div className="flex-1">
												{/* Title */}
												<div className="mb-3">
													<h3 className="font-semibold text-lg text-gray-800 mb-2">
														{activity.title_uz || "Sarlavha yo'q"}
													</h3>
													<div className="flex flex-wrap gap-2 text-xs">
														{activity.title_ru && (
															<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">RU: {activity.title_ru}</span>
														)}
														{activity.title_en && (
															<span className="bg-green-100 text-green-800 px-2 py-1 rounded">EN: {activity.title_en}</span>
														)}
													</div>
												</div>

												{/* Descriptions */}
												<div className="space-y-4">
													<div>
														<strong className="text-gray-700 text-sm">Tavsif (O'zbekcha):</strong>
														<p className="mt-1 text-gray-600 text-sm leading-relaxed">
															{activity.description_uz}
														</p>
													</div>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														<div>
															<strong className="text-gray-700 text-sm">Tavsif (Ruscha):</strong>
															<p className="mt-1 text-gray-600 text-sm leading-relaxed">
																{activity.description_ru}
															</p>
														</div>
														<div>
															<strong className="text-gray-700 text-sm">Tavsif (Inglizcha):</strong>
															<p className="mt-1 text-gray-600 text-sm leading-relaxed">
																{activity.description_en}
															</p>
														</div>
													</div>
												</div>

												{/* Sana ma'lumotlari */}
												<div className="flex items-center space-x-4 text-xs text-gray-500 mt-4 pt-3 border-t">
													<span>Yaratilgan: {new Date(activity.createdAt).toLocaleDateString()}</span>
													<span>Yangilangan: {new Date(activity.updatedAt).toLocaleDateString()}</span>
												</div>
											</div>

											{/* Tahrirlash va o'chirish tugmalari */}
											<div className="flex space-x-2 ml-4">
												<button
													onClick={() => handleEdit(activity)}
													className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
													title="Tahrirlash"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => handleDelete(activity._id)}
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

export default Activities
import axios from "axios"
import { useEffect, useState } from "react"

const BASE_URL = import.meta.env.VITE_BASE_URL

const AdminBanner = () => {
	const [banners, setBanners] = useState([])
	const [photo, setPhoto] = useState(null)
	const [video, setVideo] = useState(null)
	const [isActive, setIsActive] = useState(false)
	const [loading, setLoading] = useState(false)
	const [photoPreview, setPhotoPreview] = useState(null)
	const [videoPreview, setVideoPreview] = useState(null)
	const [editingBanner, setEditingBanner] = useState(null)
	const [showForm, setShowForm] = useState(false) // Formani ko'rsatish/yashirish

	// 🌐 Barcha bannerlarni olish
	useEffect(() => {
		fetchBanners()
	}, [])

	const fetchBanners = async () => {
		try {
			const token = localStorage.getItem("token")
			const res = await axios.get(`${BASE_URL}/api/banner/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data?.banners) {
				setBanners(res.data.banners)
			}
		} catch (err) {
			console.error("Bannerlarni olishda xatolik:", err.message)
			alert("Bannerlarni yuklashda xatolik!")
		}
	}

	const handlePhotoChange = (e) => {
		const file = e.target.files[0]
		setPhoto(file)
		if (file) {
			const previewUrl = URL.createObjectURL(file)
			setPhotoPreview(previewUrl)
		} else {
			setPhotoPreview(null)
		}
	}

	const handleVideoChange = (e) => {
		const file = e.target.files[0]
		setVideo(file)
		if (file) {
			const previewUrl = URL.createObjectURL(file)
			setVideoPreview(previewUrl)
		} else {
			setVideoPreview(null)
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!photo && !video && !editingBanner) {
			alert("Iltimos, rasm yoki video tanlang!")
			return
		}

		const formData = new FormData()
		if (photo) formData.append("photo", photo)
		if (video) formData.append("video", video)
		formData.append("isActive", isActive)

		try {
			setLoading(true)
			const token = localStorage.getItem("token")

			let res
			if (editingBanner) {
				// 🔄 Yangilash
				res = await axios.put(
					`${BASE_URL}/api/banner/update/${editingBanner._id}`,
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
							Authorization: `Bearer ${token}`,
						},
					}
				)
			} else {
				// ➕ Yangi yaratish
				res = await axios.post(`${BASE_URL}/api/banner/create`, formData, {
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${token}`,
					},
				})
			}

			if (res.data.success) {
				alert(`Banner ${editingBanner ? "yangilandi" : "yaratildi"}!`)
				resetForm()
				fetchBanners()
				setShowForm(false)
			} else {
				alert(`Banner ${editingBanner ? "yangilash" : "yaratish"}da xatolik!`)
			}
		} catch (err) {
			console.error(err)
			alert("Xatolik yuz berdi!")
		} finally {
			setLoading(false)
		}
	}

	// 🗑️ Bannerni o'chirish
	const handleDelete = async (bannerId) => {
		if (!window.confirm("Haqiqatan ham bu bannerni o'chirmoqchimisiz?")) {
			return
		}

		try {
			const token = localStorage.getItem("token")
			const res = await axios.delete(`${BASE_URL}/api/banner/delete/${bannerId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data.success) {
				alert("Banner muvaffaqiyatli o'chirildi!")
				fetchBanners()
			} else {
				alert("Bannerni o'chirishda xatolik!")
			}
		} catch (err) {
			console.error(err)
			alert("Xatolik yuz berdi!")
		}
	}

	// ✏️ Bannerni tahrirlash uchun tayyorlash
	const handleEdit = (banner) => {
		setEditingBanner(banner)
		setIsActive(banner.isActive)
		setPhotoPreview(banner.photo ? `${BASE_URL}${banner.photo}` : null)
		setVideoPreview(banner.video ? `${BASE_URL}${banner.video}` : null)
		setShowForm(true)
	}

	// 🔄 Formani tozalash
	const resetForm = () => {
		setPhoto(null)
		setVideo(null)
		setIsActive(false)
		setPhotoPreview(null)
		setVideoPreview(null)
		setEditingBanner(null)
	}

	const clearPhoto = () => {
		setPhoto(null)
		setPhotoPreview(null)
	}

	const clearVideo = () => {
		setVideo(null)
		setVideoPreview(null)
	}

	// 🎯 Faol bannerni o'zgartirish
	const toggleActive = async (bannerId, currentStatus) => {
		try {
			const token = localStorage.getItem("token")
			const formData = new FormData()
			formData.append("isActive", !currentStatus)

			const res = await axios.put(
				`${BASE_URL}/api/banner/update/${bannerId}`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
						Authorization: `Bearer ${token}`,
					},
				}
			)

			if (res.data.success) {
				alert(`Banner ${!currentStatus ? "faollashtirildi" : "o'chirildi"}!`)
				fetchBanners()
			}
		} catch (err) {
			console.error(err)
			alert("Xatolik yuz berdi!")
		}
	}

	// ➕ Yangi banner qo'shish
	const handleAddNew = () => {
		resetForm()
		setShowForm(true)
	}

	// ❌ Formani yopish
	const handleCancel = () => {
		setShowForm(false)
		resetForm()
	}

	return (
		<div className="min-h-screen bg-gray-50 py-6 px-4">
			<div className="mx-auto">
				{/* Header Section */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Banner Boshqaruvi</h1>
					</div>
					<button
						onClick={handleAddNew}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						<span>Yangi Banner</span>
					</button>
				</div>

				{/* Create/Edit Form Modal */}
				{showForm && (
					<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
							<div className="bg-blue-600 p-4 sticky top-0">
								<div className="flex justify-between items-center">
									<h2 className="text-xl font-bold text-white">
										{editingBanner ? "Bannerni Tahrirlash" : "Yangi Banner Yaratish"}
									</h2>
									<button
										onClick={handleCancel}
										className="text-white hover:text-gray-200"
									>
										<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>

							<form onSubmit={handleSubmit} className="p-6 space-y-6">
								{/* Photo Upload Section */}
								<div className="space-y-3">
									<label className="block font-medium text-gray-700">
										Rasm Yuklash
									</label>

									{photoPreview ? (
										<div className="relative">
											<img
												src={photoPreview}
												alt="Preview"
												className="w-full h-48 object-cover rounded border"
											/>
											<button
												type="button"
												onClick={clearPhoto}
												className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									) : (
										<div className="border border-dashed border-gray-300 rounded p-4 text-center bg-gray-50">
											<input
												type="file"
												accept="image/*"
												onChange={handlePhotoChange}
												className="hidden"
												id="photo-upload"
											/>
											<label htmlFor="photo-upload" className="cursor-pointer">
												<p className="text-gray-600">Rasmni tanlang</p>
												<p className="text-gray-500 text-sm mt-1">PNG, JPG, WEBP (Max: 5MB)</p>
											</label>
										</div>
									)}
								</div>

								{/* Video Upload Section */}
								<div className="space-y-3">
									<label className="block font-medium text-gray-700">
										Video Yuklash
									</label>

									{videoPreview ? (
										<div className="relative">
											<video
												src={videoPreview}
												className="w-full h-48 object-cover rounded border"
												controls
											/>
											<button
												type="button"
												onClick={clearVideo}
												className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									) : (
										<div className="border border-dashed border-gray-300 rounded p-4 text-center bg-gray-50">
											<input
												type="file"
												accept="video/*"
												onChange={handleVideoChange}
												className="hidden"
												id="video-upload"
											/>
											<label htmlFor="video-upload" className="cursor-pointer">
												<p className="text-gray-600">Videoni tanlang</p>
												<p className="text-gray-500 text-sm mt-1">MP4, MOV, AVI (Max: 50MB)</p>
											</label>
										</div>
									)}
								</div>

								{/* Active Toggle */}
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
									<label htmlFor="active" className="font-medium text-gray-700 cursor-pointer">
										Bannerni Faollashtirish
									</label>
									<label className="relative inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											id="active"
											checked={isActive}
											onChange={(e) => setIsActive(e.target.checked)}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
									</label>
								</div>

								{/* Submit Button */}
								<div className="pt-4 flex space-x-3">
									<button
										type="submit"
										disabled={loading || (!photo && !video && !editingBanner)}
										className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
									>
										{loading ? (
											<>
												<svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
													<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
													<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
												</svg>
												<span>Yuklanmoqda...</span>
											</>
										) : (
											<span>{editingBanner ? "Bannerni Yangilash" : "Bannerni Saqlash"}</span>
										)}
									</button>
									<button
										type="button"
										onClick={handleCancel}
										className="px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 rounded"
									>
										Bekor qilish
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Banners List */}
				<div className="overflow-hidden">
					<div className="p-4">
						{banners.length === 0 ? (
							<div className="text-center py-8">
								<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<h3 className="text-lg font-medium text-gray-600 mb-2">Hali bannerlar mavjud emas</h3>
								<p className="text-gray-500 mb-4">Birinchi bannerni yaratish uchun "Yangi Banner" tugmasini bosing</p>
								<button
									onClick={handleAddNew}
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
								>
									Yangi Banner Yaratish
								</button>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{banners.map((banner) => (
									<div key={banner._id} className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
										<div className="relative">
											{banner.photo ? (
												<img
													src={`${BASE_URL}${banner.photo}`}
													alt="Banner"
													className="w-full h-40 object-cover"
												/>
											) : banner.video ? (
												<video
													src={`${BASE_URL}${banner.video}`}
													className="w-full h-40 object-cover"
													controls
												/>
											) : (
												<div className="w-full h-40 bg-gray-200 flex items-center justify-center">
													<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
													</svg>
												</div>
											)}
											<div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
												}`}>
												{banner.isActive ? 'Faol' : 'Nofaol'}
											</div>
										</div>

										<div className="p-3">
											<div className="flex justify-between items-center mb-2">
												<span className="text-xs text-gray-500">
													{new Date(banner.createdAt).toLocaleDateString()}
												</span>
												<span className="text-xs text-gray-500">
													{banner.photo ? 'Rasm' : 'Video'}
												</span>
											</div>

											<div className="flex space-x-2">
												<button
													onClick={() => handleEdit(banner)}
													className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs font-medium"
												>
													Tahrirlash
												</button>

												<button
													onClick={() => toggleActive(banner._id, banner.isActive)}
													className={`flex-1 py-1 px-2 rounded text-xs font-medium ${banner.isActive
														? 'bg-green-500 hover:bg-green-600 text-white'
														: 'bg-blue-500 hover:bg-blue-600 text-white'
														}`}
												>
													{banner.isActive ? "Faol" : 'Faollashtirish'}
												</button>

												<button
													onClick={() => handleDelete(banner._id)}
													className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs font-medium"
												>
													O'chirish
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

export default AdminBanner
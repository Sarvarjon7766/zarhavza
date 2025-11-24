import axios from 'axios'
import { useEffect, useState } from 'react'

const AdminLandArea = () => {
	const [areas, setAreas] = useState([])
	const [filteredAreas, setFilteredAreas] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [searchTerm, setSearchTerm] = useState('')

	// Form state for create/update
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		empty_area_uz: '',
		empty_area_ru: '',
		empty_area_en: '',
		total_area_uz: '',
		total_area_ru: '',
		total_area_en: '',
		photo: null
	})
	const [previewPhoto, setPreviewPhoto] = useState('')
	const [oldPhotoUrl, setOldPhotoUrl] = useState('')

	const [editingId, setEditingId] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('uz')

	const baseURL = import.meta.env.VITE_BASE_URL

	// Fetch all land areas
	const fetchAreas = async () => {
		setLoading(true)
		try {
			const response = await axios.get(`${baseURL}/api/landarea/getAll`)
			const areasData = response.data?.areas || []
			setAreas(areasData)
			setFilteredAreas(areasData)
			setError('')
		} catch (err) {
			console.error('Error fetching land areas:', err)
			if (err.response?.status !== 404) {
				setError('Maydonlarni yuklashda xatolik yuz berdi')
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchAreas()
	}, [])

	// Search functionality
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredAreas(areas)
		} else {
			const filtered = areas.filter(area =>
				area.title_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				area.title_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				area.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				area.empty_area_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				area.total_area_uz?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredAreas(filtered)
		}
	}, [searchTerm, areas])

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value
		})
	}

	// Handle file input changes
	const handleFileChange = (e) => {
		const { name, files } = e.target

		if (files && files[0]) {
			setFormData(prev => ({
				...prev,
				[name]: files[0]
			}))

			// Preview for photo
			if (name === 'photo') {
				const reader = new FileReader()
				reader.onload = (e) => {
					setPreviewPhoto(e.target.result)
				}
				reader.readAsDataURL(files[0])
			}
		}
	}

	// Reset form
	const resetForm = () => {
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			empty_area_uz: '',
			empty_area_ru: '',
			empty_area_en: '',
			total_area_uz: '',
			total_area_ru: '',
			total_area_en: '',
			photo: null
		})
		setPreviewPhoto('')
		setOldPhotoUrl('')
		setEditingId(null)
		setActiveTab('uz')
	}

	// Create new land area
	const handleCreate = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			const submitData = new FormData()

			// Append text fields
			Object.keys(formData).forEach(key => {
				if (formData[key] !== null) {
					submitData.append(key, formData[key])
				}
			})

			await axios.post(`${baseURL}/api/landarea/create`, submitData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})

			setSuccess('Maydon muvaffaqiyatli qo\'shildi')
			resetForm()
			setIsModalOpen(false)
			fetchAreas()
		} catch (err) {
			setError('Maydon qo\'shishda xatolik yuz berdi')
			console.error('Error creating land area:', err)
		} finally {
			setLoading(false)
		}
	}

	// Update land area
	const handleUpdate = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			const submitData = new FormData()

			// Append text fields
			Object.keys(formData).forEach(key => {
				if (formData[key] !== null) {
					submitData.append(key, formData[key])
				}
			})

			// Append old photo URL if exists (for deleting old photo)
			if (oldPhotoUrl) {
				submitData.append('oldPhotoUrl', oldPhotoUrl)
			}

			await axios.put(`${baseURL}/api/landarea/update/${editingId}`, submitData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})

			setSuccess('Maydon muvaffaqiyatli yangilandi')
			resetForm()
			setIsModalOpen(false)
			fetchAreas()
		} catch (err) {
			setError('Maydonni yangilashda xatolik yuz berdi')
			console.error('Error updating land area:', err)
		} finally {
			setLoading(false)
		}
	}

	// Delete land area
	const handleDelete = async (id) => {
		if (!window.confirm('Haqiqatan ham ushbu maydonni o\'chirmoqchimisiz?')) {
			return
		}

		setLoading(true)
		try {
			await axios.delete(`${baseURL}/api/landarea/delete/${id}`)
			setSuccess('Maydon muvaffaqiyatli o\'chirildi')
			fetchAreas()
		} catch (err) {
			setError('Maydonni o\'chirishda xatolik yuz berdi')
			console.error('Error deleting land area:', err)
		} finally {
			setLoading(false)
		}
	}

	// Edit land area - populate form with existing data
	const handleEdit = (area) => {
		setFormData({
			title_uz: area.title_uz || '',
			title_ru: area.title_ru || '',
			title_en: area.title_en || '',
			empty_area_uz: area.empty_area_uz || '',
			empty_area_ru: area.empty_area_ru || '',
			empty_area_en: area.empty_area_en || '',
			total_area_uz: area.total_area_uz || '',
			total_area_ru: area.total_area_ru || '',
			total_area_en: area.total_area_en || '',
			photo: null
		})
		setPreviewPhoto(area.photo ? `${baseURL}${area.photo}` : '')
		setOldPhotoUrl(area.photo || '')
		setEditingId(area._id)
		setIsModalOpen(true)
	}

	// Open modal for creating new land area
	const openCreateModal = () => {
		resetForm()
		setIsModalOpen(true)
	}

	// Close modal
	const closeModal = () => {
		setIsModalOpen(false)
		resetForm()
	}

	// Clear messages after 3 seconds
	useEffect(() => {
		if (success || error) {
			const timer = setTimeout(() => {
				setSuccess('')
				setError('')
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [success, error])

	// Truncate text for table view
	const truncateText = (text, length = 50) => {
		if (!text) return ''
		if (text.length <= length) return text
		return text.substring(0, length) + '...'
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div className="mx-auto">
				{/* Header */}
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
					<div className="mb-6 lg:mb-0">
						<h1 className="text-3xl font-bold text-gray-800 mb-2">
							Er Maydonlari
						</h1>
						<p className="text-gray-600">
							Sanoat zonasidagi er maydonlari ma'lumotlarini boshqaring
						</p>
					</div>
					<button
						className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
						onClick={openCreateModal}
						disabled={loading}
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						<span>Qo'shish</span>
					</button>
				</div>

				{/* Success/Error Messages */}
				{success && (
					<div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
						<div className="flex items-center">
							<svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							<span className="text-green-700 font-medium">{success}</span>
						</div>
					</div>
				)}
				{error && (
					<div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
						<div className="flex items-center">
							<svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
							</svg>
							<span className="text-red-700 font-medium">{error}</span>
						</div>
					</div>
				)}

				{/* Search Box */}
				<div className="mb-6">
					<div className="relative max-w-md">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							placeholder="Maydonlarni qidirish..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full text-black pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
						/>
						{searchTerm && (
							<button
								onClick={() => setSearchTerm('')}
								className="absolute inset-y-0 right-0 pr-3 flex items-center"
							>
								<svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						)}
					</div>
				</div>

				{/* Loading Indicator */}
				{loading && (
					<div className="flex justify-center items-center p-12 bg-white rounded-2xl shadow-lg mb-6">
						<div className="flex flex-col items-center space-y-4">
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
							<span className="text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</span>
						</div>
					</div>
				)}

				{/* Areas Table (Desktop) */}
				{filteredAreas.length > 0 ? (
					<div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gradient-to-r from-gray-50 to-orange-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
											#
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
											Maydon Nomi
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
											Bo'sh Maydon
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
											Jami Maydon
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[120px]">
											Rasm
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
											Amallar
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredAreas.map((area, index) => (
										<tr key={area._id} className="hover:bg-orange-50 transition-colors duration-200">
											{/* Number */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{index + 1}
												</div>
											</td>

											{/* Title */}
											<td className="px-4 py-3">
												<div className="group relative">
													<div className="text-sm font-semibold text-gray-900">
														{area.title_uz}
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{area.title_ru} / {area.title_en}
													</div>
													<div className="absolute invisible group-hover:visible z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
														<div className="font-medium mb-2">Maydon nomi:</div>
														<div><strong>UZ:</strong> {area.title_uz}</div>
														<div><strong>RU:</strong> {area.title_ru}</div>
														<div><strong>EN:</strong> {area.title_en}</div>
														<div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
													</div>
												</div>
											</td>

											{/* Empty Area */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm font-medium text-green-600">
													{area.empty_area_uz}
												</div>
												<div className="text-xs text-gray-500">
													{area.empty_area_ru} / {area.empty_area_en}
												</div>
											</td>

											{/* Total Area */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm font-medium text-blue-600">
													{area.total_area_uz}
												</div>
												<div className="text-xs text-gray-500">
													{area.total_area_ru} / {area.total_area_en}
												</div>
											</td>

											{/* Photo */}
											<td className="px-4 py-3">
												{area.photo ? (
													<div className="flex items-center space-x-2">
														<div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
															<img
																src={`${baseURL}${area.photo}`}
																alt={area.title_uz}
																className="w-full h-full object-cover"
															/>
														</div>
														<a
															href={`${baseURL}${area.photo}`}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:text-blue-800 text-sm"
														>
															Ko'rish
														</a>
													</div>
												) : (
													<span className="text-sm text-gray-500">Rasm yo'q</span>
												)}
											</td>

											{/* Actions */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex space-x-2 min-w-[140px]">
													<button
														className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center space-x-2 flex-1 justify-center"
														onClick={() => handleEdit(area)}
														disabled={loading}
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
														<span className="text-xs">Tahrir</span>
													</button>
													<button
														className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center space-x-2 flex-1 justify-center"
														onClick={() => handleDelete(area._id)}
														disabled={loading}
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
														<span className="text-xs">O'chirish</span>
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : (
					// Empty State
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<div className="max-w-md mx-auto">
							<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
								<svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-700 mb-2">
								{searchTerm ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Hozircha maydonlar mavjud emas'}
							</h3>
							<p className="text-gray-500 mb-6">
								{searchTerm ? 'Boshqa so\'zlar bilan qayta urinib ko\'ring' : 'Birinchi maydonni qo\'shish uchun "Yangi Maydon Qo\'shish" tugmasini bosing'}
							</p>
							{!searchTerm && (
								<button
									className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
									onClick={openCreateModal}
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									<span>Qo'shish</span>
								</button>
							)}
						</div>
					</div>
				)}

				{/* Areas Cards (Mobile) */}
				<div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					{filteredAreas.length > 0 && filteredAreas.map((area, index) => (
						<div key={area._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<div className="flex items-center space-x-2 mb-2">
											<div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
												{index + 1}
											</div>
										</div>
										<h3 className="text-lg font-bold text-gray-800 mb-2">
											{area.title_uz}
										</h3>
									</div>
									<div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
										M
									</div>
								</div>

								{/* Photo Preview */}
								{area.photo && (
									<div className="mb-4">
										<div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
											<img
												src={`${baseURL}${area.photo}`}
												alt={area.title_uz}
												className="w-full h-full object-cover"
											/>
										</div>
									</div>
								)}

								{/* Area Information */}
								<div className="grid grid-cols-2 gap-4 mb-4">
									<div className="bg-green-50 p-3 rounded-lg">
										<div className="text-sm font-medium text-green-800">Bo'sh Maydon</div>
										<div className="text-lg font-bold text-green-600">{area.empty_area_uz}</div>
									</div>
									<div className="bg-blue-50 p-3 rounded-lg">
										<div className="text-sm font-medium text-blue-800">Jami Maydon</div>
										<div className="text-lg font-bold text-blue-600">{area.total_area_uz}</div>
									</div>
								</div>

								{/* Language Tabs */}
								<div className="mb-4">
									<div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
										{['uz', 'ru', 'en'].map(lang => (
											<button
												key={lang}
												className={`flex-1 py-1 px-2 text-xs font-medium rounded-md transition-colors ${activeTab === lang
													? 'bg-white text-orange-600 shadow-sm'
													: 'text-gray-600 hover:text-gray-800'
													}`}
												onClick={() => setActiveTab(lang)}
											>
												{lang.toUpperCase()}
											</button>
										))}
									</div>

									<div className="mt-3 text-sm space-y-2">
										<div>
											<strong className="text-gray-800">Maydon nomi:</strong>
											<div className={activeTab === 'uz' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{area.title_uz}</p>
											</div>
											<div className={activeTab === 'ru' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{area.title_ru}</p>
											</div>
											<div className={activeTab === 'en' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{area.title_en}</p>
											</div>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex space-x-2 pt-4 border-t border-gray-200">
									<button
										className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
										onClick={() => handleEdit(area)}
										disabled={loading}
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										<span>Tahrirlash</span>
									</button>
									<button
										className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
										onClick={() => handleDelete(area._id)}
										disabled={loading}
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										<span>O'chirish</span>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Results Count */}
				{filteredAreas.length > 0 && (
					<div className="mt-4 text-sm text-gray-600">
						Topildi: {filteredAreas.length} ta maydon
						{searchTerm && ` ("${searchTerm}" bo'yicha)`}
					</div>
				)}
			</div>

			{/* Create/Edit Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div
						className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-3xl">
							<div>
								<h2 className="text-2xl font-bold text-gray-800">
									{editingId ? 'Maydonni Tahrirlash' : 'Yangi Maydon Qo\'shish'}
								</h2>
								<p className="text-gray-600 mt-1">
									{editingId ? 'Maydon ma\'lumotlarini yangilang' : 'Yangi maydon ma\'lumotlarini kiriting'}
								</p>
							</div>
							<button
								className="text-gray-400 hover:text-gray-600 text-2xl font-light bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
								onClick={closeModal}
							>
								×
							</button>
						</div>

						{/* Modal Form */}
						<form onSubmit={editingId ? handleUpdate : handleCreate} className="p-8">
							<div className="space-y-8">
								{/* Photo Upload */}
								<div className="bg-gradient-to-r from-blue-50 to-cyan-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
										Rasm Yuklash
									</h3>

									<div className="space-y-4">
										{/* Photo Preview */}
										{previewPhoto && (
											<div className="mb-4">
												<p className="text-sm font-medium text-gray-700 mb-2">Rasm ko'rinishi:</p>
												<div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
													<img
														src={previewPhoto}
														alt="Rasm ko'rinishi"
														className="w-full h-full object-contain"
													/>
												</div>
											</div>
										)}

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												{editingId ? 'Yangi rasm yuklash (ixtiyoriy)' : 'Rasm yuklash (majburiy)'}
											</label>
											<div className="flex items-center justify-center w-full">
												<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200">
													<div className="flex flex-col items-center justify-center pt-5 pb-6">
														<svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
														</svg>
														<p className="mb-2 text-sm text-gray-500">
															<span className="font-semibold">Rasmni yuklash uchun bosing</span>
														</p>
														<p className="text-xs text-gray-500">PNG, JPG, JPEG (Max: 5MB)</p>
													</div>
													<input
														type="file"
														name="photo"
														accept="image/*"
														onChange={handleFileChange}
														className="hidden"
														required={!editingId}
													/>
												</label>
											</div>
										</div>
									</div>
								</div>

								{/* Uzbek Section */}
								<div className="bg-gradient-to-r from-green-50 to-teal-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
										O'zbekcha Ma'lumotlar
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Maydon Nomi (O'zbekcha)
											</label>
											<input
												type="text"
												name="title_uz"
												value={formData.title_uz}
												onChange={handleInputChange}
												required
												placeholder="Maydon nomini kiriting"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Bo'sh Maydon (O'zbekcha)
												</label>
												<input
													type="text"
													name="empty_area_uz"
													value={formData.empty_area_uz}
													onChange={handleInputChange}
													required
													placeholder="150 gektar"
													className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Jami Maydon (O'zbekcha)
												</label>
												<input
													type="text"
													name="total_area_uz"
													value={formData.total_area_uz}
													onChange={handleInputChange}
													required
													placeholder="300 gektar"
													className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Russian Section */}
								<div className="bg-gradient-to-r from-purple-50 to-pink-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
										Ruscha Ma'lumotlar
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Maydon Nomi (Ruscha)
											</label>
											<input
												type="text"
												name="title_ru"
												value={formData.title_ru}
												onChange={handleInputChange}
												required
												placeholder="Введите название зоны"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Bo'sh Maydon (Ruscha)
												</label>
												<input
													type="text"
													name="empty_area_ru"
													value={formData.empty_area_ru}
													onChange={handleInputChange}
													required
													placeholder="150 гектаров"
													className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Jami Maydon (Ruscha)
												</label>
												<input
													type="text"
													name="total_area_ru"
													value={formData.total_area_ru}
													onChange={handleInputChange}
													required
													placeholder="300 гектаров"
													className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
												/>
											</div>
										</div>
									</div>
								</div>

								{/* English Section */}
								<div className="bg-gradient-to-r from-orange-50 to-amber-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
										Inglizcha Ma'lumotlar
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Maydon Nomi (Inglizcha)
											</label>
											<input
												type="text"
												name="title_en"
												value={formData.title_en}
												onChange={handleInputChange}
												required
												placeholder="Enter zone name"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Bo'sh Maydon (Inglizcha)
												</label>
												<input
													type="text"
													name="empty_area_en"
													value={formData.empty_area_en}
													onChange={handleInputChange}
													required
													placeholder="150 hectares"
													className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
												/>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Jami Maydon (Inglizcha)
												</label>
												<input
													type="text"
													name="total_area_en"
													value={formData.total_area_en}
													onChange={handleInputChange}
													required
													placeholder="300 hectares"
													className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Modal Actions */}
							<div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
								<button
									type="button"
									onClick={closeModal}
									className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
									disabled={loading}
								>
									Bekor qilish
								</button>
								<button
									type="submit"
									disabled={loading || !formData.title_uz || !formData.title_ru || !formData.title_en || !formData.empty_area_uz || !formData.empty_area_ru || !formData.empty_area_en || !formData.total_area_uz || !formData.total_area_ru || !formData.total_area_en || (!editingId && !formData.photo)}
									className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center space-x-2"
								>
									{loading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
											<span>
												{editingId ? 'Yangilanmoqda...' : 'Qo\'shilmoqda...'}
											</span>
										</>
									) : (
										<>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											<span>
												{editingId ? 'Yangilash' : 'Qo\'shish'}
											</span>
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

export default AdminLandArea
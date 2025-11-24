import axios from 'axios'
import { useEffect, useState } from 'react'

const AdminRekvizit = () => {
	const [rekvizits, setRekvizits] = useState([])
	const [filteredRekvizits, setFilteredRekvizits] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [searchTerm, setSearchTerm] = useState('')

	// Form state for create/update
	const [formData, setFormData] = useState({
		location_uz: '',
		location_ru: '',
		location_en: '',
		faks_number: '',
		phone_number: '',
		description_uz: '',
		description_ru: '',
		description_en: ''
	})

	const [editingId, setEditingId] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('uz')

	const baseURL = import.meta.env.VITE_BASE_URL

	// Fetch all rekvizits
	const fetchRekvizits = async () => {
		setLoading(true)
		try {
			const response = await axios.get(`${baseURL}/api/rekvizit/getAll`)
			setRekvizits(response.data?.rekvizits || [])
			setFilteredRekvizits(response.data?.rekvizits || [])
			setError('')
		} catch (err) {
			console.error('Error fetching rekvizits:', err)
			setError('Rekvizitlarni yuklashda xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchRekvizits()
	}, [])

	// Search functionality
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredRekvizits(rekvizits)
		} else {
			const filtered = rekvizits.filter(rekvizit =>
				rekvizit.location_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				rekvizit.location_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				rekvizit.location_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				rekvizit.faks_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				rekvizit.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				rekvizit.description_uz?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredRekvizits(filtered)
		}
	}, [searchTerm, rekvizits])

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData({
			...formData,
			[name]: value
		})
	}

	// Reset form
	const resetForm = () => {
		setFormData({
			location_uz: '',
			location_ru: '',
			location_en: '',
			faks_number: '',
			phone_number: '',
			description_uz: '',
			description_ru: '',
			description_en: ''
		})
		setEditingId(null)
		setActiveTab('uz')
	}

	// Create new rekvizit
	const handleCreate = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await axios.post(`${baseURL}/api/rekvizit/create`, formData)

			setSuccess('Rekvizit muvaffaqiyatli qo\'shildi')
			resetForm()
			setIsModalOpen(false)
			fetchRekvizits()
		} catch (err) {
			setError('Rekvizit qo\'shishda xatolik yuz berdi')
			console.error('Error creating rekvizit:', err)
		} finally {
			setLoading(false)
		}
	}

	// Update rekvizit
	const handleUpdate = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await axios.put(`${baseURL}/api/rekvizit/update/${editingId}`, formData)

			setSuccess('Rekvizit muvaffaqiyatli yangilandi')
			resetForm()
			setIsModalOpen(false)
			fetchRekvizits()
		} catch (err) {
			setError('Rekvizitni yangilashda xatolik yuz berdi')
			console.error('Error updating rekvizit:', err)
		} finally {
			setLoading(false)
		}
	}

	// Delete rekvizit
	const handleDelete = async (id) => {
		if (!window.confirm('Haqiqatan ham ushbu rekvizitni o\'chirmoqchimisiz?')) {
			return
		}

		setLoading(true)
		try {
			await axios.delete(`${baseURL}/api/rekvizit/delete/${id}`)
			setSuccess('Rekvizit muvaffaqiyatli o\'chirildi')
			fetchRekvizits()
		} catch (err) {
			setError('Rekvizitni o\'chirishda xatolik yuz berdi')
			console.error('Error deleting rekvizit:', err)
		} finally {
			setLoading(false)
		}
	}

	// Edit rekvizit - populate form with existing data
	const handleEdit = (rekvizit) => {
		setFormData({
			location_uz: rekvizit.location_uz || '',
			location_ru: rekvizit.location_ru || '',
			location_en: rekvizit.location_en || '',
			faks_number: rekvizit.faks_number || '',
			phone_number: rekvizit.phone_number || '',
			description_uz: rekvizit.description_uz || '',
			description_ru: rekvizit.description_ru || '',
			description_en: rekvizit.description_en || ''
		})
		setEditingId(rekvizit._id)
		setIsModalOpen(true)
	}

	// Open modal for creating new rekvizit
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

	// Format phone number for display
	const formatPhoneNumber = (phone) => {
		if (!phone) return ''
		return phone.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
	}

	// Truncate text for table view
	const truncateText = (text, length = 50) => {
		if (!text) return ''
		if (text.length <= length) return text
		return text.substring(0, length) + '...'
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
			<div className="mx-auto">
				{/* Header */}
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
					<div className="mb-6 lg:mb-0">
						<h1 className="text-3xl font-bold text-gray-800 mb-2">
							Rekvizitlar
						</h1>
					</div>
					<button
						className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
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
							placeholder="Rekvizitlarni qidirish..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full text-black pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
							<span className="text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</span>
						</div>
					</div>
				)}

				{/* Rekvizits Table (Desktop) */}
				<div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gradient-to-r from-gray-50 to-purple-50">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
										#
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[150px]">
										Manzil
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
										Telefon
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
										Faks
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
										Tavsif
									</th>
									<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
										Amallar
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredRekvizits.length > 0 ? (
									filteredRekvizits.map((rekvizit, index) => (
										<tr key={rekvizit._id} className="hover:bg-purple-50 transition-colors duration-200">
											{/* Number */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{index + 1}
												</div>
											</td>

											{/* Location */}
											<td className="px-4 py-3">
												<div className="group relative">
													<div className="text-sm font-semibold text-gray-900">
														{rekvizit.location_uz}
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{rekvizit.location_ru} / {rekvizit.location_en}
													</div>
													<div className="absolute invisible group-hover:visible z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
														<div className="font-medium mb-2">Manzil:</div>
														<div><strong>UZ:</strong> {rekvizit.location_uz}</div>
														<div><strong>RU:</strong> {rekvizit.location_ru}</div>
														<div><strong>EN:</strong> {rekvizit.location_en}</div>
														<div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
													</div>
												</div>
											</td>

											{/* Phone Number */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex items-center space-x-2">
													<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
													</svg>
													<a
														href={`tel:${rekvizit.phone_number}`}
														className="text-blue-600 hover:text-blue-800 text-sm font-medium"
													>
														{formatPhoneNumber(rekvizit.phone_number)}
													</a>
												</div>
											</td>

											{/* Fax Number */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex items-center space-x-2">
													<svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
													</svg>
													<span className="text-sm text-gray-700">
														{formatPhoneNumber(rekvizit.faks_number)}
													</span>
												</div>
											</td>

											{/* Description */}
											<td className="px-4 py-3">
												<div className="group relative">
													<div className="text-sm text-gray-600 break-words max-w-[300px] line-clamp-2">
														{truncateText(rekvizit.description_uz, 80)}
													</div>
													{rekvizit.description_uz && rekvizit.description_uz.length > 80 && (
														<div className="absolute invisible group-hover:visible z-10 bottom-full left-0 mb-2 w-96 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
															<div className="font-medium mb-2">Tavsif:</div>
															<div><strong>UZ:</strong> {rekvizit.description_uz}</div>
															<div><strong>RU:</strong> {rekvizit.description_ru}</div>
															<div><strong>EN:</strong> {rekvizit.description_en}</div>
															<div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
														</div>
													)}
												</div>
											</td>

											{/* Actions */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex space-x-2 min-w-[140px]">
													<button
														className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center space-x-2 flex-1 justify-center"
														onClick={() => handleEdit(rekvizit)}
														disabled={loading}
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
														<span className="text-xs">Tahrir</span>
													</button>
													<button
														className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center space-x-2 flex-1 justify-center"
														onClick={() => handleDelete(rekvizit._id)}
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
									))
								) : (
									<tr>
										<td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
											{searchTerm ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Hech qanday rekvizit topilmadi'}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Rekvizits Cards (Mobile) */}
				<div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
					{filteredRekvizits.length > 0 ? (
						filteredRekvizits.map((rekvizit, index) => (
							<div key={rekvizit._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
								<div className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<div className="flex items-center space-x-2 mb-2">
												<div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
													{index + 1}
												</div>
												<div className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded-full">
													ID: {rekvizit._id.substring(0, 8)}...
												</div>
											</div>
											<h3 className="text-lg font-bold text-gray-800 mb-2">
												{rekvizit.location_uz}
											</h3>
										</div>
										<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
											R
										</div>
									</div>

									{/* Contact Info */}
									<div className="space-y-3 mb-4">
										<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
											<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
											</svg>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-700">Telefon</p>
												<a
													href={`tel:${rekvizit.phone_number}`}
													className="text-green-600 hover:text-green-700 text-sm truncate block"
												>
													{formatPhoneNumber(rekvizit.phone_number)}
												</a>
											</div>
										</div>

										<div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
											<svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
											</svg>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-700">Faks</p>
												<p className="text-purple-600 text-sm">
													{formatPhoneNumber(rekvizit.faks_number)}
												</p>
											</div>
										</div>
									</div>

									{/* Language Tabs */}
									<div className="mb-4">
										<div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
											{['uz', 'ru', 'en'].map(lang => (
												<button
													key={lang}
													className={`flex-1 py-1 px-2 text-xs font-medium rounded-md transition-colors ${activeTab === lang
														? 'bg-white text-purple-600 shadow-sm'
														: 'text-gray-600 hover:text-gray-800'
														}`}
													onClick={() => setActiveTab(lang)}
												>
													{lang.toUpperCase()}
												</button>
											))}
										</div>

										<div className="mt-3 text-sm">
											<div className={activeTab === 'uz' ? 'block' : 'hidden'}>
												<strong className="text-gray-800">Tavsif:</strong>
												<p className="text-gray-600 mt-1">{rekvizit.description_uz}</p>
											</div>
											<div className={activeTab === 'ru' ? 'block' : 'hidden'}>
												<strong className="text-gray-800">Описание:</strong>
												<p className="text-gray-600 mt-1">{rekvizit.description_ru}</p>
											</div>
											<div className={activeTab === 'en' ? 'block' : 'hidden'}>
												<strong className="text-gray-800">Description:</strong>
												<p className="text-gray-600 mt-1">{rekvizit.description_en}</p>
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className="flex space-x-2 pt-4 border-t border-gray-200">
										<button
											className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
											onClick={() => handleEdit(rekvizit)}
											disabled={loading}
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
											<span>Tahrirlash</span>
										</button>
										<button
											className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
											onClick={() => handleDelete(rekvizit._id)}
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
						))
					) : (
						// Empty State
						<div className="col-span-full text-center py-16 px-6 bg-white rounded-2xl shadow-lg">
							<div className="max-w-md mx-auto">
								<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
									<svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-gray-700 mb-2">
									{searchTerm ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Hech qanday rekvizit topilmadi'}
								</h3>
								<p className="text-gray-500 mb-6">
									{searchTerm ? 'Boshqa so\'zlar bilan qayta urinib ko\'ring' : 'Hozircha rekvizitlar mavjud emas. Birinchi rekvizitni qo\'shing!'}
								</p>
								{!searchTerm && (
									<button
										className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
										onClick={openCreateModal}
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
										</svg>
										<span>Birinchi Rekvizitni Qo'shish</span>
									</button>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Results Count */}
				{filteredRekvizits.length > 0 && (
					<div className="mt-4 text-sm text-gray-600">
						Topildi: {filteredRekvizits.length} ta rekvizit
						{searchTerm && ` ("${searchTerm}" bo'yicha)`}
					</div>
				)}
			</div>

			{/* Create/Edit Modal */}
			{isModalOpen && (
				<div className="fixed inset-0  bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div
						className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Modal Header */}
						<div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-3xl">
							<div>
								<h2 className="text-2xl font-bold text-gray-800">
									{editingId ? 'Rekvizitni Tahrirlash' : 'Yangi Rekvizit Qo\'shish'}
								</h2>
								<p className="text-gray-600 mt-1">
									{editingId ? 'Rekvizit ma\'lumotlarini yangilang' : 'Yangi rekvizit ma\'lumotlarini kiriting'}
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
								{/* Contact Information */}
								<div className="bg-gradient-to-r from-blue-50 to-cyan-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
										Kontakt Ma'lumotlari
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Telefon Raqami
											</label>
											<input
												type="tel"
												name="phone_number"
												value={formData.phone_number}
												onChange={handleInputChange}
												required
												placeholder="+998 XX XXX XX XX"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Faks Raqami
											</label>
											<input
												type="tel"
												name="faks_number"
												value={formData.faks_number}
												onChange={handleInputChange}
												required
												placeholder="+998 XX XXX XX XX"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
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
												Manzil (O'zbekcha)
											</label>
											<input
												type="text"
												name="location_uz"
												value={formData.location_uz}
												onChange={handleInputChange}
												required
												placeholder="Manzilni kiriting"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Tavsif (O'zbekcha)
											</label>
											<textarea
												name="description_uz"
												value={formData.description_uz}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Ish vaqti va boshqa ma'lumotlarni kiriting"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
											/>
										</div>
									</div>
								</div>

								{/* Russian Section */}
								<div className="bg-gradient-to-r from-yellow-50 to-amber-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
										Ruscha Ma'lumotlar
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Manzil (Ruscha)
											</label>
											<input
												type="text"
												name="location_ru"
												value={formData.location_ru}
												onChange={handleInputChange}
												required
												placeholder="Введите адрес"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Tavsif (Ruscha)
											</label>
											<textarea
												name="description_ru"
												value={formData.description_ru}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Введите рабочее время и другую информацию"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
											/>
										</div>
									</div>
								</div>

								{/* English Section */}
								<div className="bg-gradient-to-r from-red-50 to-pink-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
										Inglizcha Ma'lumotlar
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Manzil (Inglizcha)
											</label>
											<input
												type="text"
												name="location_en"
												value={formData.location_en}
												onChange={handleInputChange}
												required
												placeholder="Enter address"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Tavsif (Inglizcha)
											</label>
											<textarea
												name="description_en"
												value={formData.description_en}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Enter working hours and other information"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
											/>
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
									disabled={loading || !formData.location_uz || !formData.location_ru || !formData.location_en || !formData.phone_number || !formData.faks_number || !formData.description_uz || !formData.description_ru || !formData.description_en}
									className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center space-x-2"
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

export default AdminRekvizit
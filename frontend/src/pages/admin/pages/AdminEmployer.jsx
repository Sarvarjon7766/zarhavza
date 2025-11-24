import axios from 'axios'
import { useEffect, useState } from 'react'

const AdminEmployer = () => {
	const [employers, setEmployers] = useState([])
	const [filteredEmployers, setFilteredEmployers] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [searchTerm, setSearchTerm] = useState('')

	// Form state for create/update
	const [formData, setFormData] = useState({
		fullName_uz: '',
		fullName_ru: '',
		fullName_en: '',
		position_uz: '',
		position_ru: '',
		position_en: '',
		phone: ''
	})

	const [editingId, setEditingId] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('uz')

	const baseURL = import.meta.env.VITE_BASE_URL

	// Fetch all employers
	const fetchEmployers = async () => {
		setLoading(true)
		try {
			const response = await axios.get(`${baseURL}/api/employer/getAll`)
			const employersData = response.data?.employers || []
			setEmployers(employersData)
			setFilteredEmployers(employersData)
			setError('')
		} catch (err) {
			console.error('Error fetching employers:', err)
			if (err.response?.status !== 404) {
				setError('Xodimlarni yuklashda xatolik yuz berdi')
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchEmployers()
	}, [])

	// Search functionality
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredEmployers(employers)
		} else {
			const filtered = employers.filter(employer =>
				employer.fullName_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employer.fullName_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employer.fullName_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employer.position_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employer.position_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employer.position_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				employer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredEmployers(filtered)
		}
	}, [searchTerm, employers])

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
			fullName_uz: '',
			fullName_ru: '',
			fullName_en: '',
			position_uz: '',
			position_ru: '',
			position_en: '',
			phone: ''
		})
		setEditingId(null)
		setActiveTab('uz')
	}

	// Create new employer
	const handleCreate = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await axios.post(`${baseURL}/api/employer/create`, formData)

			setSuccess('Xodim muvaffaqiyatli qo\'shildi')
			resetForm()
			setIsModalOpen(false)
			fetchEmployers()
		} catch (err) {
			setError('Xodim qo\'shishda xatolik yuz berdi')
			console.error('Error creating employer:', err)
		} finally {
			setLoading(false)
		}
	}

	// Update employer
	const handleUpdate = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await axios.put(`${baseURL}/api/employer/update/${editingId}`, formData)

			setSuccess('Xodim muvaffaqiyatli yangilandi')
			resetForm()
			setIsModalOpen(false)
			fetchEmployers()
		} catch (err) {
			setError('Xodimni yangilashda xatolik yuz berdi')
			console.error('Error updating employer:', err)
		} finally {
			setLoading(false)
		}
	}

	// Delete employer
	const handleDelete = async (id) => {
		if (!window.confirm('Haqiqatan ham ushbu xodimni o\'chirmoqchimisiz?')) {
			return
		}

		setLoading(true)
		try {
			await axios.delete(`${baseURL}/api/employer/delete/${id}`)
			setSuccess('Xodim muvaffaqiyatli o\'chirildi')
			fetchEmployers()
		} catch (err) {
			setError('Xodimni o\'chirishda xatolik yuz berdi')
			console.error('Error deleting employer:', err)
		} finally {
			setLoading(false)
		}
	}

	// Edit employer - populate form with existing data
	const handleEdit = (employer) => {
		setFormData({
			fullName_uz: employer.fullName_uz || '',
			fullName_ru: employer.fullName_ru || '',
			fullName_en: employer.fullName_en || '',
			position_uz: employer.position_uz || '',
			position_ru: employer.position_ru || '',
			position_en: employer.position_en || '',
			phone: employer.phone || ''
		})
		setEditingId(employer._id)
		setIsModalOpen(true)
	}

	// Open modal for creating new employer
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

	// Format date
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('uz-UZ', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

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
							Xodimlar
						</h1>
					</div>
					<button
						className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
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
							placeholder="Xodimlarni qidirish..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full text-black pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
							<span className="text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</span>
						</div>
					</div>
				)}

				{/* Employers Table (Desktop) */}
				{filteredEmployers.length > 0 ? (
					<div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gradient-to-r from-gray-50 to-blue-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
											#
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
											F.I.Sh
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[250px]">
											Lavozim
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
											Telefon
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
											Qo'shilgan sana
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
											Amallar
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredEmployers.map((employer, index) => (
										<tr key={employer._id} className="hover:bg-blue-50 transition-colors duration-200">
											{/* Number */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{index + 1}
												</div>
											</td>

											{/* Full Name */}
											<td className="px-4 py-3">
												<div className="group relative">
													<div className="text-sm font-semibold text-gray-900">
														{employer.fullName_uz}
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{employer.fullName_ru} / {employer.fullName_en}
													</div>
													<div className="absolute invisible group-hover:visible z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
														<div className="font-medium mb-2">To'liq ism:</div>
														<div><strong>UZ:</strong> {employer.fullName_uz}</div>
														<div><strong>RU:</strong> {employer.fullName_ru}</div>
														<div><strong>EN:</strong> {employer.fullName_en}</div>
														<div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
													</div>
												</div>
											</td>

											{/* Position */}
											<td className="px-4 py-3">
												<div className="group relative">
													<div className="text-sm text-gray-600 break-words max-w-[300px] line-clamp-2">
														{truncateText(employer.position_uz, 80)}
													</div>
													{employer.position_uz && employer.position_uz.length > 80 && (
														<div className="absolute invisible group-hover:visible z-10 bottom-full left-0 mb-2 w-96 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
															<div className="font-medium mb-2">Lavozim:</div>
															<div><strong>UZ:</strong> {employer.position_uz}</div>
															<div><strong>RU:</strong> {employer.position_ru}</div>
															<div><strong>EN:</strong> {employer.position_en}</div>
															<div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
														</div>
													)}
												</div>
											</td>

											{/* Phone Number */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex items-center space-x-2">
													<svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
													</svg>
													<a
														href={`tel:${employer.phone}`}
														className="text-blue-600 hover:text-blue-800 text-sm font-medium"
													>
														{formatPhoneNumber(employer.phone)}
													</a>
												</div>
											</td>

											{/* Created Date */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm text-gray-500">
													{formatDate(employer.createdAt)}
												</div>
											</td>

											{/* Actions */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex space-x-2 min-w-[140px]">
													<button
														className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center space-x-2 flex-1 justify-center"
														onClick={() => handleEdit(employer)}
														disabled={loading}
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
														<span className="text-xs">Tahrir</span>
													</button>
													<button
														className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center space-x-2 flex-1 justify-center"
														onClick={() => handleDelete(employer._id)}
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
							<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
								<svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-700 mb-2">
								{searchTerm ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Hozircha xodimlar mavjud emas'}
							</h3>
							<p className="text-gray-500 mb-6">
								{searchTerm ? 'Boshqa so\'zlar bilan qayta urinib ko\'ring' : 'Birinchi xodimni qo\'shish uchun "Yangi Xodim Qo\'shish" tugmasini bosing'}
							</p>
							{!searchTerm && (
								<button
									className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
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

				{/* Employers Cards (Mobile) */}
				<div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					{filteredEmployers.length > 0 && filteredEmployers.map((employer, index) => (
						<div key={employer._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<div className="flex items-center space-x-2 mb-2">
											<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
												{index + 1}
											</div>
											<div className="text-xs text-gray-500">
												{formatDate(employer.createdAt)}
											</div>
										</div>
										<h3 className="text-lg font-bold text-gray-800 mb-2">
											{employer.fullName_uz}
										</h3>
									</div>
									<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
										X
									</div>
								</div>

								{/* Contact Info */}
								<div className="mb-4">
									<div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
										<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
										</svg>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-700">Telefon</p>
											<a
												href={`tel:${employer.phone}`}
												className="text-green-600 hover:text-green-700 text-sm truncate block"
											>
												{formatPhoneNumber(employer.phone)}
											</a>
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
													? 'bg-white text-blue-600 shadow-sm'
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
											<strong className="text-gray-800">Lavozim:</strong>
											<p className="text-gray-600 mt-1">{employer.position_uz}</p>
										</div>
										<div className={activeTab === 'ru' ? 'block' : 'hidden'}>
											<strong className="text-gray-800">Должность:</strong>
											<p className="text-gray-600 mt-1">{employer.position_ru}</p>
										</div>
										<div className={activeTab === 'en' ? 'block' : 'hidden'}>
											<strong className="text-gray-800">Position:</strong>
											<p className="text-gray-600 mt-1">{employer.position_en}</p>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex space-x-2 pt-4 border-t border-gray-200">
									<button
										className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
										onClick={() => handleEdit(employer)}
										disabled={loading}
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										<span>Tahrirlash</span>
									</button>
									<button
										className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
										onClick={() => handleDelete(employer._id)}
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
				{filteredEmployers.length > 0 && (
					<div className="mt-4 text-sm text-gray-600">
						Topildi: {filteredEmployers.length} ta xodim
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
						<div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
							<div>
								<h2 className="text-2xl font-bold text-gray-800">
									{editingId ? 'Xodimni Tahrirlash' : 'Yangi Xodim Qo\'shish'}
								</h2>
								<p className="text-gray-600 mt-1">
									{editingId ? 'Xodim ma\'lumotlarini yangilang' : 'Yangi xodim ma\'lumotlarini kiriting'}
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
								<div className="bg-gradient-to-r from-green-50 to-teal-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
										Asosiy Ma'lumotlar
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Telefon Raqami
											</label>
											<input
												type="tel"
												name="phone"
												value={formData.phone}
												onChange={handleInputChange}
												required
												placeholder="+998 XX XXX XX XX"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>
									</div>
								</div>

								{/* Uzbek Section */}
								<div className="bg-gradient-to-r from-blue-50 to-cyan-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
										O'zbekcha Ma'lumotlar
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												To'liq Ism (O'zbekcha)
											</label>
											<input
												type="text"
												name="fullName_uz"
												value={formData.fullName_uz}
												onChange={handleInputChange}
												required
												placeholder="Familiya Ism Sharif"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Lavozim (O'zbekcha)
											</label>
											<textarea
												name="position_uz"
												value={formData.position_uz}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Lavozim nomini kiriting"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
											/>
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
												To'liq Ism (Ruscha)
											</label>
											<input
												type="text"
												name="fullName_ru"
												value={formData.fullName_ru}
												onChange={handleInputChange}
												required
												placeholder="Фамилия Имя Отчество"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Lavozim (Ruscha)
											</label>
											<textarea
												name="position_ru"
												value={formData.position_ru}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Введите название должности"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
											/>
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
												To'liq Ism (Inglizcha)
											</label>
											<input
												type="text"
												name="fullName_en"
												value={formData.fullName_en}
												onChange={handleInputChange}
												required
												placeholder="Full Name"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Lavozim (Inglizcha)
											</label>
											<textarea
												name="position_en"
												value={formData.position_en}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Enter position title"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
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
									disabled={loading || !formData.fullName_uz || !formData.fullName_ru || !formData.fullName_en || !formData.position_uz || !formData.position_ru || !formData.position_en || !formData.phone}
									className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center space-x-2"
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

export default AdminEmployer
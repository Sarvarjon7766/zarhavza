import axios from 'axios'
import { useEffect, useState } from 'react'

const AdminProjectOngoing = () => {
	const [projects, setProjects] = useState([])
	const [filteredProjects, setFilteredProjects] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [searchTerm, setSearchTerm] = useState('')

	// Form state for create/update
	const [formData, setFormData] = useState({
		companyName_uz: '',
		companyName_ru: '',
		companyName_en: '',
		projectName_uz: '',
		projectName_ru: '',
		projectName_en: '',
		contact_uz: '',
		contact_ru: '',
		contact_en: '',
		prossesing: 'ongoing'
	})

	const [editingId, setEditingId] = useState(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('uz')

	const baseURL = import.meta.env.VITE_BASE_URL

	// Fetch all ongoing projects
	const fetchProjects = async () => {
		setLoading(true)
		try {
			const response = await axios.get(`${baseURL}/api/project/getAll/ongoing`)
			const projectsData = response.data?.projects || []
			setProjects(projectsData)
			setFilteredProjects(projectsData)
			setError('')
		} catch (err) {
			console.error('Error fetching projects:', err)
			if (err.response?.status !== 404) {
				setError('Loyihalarni yuklashda xatolik yuz berdi')
			}
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchProjects()
	}, [])

	// Search functionality
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredProjects(projects)
		} else {
			const filtered = projects.filter(project =>
				project.companyName_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.companyName_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.companyName_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.projectName_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.projectName_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.projectName_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				project.contact_uz?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredProjects(filtered)
		}
	}, [searchTerm, projects])

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
			companyName_uz: '',
			companyName_ru: '',
			companyName_en: '',
			projectName_uz: '',
			projectName_ru: '',
			projectName_en: '',
			contact_uz: '',
			contact_ru: '',
			contact_en: '',
			prossesing: 'ongoing'
		})
		setEditingId(null)
		setActiveTab('uz')
	}

	// Create new project
	const handleCreate = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await axios.post(`${baseURL}/api/project/create`, formData)

			setSuccess('Loyiha muvaffaqiyatli qo\'shildi')
			resetForm()
			setIsModalOpen(false)
			fetchProjects()
		} catch (err) {
			setError('Loyiha qo\'shishda xatolik yuz berdi')
			console.error('Error creating project:', err)
		} finally {
			setLoading(false)
		}
	}

	// Update project
	const handleUpdate = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
			await axios.put(`${baseURL}/api/project/update/${editingId}`, formData)

			setSuccess('Loyiha muvaffaqiyatli yangilandi')
			resetForm()
			setIsModalOpen(false)
			fetchProjects()
		} catch (err) {
			setError('Loyihani yangilashda xatolik yuz berdi')
			console.error('Error updating project:', err)
		} finally {
			setLoading(false)
		}
	}

	// Delete project
	const handleDelete = async (id) => {
		if (!window.confirm('Haqiqatan ham ushbu loyihani o\'chirmoqchimisiz?')) {
			return
		}

		setLoading(true)
		try {
			await axios.delete(`${baseURL}/api/project/delete/${id}`)
			setSuccess('Loyiha muvaffaqiyatli o\'chirildi')
			fetchProjects()
		} catch (err) {
			setError('Loyihani o\'chirishda xatolik yuz berdi')
			console.error('Error deleting project:', err)
		} finally {
			setLoading(false)
		}
	}

	// Edit project - populate form with existing data
	const handleEdit = (project) => {
		setFormData({
			companyName_uz: project.companyName_uz || '',
			companyName_ru: project.companyName_ru || '',
			companyName_en: project.companyName_en || '',
			projectName_uz: project.projectName_uz || '',
			projectName_ru: project.projectName_ru || '',
			projectName_en: project.projectName_en || '',
			contact_uz: project.contact_uz || '',
			contact_ru: project.contact_ru || '',
			contact_en: project.contact_en || '',
			prossesing: project.prossesing || 'ongoing'
		})
		setEditingId(project._id)
		setIsModalOpen(true)
	}

	// Open modal for creating new project
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

	// Get status badge color
	const getStatusBadge = (status) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800'
			case 'ongoing':
				return 'bg-yellow-100 text-yellow-800'
			case 'offer':
				return 'bg-blue-100 text-blue-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	// Get status text
	const getStatusText = (status) => {
		switch (status) {
			case 'completed':
				return 'Tugallangan'
			case 'ongoing':
				return 'Amaldagi loyihalar'
			case 'offer':
				return 'Taklif etilyotgan'
			default:
				return status
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div className="mx-auto">
				{/* Header */}
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
					<div className="mb-6 lg:mb-0">
						<h1 className="text-3xl font-bold text-gray-800 mb-2">
							Amaldagi Loyihalar
						</h1>
						<p className="text-gray-600">
							Joriy loyihalar ma'lumotlarini boshqaring
						</p>
					</div>
					<button
						className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
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
							placeholder="Loyihalarni qidirish..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full text-black pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
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
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-600 border-t-transparent"></div>
							<span className="text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</span>
						</div>
					</div>
				)}

				{/* Projects Table (Desktop) */}
				{filteredProjects.length > 0 ? (
					<div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gradient-to-r from-gray-50 to-yellow-50">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
											#
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
											Tashkilot
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
											Loyiha Nomi
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px]">
											Kontakt
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
											Holati
										</th>
										<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
											Amallar
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredProjects.map((project, index) => (
										<tr key={project._id} className="hover:bg-yellow-50 transition-colors duration-200">
											{/* Number */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900">
													{index + 1}
												</div>
											</td>

											{/* Company Name */}
											<td className="px-4 py-3">
												<div className="group relative">
													<div className="text-sm font-semibold text-gray-900">
														{project.companyName_uz}
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{project.companyName_ru} / {project.companyName_en}
													</div>
													<div className="absolute invisible group-hover:visible z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
														<div className="font-medium mb-2">Tashkilot:</div>
														<div><strong>UZ:</strong> {project.companyName_uz}</div>
														<div><strong>RU:</strong> {project.companyName_ru}</div>
														<div><strong>EN:</strong> {project.companyName_en}</div>
														<div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
													</div>
												</div>
											</td>

											{/* Project Name */}
											<td className="px-4 py-3">
												<div className="group relative">
													<div className="text-sm font-medium text-gray-900">
														{project.projectName_uz}
													</div>
													<div className="text-xs text-gray-500 mt-1">
														{project.projectName_ru} / {project.projectName_en}
													</div>
													<div className="absolute invisible group-hover:visible z-10 bottom-full left-0 mb-2 w-80 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
														<div className="font-medium mb-2">Loyiha:</div>
														<div><strong>UZ:</strong> {project.projectName_uz}</div>
														<div><strong>RU:</strong> {project.projectName_ru}</div>
														<div><strong>EN:</strong> {project.projectName_en}</div>
														<div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
													</div>
												</div>
											</td>

											{/* Contact */}
											<td className="px-4 py-3">
												<div className="group relative">
													<div className="text-sm text-gray-600 break-words max-w-[300px] line-clamp-2">
														{truncateText(project.contact_uz, 80)}
													</div>
													{project.contact_uz && project.contact_uz.length > 80 && (
														<div className="absolute invisible group-hover:visible z-10 bottom-full left-0 mb-2 w-96 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
															<div className="font-medium mb-2">Kontakt:</div>
															<div><strong>UZ:</strong> {project.contact_uz}</div>
															<div><strong>RU:</strong> {project.contact_ru}</div>
															<div><strong>EN:</strong> {project.contact_en}</div>
															<div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"></div>
														</div>
													)}
												</div>
											</td>

											{/* Status */}
											<td className="px-4 py-3 whitespace-nowrap">
												<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(project.prossesing)}`}>
													{getStatusText(project.prossesing)}
												</span>
											</td>

											{/* Actions */}
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="flex space-x-2 min-w-[140px]">
													<button
														className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center space-x-2 flex-1 justify-center"
														onClick={() => handleEdit(project)}
														disabled={loading}
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
														<span className="text-xs">Tahrir</span>
													</button>
													<button
														className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow flex items-center space-x-2 flex-1 justify-center"
														onClick={() => handleDelete(project._id)}
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
							<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full flex items-center justify-center">
								<svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-700 mb-2">
								{searchTerm ? 'Qidiruv bo\'yicha hech narsa topilmadi' : 'Hozircha amaldagi loyihalar mavjud emas'}
							</h3>
							<p className="text-gray-500 mb-6">
								{searchTerm ? 'Boshqa so\'zlar bilan qayta urinib ko\'ring' : 'Birinchi amaldagi loyihani qo\'shish uchun "Yangi Loyiha Qo\'shish" tugmasini bosing'}
							</p>
							{!searchTerm && (
								<button
									className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
									onClick={openCreateModal}
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									<span>Birinchi Loyihani Qo'shish</span>
								</button>
							)}
						</div>
					</div>
				)}

				{/* Projects Cards (Mobile) */}
				<div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					{filteredProjects.length > 0 && filteredProjects.map((project, index) => (
						<div key={project._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<div className="flex items-center space-x-2 mb-2">
											<div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
												{index + 1}
											</div>
											<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(project.prossesing)}`}>
												{getStatusText(project.prossesing)}
											</span>
										</div>
										<h3 className="text-lg font-bold text-gray-800 mb-1">
											{project.projectName_uz}
										</h3>
										<p className="text-sm text-gray-600 mb-2">
											{project.companyName_uz}
										</p>
									</div>
									<div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
										L
									</div>
								</div>

								{/* Language Tabs */}
								<div className="mb-4">
									<div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
										{['uz', 'ru', 'en'].map(lang => (
											<button
												key={lang}
												className={`flex-1 py-1 px-2 text-xs font-medium rounded-md transition-colors ${activeTab === lang
													? 'bg-white text-yellow-600 shadow-sm'
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
											<strong className="text-gray-800">Tashkilot:</strong>
											<div className={activeTab === 'uz' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{project.companyName_uz}</p>
											</div>
											<div className={activeTab === 'ru' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{project.companyName_ru}</p>
											</div>
											<div className={activeTab === 'en' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{project.companyName_en}</p>
											</div>
										</div>
										<div>
											<strong className="text-gray-800">Kontakt:</strong>
											<div className={activeTab === 'uz' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{project.contact_uz}</p>
											</div>
											<div className={activeTab === 'ru' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{project.contact_ru}</p>
											</div>
											<div className={activeTab === 'en' ? 'block' : 'hidden'}>
												<p className="text-gray-600">{project.contact_en}</p>
											</div>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex space-x-2 pt-4 border-t border-gray-200">
									<button
										className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
										onClick={() => handleEdit(project)}
										disabled={loading}
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										<span>Tahrirlash</span>
									</button>
									<button
										className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center space-x-2"
										onClick={() => handleDelete(project._id)}
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
				{filteredProjects.length > 0 && (
					<div className="mt-4 text-sm text-gray-600">
						Topildi: {filteredProjects.length} ta loyiha
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
						<div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-t-3xl">
							<div>
								<h2 className="text-2xl font-bold text-gray-800">
									{editingId ? 'Loyihani Tahrirlash' : 'Yangi Loyiha Qo\'shish'}
								</h2>
								<p className="text-gray-600 mt-1">
									{editingId ? 'Loyiha ma\'lumotlarini yangilang' : 'Yangi loyiha ma\'lumotlarini kiriting'}
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
								{/* Status Section */}
								<div className="bg-gradient-to-r from-blue-50 to-cyan-100 p-6 rounded-2xl">
									<h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
										<span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
										Loyiha Holati
									</h3>

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Loyiha Jarayoni
											</label>
											<select
												name="prossesing"
												value={formData.prossesing}
												onChange={handleInputChange}
												required
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
											>
												<option value="completed">Tugallangan</option>
												<option value="ongoing">Amaldagi loyihalar</option>
												<option value="offer">Taklif etilyotgan</option>
											</select>
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
												Tashkilot Nomi (O'zbekcha)
											</label>
											<input
												type="text"
												name="companyName_uz"
												value={formData.companyName_uz}
												onChange={handleInputChange}
												required
												placeholder="Tashkilot nomini kiriting"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Loyiha Nomi (O'zbekcha)
											</label>
											<input
												type="text"
												name="projectName_uz"
												value={formData.projectName_uz}
												onChange={handleInputChange}
												required
												placeholder="Loyiha nomini kiriting"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Kontakt (O'zbekcha)
											</label>
											<textarea
												name="contact_uz"
												value={formData.contact_uz}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Kontakt ma'lumotlarini kiriting"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
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
												Tashkilot Nomi (Ruscha)
											</label>
											<input
												type="text"
												name="companyName_ru"
												value={formData.companyName_ru}
												onChange={handleInputChange}
												required
												placeholder="Введите название организации"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Loyiha Nomi (Ruscha)
											</label>
											<input
												type="text"
												name="projectName_ru"
												value={formData.projectName_ru}
												onChange={handleInputChange}
												required
												placeholder="Введите название проекта"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Kontakt (Ruscha)
											</label>
											<textarea
												name="contact_ru"
												value={formData.contact_ru}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Введите контактную информацию"
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
												Tashkilot Nomi (Inglizcha)
											</label>
											<input
												type="text"
												name="companyName_en"
												value={formData.companyName_en}
												onChange={handleInputChange}
												required
												placeholder="Enter organization name"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Loyiha Nomi (Inglizcha)
											</label>
											<input
												type="text"
												name="projectName_en"
												value={formData.projectName_en}
												onChange={handleInputChange}
												required
												placeholder="Enter project name"
												className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Kontakt (Inglizcha)
											</label>
											<textarea
												name="contact_en"
												value={formData.contact_en}
												onChange={handleInputChange}
												required
												rows="3"
												placeholder="Enter contact information"
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
									disabled={loading || !formData.companyName_uz || !formData.companyName_ru || !formData.companyName_en || !formData.projectName_uz || !formData.projectName_ru || !formData.projectName_en || !formData.contact_uz || !formData.contact_ru || !formData.contact_en}
									className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center space-x-2"
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

export default AdminProjectOngoing
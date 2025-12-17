import axios from 'axios'
import {
	Building, Contact,
	Edit,
	Globe,
	MessageSquare,
	Plus,
	Save,
	Search,
	Trash2,
	X
} from 'lucide-react'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const CommunicationContent = ({ page, showForm, onShowFormChange }) => {
	// State'lar
	const [contents, setContents] = useState([])
	const [filteredContents, setFilteredContents] = useState([])
	const [loading, setLoading] = useState(false)
	const [contentLoading, setContentLoading] = useState(false)
	const [editingContent, setEditingContent] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')

	// Form ma'lumotlari
	const [formData, setFormData] = useState({
		sarlavha_uz: '',
		sarlavha_ru: '',
		sarlavha_en: '',
	})

	// API funksiyalari
	const fetchContents = async () => {
		if (!page) return

		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/generalcommunication/getAll/${page.key}`)
			if (response.data.success) {
				setContents(response.data.communications || [])
				setFilteredContents(response.data.communications || [])
			} else {
				setContents([])
				setFilteredContents([])
			}
		} catch (error) {
			console.error('Aloqa ma\'lumotlarini yuklashda xatolik:', error)
			setContents([])
			setFilteredContents([])
		} finally {
			setLoading(false)
		}
	}

	const handleAddNew = () => {
		// Communication uchun faqat bitta ma'lumot bo'lishi mumkin
		if (contents.length > 0) {
			alert('Communication uchun faqat 1 ta ma\'lumot saqlash mumkin! Yangilash uchun mavjud ma\'lumotni tahrirlang.')
			return
		}

		setEditingContent(null)
		resetForm()
		onShowFormChange(true)
	}

	const handleEditContent = (content) => {
		setEditingContent(content)

		// Form ma'lumotlarini to'ldirish
		setFormData({
			sarlavha_uz: content.sarlavha_uz || '',
			sarlavha_ru: content.sarlavha_ru || '',
			sarlavha_en: content.sarlavha_en || '',
		})

		onShowFormChange(true)
	}

	const handleDeleteContent = async (contentId, content) => {
		const title = content.sarlavha_uz || 'Nomsiz aloqa ma\'lumoti'
		if (window.confirm(`"${title}" aloqa ma\'lumotini o'chirishni istaysizmi?`)) {
			try {
				const response = await axios.delete(`${BASE_URL}/api/generalcommunication/delete/${contentId}`)
				if (response.data.success) {
					alert('Aloqa ma\'lumoti muvaffaqiyatli o\'chirildi!')
					fetchContents()
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert('Aloqa ma\'lumotini o\'chirishda xatolik yuz berdi')
			}
		}
	}

	// Form funksiyalari
	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	const resetForm = () => {
		setFormData({
			sarlavha_uz: '',
			sarlavha_ru: '',
			sarlavha_en: '',
		})
	}

	const closeModal = () => {
		onShowFormChange(false)
		setEditingContent(null)
		resetForm()
	}

	// Submit funksiyasi
	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!page) {
			alert('Iltimos, sahifa tanlanganligini tekshiring!')
			return
		}

		// Communication uchun faqat bitta ma'lumot saqlash mumkin
		if (!editingContent && contents.length > 0) {
			alert('Communication uchun faqat 1 ta ma\'lumot saqlash mumkin! Yangilash uchun mavjud ma\'lumotni tahrirlang.')
			return
		}

		// Validatsiya
		if (!formData.sarlavha_uz.trim()) {
			alert('O\'zbekcha sarlavhani kiriting!')
			return
		}

		try {
			setContentLoading(true)

			// JSON data yaratish
			const submitData = {
				sarlavha_uz: formData.sarlavha_uz,
				sarlavha_ru: formData.sarlavha_ru,
				sarlavha_en: formData.sarlavha_en,
				key: page.key,
				// title field'larini ham sarlavhadan olamiz
				title_uz: formData.sarlavha_uz || '',
				title_ru: formData.sarlavha_ru || '',
				title_en: formData.sarlavha_en || ''
			}

			// API endpoint va method
			const endpoint = editingContent
				? `${BASE_URL}/api/generalcommunication/update/${editingContent._id}`
				: `${BASE_URL}/api/generalcommunication/create`

			const config = {
				headers: {
					'Content-Type': 'application/json'
				}
			}

			const response = editingContent
				? await axios.put(endpoint, submitData, config)
				: await axios.post(endpoint, submitData, config)

			if (response.data.success) {
				const message = editingContent
					? 'Aloqa ma\'lumoti muvaffaqiyatli yangilandi!'
					: 'Aloqa ma\'lumoti muvaffaqiyatli qo\'shildi!'
				alert(message)
				closeModal()
				fetchContents()
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Aloqa ma\'lumotini saqlashda xatolik yuz berdi: ' + (error.response?.data?.message || error.message))
		} finally {
			setContentLoading(false)
		}
	}

	// Qidiruv
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredContents(contents)
		} else {
			const filtered = contents.filter(item =>
				(item.sarlavha_uz && item.sarlavha_uz.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.sarlavha_ru && item.sarlavha_ru.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.sarlavha_en && item.sarlavha_en.toLowerCase().includes(searchTerm.toLowerCase()))
			)
			setFilteredContents(filtered)
		}
	}, [searchTerm, contents])

	// Komponent yuklanganda ma'lumotlarni olish
	useEffect(() => {
		if (page) {
			fetchContents()
		}
	}, [page])

	// Aloqa kartasini render qilish
	const renderCommunicationCard = (content) => {
		return (
			<div key={content._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 bg-blue-100 rounded-lg">
								<Contact className="w-6 h-6 text-blue-600" />
							</div>
							<div>
								<h4 className="font-bold text-gray-800 text-lg">
									{content.sarlavha_uz || 'Aloqa Ma\'lumotlari'}
								</h4>
								<p className="text-gray-600 text-sm">Communication Type</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
							{content.sarlavha_uz && (
								<div className="bg-blue-50 p-3 rounded-lg">
									<div className="flex items-center gap-2 mb-1">
										<Globe className="w-4 h-4 text-blue-600" />
										<span className="text-xs font-medium text-gray-600">O'zbekcha</span>
									</div>
									<p className="font-medium text-gray-800">{content.sarlavha_uz}</p>
								</div>
							)}

							{content.sarlavha_ru && (
								<div className="bg-blue-50 p-3 rounded-lg">
									<div className="flex items-center gap-2 mb-1">
										<Globe className="w-4 h-4 text-blue-600" />
										<span className="text-xs font-medium text-gray-600">Ruscha</span>
									</div>
									<p className="font-medium text-gray-800">{content.sarlavha_ru}</p>
								</div>
							)}

							{content.sarlavha_en && (
								<div className="bg-blue-50 p-3 rounded-lg">
									<div className="flex items-center gap-2 mb-1">
										<Globe className="w-4 h-4 text-blue-600" />
										<span className="text-xs font-medium text-gray-600">Inglizcha</span>
									</div>
									<p className="font-medium text-gray-800">{content.sarlavha_en}</p>
								</div>
							)}
						</div>

						<div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
							<span>Yaratilgan: {new Date(content.createdAt).toLocaleDateString()}</span>
							<span>•</span>
							<span>Yangilangan: {new Date(content.updatedAt).toLocaleDateString()}</span>
						</div>
					</div>

					<div className="flex items-center space-x-2 ml-4">
						<button
							onClick={() => handleEditContent(content)}
							className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
							title="Tahrirlash"
						>
							<Edit size={16} />
						</button>
						<button
							onClick={() => handleDeleteContent(content._id, content)}
							className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
							title="O'chirish"
						>
							<Trash2 size={16} />
						</button>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Sarlavha va qidiruv */}
			<div className="bg-white rounded-xl shadow-lg p-6">
				<div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<span className="text-2xl">{page.icon}</span>
						<div>
							<h3 className="text-xl font-bold text-gray-800">{page.title.uz}</h3>
							<p className="text-gray-600">{page.slug} • Aloqa Ma'lumotlari</p>
						</div>
					</div>

					{/* Communication uchun agar ma'lumot bo'lsa, yangi qo'shish tugmasi ko'rinmasin */}
					{contents.length === 0 ? (
						<button
							onClick={handleAddNew}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							<Plus size={20} />
							Aloqa Ma'lumoti Qo'shish
						</button>
					) : (
						<div className="text-sm text-gray-600">
							Faqat 1 ta aloqa ma'lumoti saqlash mumkin
						</div>
					)}
				</div>

				{/* Qidiruv paneli (communication uchun qidiruv kerak emas, lekin UI yaxshi ko'rinishi uchun qoldiramiz) */}
				<div className="relative">
					<Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
					<input
						type="text"
						placeholder="Aloqa ma'lumotlarini qidirish..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={contents.length === 0}
					/>
				</div>
			</div>

			{/* Kontentlar ro'yxati */}
			<div className="bg-white rounded-xl shadow-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-gray-800">Aloqa Ma'lumotlari</h3>
					<span className="text-sm text-gray-600">
						{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredContents.length} ta` : `Jami: ${filteredContents.length} ta`}
					</span>
				</div>

				{loading ? (
					<div className="animate-pulse space-y-3">
						<div className="h-32 bg-gray-200 rounded"></div>
					</div>
				) : filteredContents.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-gray-600 mb-2">Aloqa ma'lumotlari topilmadi</h3>
						<p className="text-gray-500 text-sm mb-4">
							Kommunikatsiya uchun aloqa ma'lumotlarini yarating
						</p>
						<button
							onClick={handleAddNew}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
						>
							Aloqa Ma'lumoti Qo'shish
						</button>
					</div>
				) : (
					<div className="space-y-4">
						{filteredContents.map(renderCommunicationCard)}
					</div>
				)}
			</div>

			{/* Modal forma */}
			{showForm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal sarlavhasi */}
						<div className="bg-blue-600 text-white p-6 rounded-t-xl">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-bold">
									{editingContent ? 'Aloqa Ma\'lumotini Yangilash' : 'Yangi Aloqa Ma\'lumoti'}
								</h3>
								<button
									onClick={closeModal}
									className="text-white hover:text-gray-200 p-1 rounded"
								>
									<X size={24} />
								</button>
							</div>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="p-6 space-y-8">
							{/* Sarlavhalar */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<MessageSquare size={20} />
									Aloqa Sarlavhalari
								</h3>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
											<Globe size={16} />
											Sarlavha (O'zbekcha) *
										</label>
										<input
											type="text"
											value={formData.sarlavha_uz}
											onChange={(e) => handleInputChange('sarlavha_uz', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Biz bilan bog'lanish"
											required
										/>
										<p className="text-xs text-gray-500 mt-1">
											Asosiy sarlavha (masalan: "Biz bilan bog'lanish", "Aloqa ma'lumotlari")
										</p>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Sarlavha (Ruscha) *
										</label>
										<input
											type="text"
											value={formData.sarlavha_ru}
											onChange={(e) => handleInputChange('sarlavha_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Свяжитесь с нами"
											required
										/>
										<p className="text-xs text-gray-500 mt-1">
											Rus tilidagi sarlavha
										</p>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Sarlavha (Inglizcha) *
										</label>
										<input
											type="text"
											value={formData.sarlavha_en}
											onChange={(e) => handleInputChange('sarlavha_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Contact Us"
											required
										/>
										<p className="text-xs text-gray-500 mt-1">
											Ingliz tilidagi sarlavha
										</p>
									</div>
								</div>
							</div>

							{/* Ma'lumot */}
							<div className="bg-blue-50 p-4 rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<Building className="w-5 h-5 text-blue-600" />
									<h4 className="font-medium text-blue-800">Ma'lumot</h4>
								</div>
								<ul className="text-sm text-gray-600 space-y-1">
									<li>• Communication uchun faqat 1 ta ma'lumot saqlash mumkin</li>
									<li>• Bu ma'lumot kontakt sahifasida ko'rinadi</li>
									<li>• Har uch tilda ham sarlavha kiritilishi shart</li>
								</ul>
							</div>

							{/* Tugmalar */}
							<div className="flex space-x-3 pt-4 border-t">
								<button
									type="button"
									onClick={closeModal}
									className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg"
								>
									Bekor qilish
								</button>
								<button
									type="submit"
									disabled={contentLoading}
									className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center"
								>
									{contentLoading ? (
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Yuklanmoqda...
										</>
									) : (
										<>
											<Save size={20} className="mr-2" />
											{editingContent ? 'Yangilash' : 'Saqlash'}
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

export default CommunicationContent
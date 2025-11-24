import axios from 'axios'
import { useEffect, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const AdminQuestion = () => {
	const [questions, setQuestions] = useState([])
	const [filteredQuestions, setFilteredQuestions] = useState([])
	const [loading, setLoading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [editingQuestion, setEditingQuestion] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		question_uz: '',
		question_ru: '',
		question_en: '',
		ask_uz: '',
		ask_ru: '',
		ask_en: ''
	})

	// 🌐 Barcha savollarni olish
	useEffect(() => {
		fetchQuestions()
	}, [])

	// 🔍 Qidiruvni boshqarish
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredQuestions(questions)
		} else {
			const filtered = questions.filter(item =>
				item.question_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.question_ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.question_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.ask_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.ask_ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.ask_en.toLowerCase().includes(searchTerm.toLowerCase())
			)
			setFilteredQuestions(filtered)
		}
	}, [searchTerm, questions])

	const fetchQuestions = async () => {
		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const res = await axios.get(`${BASE_URL}/api/asked/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data?.askeds) {
				setQuestions(res.data.askeds)
				setFilteredQuestions(res.data.askeds)
			}
		} catch (err) {
			console.error("Savollarni olishda xatolik:", err.message)
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

	// ➕ Yangi savol qo'shish
	const handleAddNew = () => {
		setEditingQuestion(null)
		setFormData({
			question_uz: '',
			question_ru: '',
			question_en: '',
			ask_uz: '',
			ask_ru: '',
			ask_en: ''
		})
		setShowForm(true)
	}

	// ✏️ Savolni tahrirlash
	const handleEdit = (question) => {
		setEditingQuestion(question)
		setFormData({
			question_uz: question.question_uz,
			question_ru: question.question_ru,
			question_en: question.question_en,
			ask_uz: question.ask_uz,
			ask_ru: question.ask_ru,
			ask_en: question.ask_en
		})
		setShowForm(true)
	}

	// 📤 Formani yuborish
	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			setLoading(true)
			const token = localStorage.getItem("token")

			let res
			if (editingQuestion) {
				// 🔄 Yangilash
				res = await axios.put(
					`${BASE_URL}/api/asked/update/${editingQuestion._id}`,
					formData,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)
			} else {
				// ➕ Yangi yaratish
				res = await axios.post(`${BASE_URL}/api/asked/create`, formData, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				})
			}

			if (res.data.success) {
				alert(`✅ Savol ${editingQuestion ? "yangilandi" : "yaratildi"}!`)
				resetForm()
				fetchQuestions()
				setShowForm(false)
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi!")
		} finally {
			setLoading(false)
		}
	}

	// 🗑️ Savolni o'chirish
	const handleDelete = async (questionId) => {
		if (!window.confirm("Haqiqatan ham bu savolni o'chirmoqchimisiz?")) {
			return
		}

		try {
			const token = localStorage.getItem("token")
			const res = await axios.delete(`${BASE_URL}/api/asked/delete/${questionId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data.success) {
				alert("✅ Savol o'chirildi!")
				fetchQuestions()
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi!")
		}
	}

	// 🔄 Formani tozalash
	const resetForm = () => {
		setFormData({
			question_uz: '',
			question_ru: '',
			question_en: '',
			ask_uz: '',
			ask_ru: '',
			ask_en: ''
		})
		setEditingQuestion(null)
	}

	// ❌ Formani yopish
	const handleCancel = () => {
		setShowForm(false)
		resetForm()
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Savollar Boshqaruvi</h1>
				</div>

				{/* Search and Actions */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
						{/* Search */}
						<div className="flex-1 w-full md:max-w-md">
							<div className="relative">
								<input
									type="text"
									placeholder="Savollarni qidirish..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full text-black pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
							<span>Yangi Savol</span>
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
										{editingQuestion ? "Savolni Tahrirlash" : "Yangi Savol Yaratish"}
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
								{/* Question Fields */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Savol Matnlari</h3>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Savol (O'zbekcha)</label>
										<textarea
											name="question_uz"
											value={formData.question_uz}
											onChange={handleInputChange}
											rows="2"
											className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
											placeholder="Savol matnini kiriting..."
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Savol (Ruscha)</label>
										<textarea
											name="question_ru"
											value={formData.question_ru}
											onChange={handleInputChange}
											rows="2"
											className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
											placeholder="Введите текст вопроса..."
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Savol (Inglizcha)</label>
										<textarea
											name="question_en"
											value={formData.question_en}
											onChange={handleInputChange}
											rows="2"
											className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
											placeholder="Enter question text..."
										/>
									</div>
								</div>

								{/* Answer Fields */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Javob Matnlari</h3>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Javob (O'zbekcha)</label>
										<textarea
											name="ask_uz"
											value={formData.ask_uz}
											onChange={handleInputChange}
											rows="4"
											className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
											placeholder="Javob matnini kiriting..."
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Javob (Ruscha)</label>
										<textarea
											name="ask_ru"
											value={formData.ask_ru}
											onChange={handleInputChange}
											rows="4"
											className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
											placeholder="Введите текст ответа..."
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Javob (Inglizcha)</label>
										<textarea
											name="ask_en"
											value={formData.ask_en}
											onChange={handleInputChange}
											rows="4"
											className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
											placeholder="Enter answer text..."
										/>
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
											editingQuestion ? "Yangilash" : "Yaratish"
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

				{/* Questions List */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* List Header */}
					<div className="bg-blue-600 text-white p-6">
						<h2 className="text-xl font-bold">Barcha Savollar</h2>
						<p className="text-blue-100">
							{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredQuestions.length} ta` : `Jami: ${filteredQuestions.length} ta`}
						</p>
					</div>

					{/* Questions Items */}
					<div className="p-6">
						{filteredQuestions.length === 0 && !loading ? (
							<div className="text-center py-8">
								<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<h3 className="text-gray-600 mb-2">Savollar topilmadi</h3>
								<p className="text-gray-500 text-sm mb-4">
									{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi savolni yarating"}
								</p>
								{!searchTerm && (
									<button
										onClick={handleAddNew}
										className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
									>
										Yangi Savol
									</button>
								)}
							</div>
						) : (
							<div className="space-y-6">
								{filteredQuestions.map((question) => (
									<div key={question._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
										<div className="flex justify-between items-start mb-4">
											<div className="flex-1">
												<h3 className="font-semibold text-gray-800 mb-2 text-lg">
													{question.question_uz}
												</h3>
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
													<div>
														<span className="font-medium">RU: </span>
														{question.question_ru}
													</div>
													<div>
														<span className="font-medium">EN: </span>
														{question.question_en}
													</div>
												</div>
												<div className="bg-gray-50 rounded-lg p-4">
													<h4 className="font-medium text-gray-700 mb-2">Javob:</h4>
													<p className="text-gray-600">{question.ask_uz}</p>
												</div>
											</div>
											<div className="flex space-x-2 ml-4">
												<button
													onClick={() => handleEdit(question)}
													className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
													title="Tahrirlash"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
												<button
													onClick={() => handleDelete(question._id)}
													className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
													title="O'chirish"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											</div>
										</div>
										<div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
											<span>Yaratilgan: {new Date(question.createdAt).toLocaleDateString()}</span>
											<span>Yangilangan: {new Date(question.updatedAt).toLocaleDateString()}</span>
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

export default AdminQuestion
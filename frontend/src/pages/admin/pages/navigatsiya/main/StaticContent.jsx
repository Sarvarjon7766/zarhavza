import { Editor } from '@tinymce/tinymce-react'
import axios from 'axios'
import {
	BookOpen,
	Edit,
	Globe,
	Plus,
	Save,
	Search,
	Trash2,
	X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const StaticContent = ({ page, showForm, onShowFormChange }) => {
	// State'lar
	const [contents, setContents] = useState([])
	const [filteredContents, setFilteredContents] = useState([])
	const [loading, setLoading] = useState(false)
	const [contentLoading, setContentLoading] = useState(false)
	const [editingContent, setEditingContent] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')

	// Form ma'lumotlari - faqat matn field'lari
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		description_uz: '',
		description_ru: '',
		description_en: '',
	})

	// TinyMCE editor ref'lari
	const editorRefUz = useRef(null)
	const editorRefRu = useRef(null)
	const editorRefEn = useRef(null)

	// TinyMCE konfiguratsiyasi
	const editorConfig = {
		height: 400,
		menubar: 'file edit view insert format tools table help',
		plugins: [
			'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
			'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
			'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
			'emoticons', 'quickbars', 'codesample', 'directionality'
		],
		toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
			'fontfamily fontsize blocks | forecolor backcolor | ' +
			'alignleft aligncenter alignright alignjustify | ' +
			'bullist numlist outdent indent | link image media | ' +
			'table emoticons codesample | removeformat | code | fullscreen | help',
		content_style: `
      body { 
        font-family: 'Arial', sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #000000;
        margin: 0;
        padding: 8px;
      }
      h1 { font-size: 2em; color: #000000; margin: 0.67em 0; }
      h2 { font-size: 1.5em; color: #000000; margin: 0.83em 0; }
      h3 { font-size: 1.17em; color: #000000; margin: 1em 0; }
      h4 { font-size: 1em; color: #000000; margin: 1.33em 0; }
      h5 { font-size: 0.83em; color: #000000; margin: 1.67em 0; }
      h6 { font-size: 0.67em; color: #000000; margin: 2.33em 0; }
      p { margin-bottom: 1em; line-height: 1.6; }
      table { border-collapse: collapse; width: 100%; margin: 1em 0; }
      table td, table th { border: 1px solid #ddd; padding: 8px; text-align: left; }
      table th { background-color: #f2f2f2; font-weight: bold; }
      blockquote { 
        border-left: 4px solid #3b82f6; 
        padding-left: 1em; 
        margin: 1em 0;
        font-style: italic;
        background-color: #f8fafc;
        padding: 1em;
      }
      img { 
        max-width: 100%; 
        height: auto;
        border-radius: 4px;
      }
    `,
		images_upload_handler: async (blobInfo) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => {
					resolve(reader.result)
				}
				reader.onerror = () => {
					reject('Rasm yuklashda xatolik')
				}
				reader.readAsDataURL(blobInfo.blob())
			})
		},
	}

	// API funksiyalari
	const fetchContents = async () => {
		if (!page) return

		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/generalabout/getAll/${page.key}`)
			if (response.data.success) {
				setContents(response.data.abouts || [])
				setFilteredContents(response.data.abouts || [])
			} else {
				setContents([])
				setFilteredContents([])
			}
		} catch (error) {
			console.error('Statik kontentlarni yuklashda xatolik:', error)
			setContents([])
			setFilteredContents([])
		} finally {
			setLoading(false)
		}
	}

	const handleAddNew = () => {
		setEditingContent(null)
		resetForm()
		onShowFormChange(true)
	}

	const handleEditContent = (content) => {
		setEditingContent(content)

		// Form ma'lumotlarini to'ldirish
		setFormData({
			title_uz: content.title_uz || '',
			title_ru: content.title_ru || '',
			title_en: content.title_en || '',
			description_uz: content.description_uz || '',
			description_ru: content.description_ru || '',
			description_en: content.description_en || '',
		})

		onShowFormChange(true)
	}

	const handleDeleteContent = async (contentId, content) => {
		const title = content.title_uz || 'Nomsiz kontent'
		if (window.confirm(`"${title}" kontentini o'chirishni istaysizmi?`)) {
			try {
				const response = await axios.delete(`${BASE_URL}/api/generalabout/delete/${contentId}`)
				if (response.data.success) {
					alert('Kontent muvaffaqiyatli o\'chirildi!')
					fetchContents()
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert('Kontentni o\'chirishda xatolik yuz berdi')
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

	const handleEditorChange = (content, language) => {
		setFormData(prev => ({
			...prev,
			[`description_${language}`]: content
		}))
	}

	const resetForm = () => {
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			description_uz: '',
			description_ru: '',
			description_en: '',
		})
	}

	const closeModal = () => {
		onShowFormChange(false)
		setEditingContent(null)
		resetForm()
	}

	// HTML taglarini olib tashlash
	const stripHtml = (html) => {
		if (!html) return ''
		const tmp = document.createElement("DIV")
		tmp.innerHTML = html
		return tmp.textContent || tmp.innerText || ""
	}

	// Submit funksiyasi - ENDI FORMData EMAS, oddiy JSON
	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!page) {
			alert('Iltimos, sahifa tanlanganligini tekshiring!')
			return
		}

		// Validatsiya
		if (!formData.title_uz.trim()) {
			alert('O\'zbekcha sarlavhani kiriting!')
			return
		}

		try {
			setContentLoading(true)

			// JSON data yaratish - FormData EMAS
			const submitData = {
				title_uz: formData.title_uz,
				title_ru: formData.title_ru,
				title_en: formData.title_en,
				description_uz: formData.description_uz,
				description_ru: formData.description_ru,
				description_en: formData.description_en,
				key: page.key
			}

			// API endpoint va method
			const endpoint = editingContent
				? `${BASE_URL}/api/generalabout/update/${editingContent._id}`
				: `${BASE_URL}/api/generalabout/create`

			// Content-Type: application/json bo'ladi
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
					? 'Kontent muvaffaqiyatli yangilandi!'
					: 'Kontent muvaffaqiyatli qo\'shildi!'
				alert(message)
				closeModal()
				fetchContents()
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Kontentni saqlashda xatolik yuz berdi: ' + (error.response?.data?.message || error.message))
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
				(item.title_uz && item.title_uz.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.title_ru && item.title_ru.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.title_en && item.title_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.description_uz && stripHtml(item.description_uz).toLowerCase().includes(searchTerm.toLowerCase()))
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

	// Kontent kartasini render qilish
	const renderContentCard = (content) => {
		const shortDescription = stripHtml(content.description_uz || '')
		const truncatedDescription = shortDescription.length > 150
			? `${shortDescription.substring(0, 150)}...`
			: shortDescription

		return (
			<div key={content._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div>
							<h4 className="font-bold text-gray-800 text-lg mb-2">
								{content.title_uz || 'Nomsiz'}
							</h4>

							<div className="flex flex-wrap gap-2 mb-3">
								{content.title_ru && (
									<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
										<Globe size={10} /> RU: {content.title_ru}
									</span>
								)}
								{content.title_en && (
									<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1">
										<Globe size={10} /> EN: {content.title_en}
									</span>
								)}
							</div>

							{truncatedDescription && (
								<div className="mb-3">
									<div
										className="text-gray-600 text-sm leading-relaxed line-clamp-3"
										dangerouslySetInnerHTML={{
											__html: content.description_uz
												? (content.description_uz.length > 200
													? `${content.description_uz.substring(0, 200)}...`
													: content.description_uz)
												: 'Tavsif mavjud emas'
										}}
									/>
									{content.description_uz && content.description_uz.length > 200 && (
										<span className="text-blue-500 text-xs">...ko'proq</span>
									)}
								</div>
							)}

							<div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
								<span>Yaratilgan: {new Date(content.createdAt).toLocaleDateString()}</span>
								<span>•</span>
								<span>Yangilangan: {new Date(content.updatedAt).toLocaleDateString()}</span>
							</div>
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
							<p className="text-gray-600">{page.slug} • Statik Ma'lumot</p>
						</div>
					</div>
					<button
						onClick={handleAddNew}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<Plus size={20} />
						Yangi Ma'lumot
					</button>
				</div>

				{/* Qidiruv paneli */}
				<div className="relative">
					<Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
					<input
						type="text"
						placeholder="Kontentlarni qidirish (sarlavha, tavsif)..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
			</div>

			{/* Kontentlar ro'yxati */}
			<div className="bg-white rounded-xl shadow-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-gray-800">Mavjud Ma'lumotlar</h3>
					<span className="text-sm text-gray-600">
						{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredContents.length} ta` : `Jami: ${filteredContents.length} ta`}
					</span>
				</div>

				{loading ? (
					<div className="animate-pulse space-y-3">
						{[1, 2, 3].map(i => (
							<div key={i} className="h-32 bg-gray-200 rounded"></div>
						))}
					</div>
				) : filteredContents.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-gray-600 mb-2">Ma'lumotlar topilmadi</h3>
						<p className="text-gray-500 text-sm mb-4">
							{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi ma'lumotni yarating"}
						</p>
						{!searchTerm && (
							<button
								onClick={handleAddNew}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
							>
								Yangi Ma'lumot
							</button>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{filteredContents.map(renderContentCard)}
					</div>
				)}
			</div>

			{/* Modal forma */}
			{showForm && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal sarlavhasi */}
						<div className="bg-blue-600 text-white p-6 rounded-t-xl">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-bold">
									{editingContent ? 'Kontentni Yangilash' : 'Yangi Kontent Qo\'shish'}
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
							{/* 1. Sarlavhalar */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
									Sarlavhalar
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Sarlavha (O'zbekcha) *
										</label>
										<input
											type="text"
											value={formData.title_uz}
											onChange={(e) => handleInputChange('title_uz', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Statik ma'lumot sarlavhasi"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Sarlavha (Inglizcha) *
										</label>
										<input
											type="text"
											value={formData.title_en}
											onChange={(e) => handleInputChange('title_en', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Static content title"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Sarlavha (Ruscha) *
										</label>
										<input
											type="text"
											value={formData.title_ru}
											onChange={(e) => handleInputChange('title_ru', e.target.value)}
											className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											placeholder="Заголовок статического контента"
											required
										/>
									</div>
								</div>
							</div>

							{/* 2. Tavsiflar - TinyMCE Editor */}
							<div className="space-y-6">
								{/* O'zbekcha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tavsif (O'zbekcha) *
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => editorRefUz.current = editor}
											value={formData.description_uz}
											onEditorChange={(content) => handleEditorChange(content, 'uz')}
											init={editorConfig}
										/>
									</div>
								</div>

								{/* Ruscha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tavsif (Ruscha) *
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => editorRefRu.current = editor}
											value={formData.description_ru}
											onEditorChange={(content) => handleEditorChange(content, 'ru')}
											init={editorConfig}
										/>
									</div>
								</div>

								{/* Inglizcha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Tavsif (Inglizcha) *
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => editorRefEn.current = editor}
											value={formData.description_en}
											onEditorChange={(content) => handleEditorChange(content, 'en')}
											init={editorConfig}
										/>
									</div>
								</div>
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

export default StaticContent
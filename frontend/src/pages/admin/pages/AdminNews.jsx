import { Editor } from '@tinymce/tinymce-react'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const AdminNews = () => {
	const [news, setNews] = useState([])
	const [filteredNews, setFilteredNews] = useState([])
	const [loading, setLoading] = useState(false)
	const [showForm, setShowForm] = useState(false)
	const [editingNews, setEditingNews] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		description_uz: '',
		description_ru: '',
		description_en: '',
		photos: []
	})
	const [selectedPhotos, setSelectedPhotos] = useState([])
	const [selectedVideos, setSelectedVideos] = useState([])
	const [photoPreviews, setPhotoPreviews] = useState([])
	const [videoPreviews, setVideoPreviews] = useState([])
	const [removedPhotos, setRemovedPhotos] = useState([])
	const [removedVideos, setRemovedVideos] = useState([])
	const editorRefUz = useRef(null)
	const editorRefRu = useRef(null)
	const editorRefEn = useRef(null)

	// TinyMCE konfiguratsiyasi - To'liq funksiyali
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
		font_family_formats: 'Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva',
		font_size_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 48px 60px 72px',
		block_formats: 'Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3; Header 4=h4; Header 5=h5; Header 6=h6',
		quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
		quickbars_insert_toolbar: 'quickimage quicktable',
		toolbar_mode: 'sliding',
		contextmenu: 'link image table',
		paste_data_images: true,
		images_upload_url: `${BASE_URL}/api/upload`, // Agar serverda upload endpoint bo'lsa
		images_upload_handler: async (blobInfo) => {
			return new Promise((resolve, reject) => {
				// Hozircha base64 formatda saqlaymiz
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
            code {
                background-color: #f3f4f6;
                padding: 2px 4px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
            }
            pre {
                background-color: #1f2937;
                color: #f3f4f6;
                padding: 1em;
                border-radius: 5px;
                overflow-x: auto;
                font-family: 'Courier New', monospace;
            }
            img { 
                max-width: 100%; 
                height: auto;
                border-radius: 4px;
            }
            .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
                color: #6b7280;
                font-style: italic;
            }
        `,
		style_formats: [
			{ title: 'Heading 1', format: 'h1' },
			{ title: 'Heading 2', format: 'h2' },
			{ title: 'Heading 3', format: 'h3' },
			{ title: 'Heading 4', format: 'h4' },
			{ title: 'Heading 5', format: 'h5' },
			{ title: 'Heading 6', format: 'h6' },
			{ title: 'Paragraph', format: 'p' },
			{ title: 'Blockquote', format: 'blockquote' },
			{ title: 'Code', format: 'code' },
			{ title: 'Pre', format: 'pre' }
		],
		table_default_styles: {
			'width': '100%',
			'border-collapse': 'collapse'
		},
		table_default_attributes: {
			'border': '1'
		}
	}

	// 🌐 Barcha yangiliklarni olish
	useEffect(() => {
		fetchNews()
	}, [])

	// 🔍 Qidiruvni boshqarish
	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredNews(news)
		} else {
			const filtered = news.filter(item =>
				item.title_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				item.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(item.description_uz && stripHtml(item.description_uz).toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.description_ru && stripHtml(item.description_ru).toLowerCase().includes(searchTerm.toLowerCase())) ||
				(item.description_en && stripHtml(item.description_en).toLowerCase().includes(searchTerm.toLowerCase()))
			)
			setFilteredNews(filtered)
		}
	}, [searchTerm, news])

	// HTML taglarini olib tashlash
	const stripHtml = (html) => {
		if (!html) return ''
		const tmp = document.createElement("DIV")
		tmp.innerHTML = html
		return tmp.textContent || tmp.innerText || ""
	}

	const fetchNews = async () => {
		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const res = await axios.get(`${BASE_URL}/api/news/getAll`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data?.news) {
				setNews(res.data.news)
				setFilteredNews(res.data.news)
			}
		} catch (err) {
			console.error("Yangiliklarni olishda xatolik:", err.message)
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

	// 📝 Editor inputlarini boshqarish
	const handleEditorChange = (content, language) => {
		setFormData(prev => ({
			...prev,
			[`description_${language}`]: content
		}))
	}

	// 🖼️ Rasmlarni yuklash
	const handlePhotoChange = (e) => {
		const files = Array.from(e.target.files)
		const imageFiles = files.filter(file => file.type.startsWith('image/'))
		const newSelectedPhotos = [...selectedPhotos, ...imageFiles]
		setSelectedPhotos(newSelectedPhotos)

		const newPreviews = imageFiles.map(file => URL.createObjectURL(file))
		setPhotoPreviews(prev => [...prev, ...newPreviews])
		e.target.value = ''
	}

	// 🎥 Videolarni yuklash
	const handleVideoChange = (e) => {
		const files = Array.from(e.target.files)
		const videoFiles = files.filter(file => file.type.startsWith('video/'))
		const newSelectedVideos = [...selectedVideos, ...videoFiles]
		setSelectedVideos(newSelectedVideos)

		const newPreviews = videoFiles.map(file => URL.createObjectURL(file))
		setVideoPreviews(prev => [...prev, ...newPreviews])
		e.target.value = ''
	}

	// ➕ Yangi yangilik qo'shish
	const handleAddNew = () => {
		setEditingNews(null)
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			description_uz: '',
			description_ru: '',
			description_en: '',
			photos: []
		})
		setSelectedPhotos([])
		setSelectedVideos([])
		setPhotoPreviews([])
		setVideoPreviews([])
		setRemovedPhotos([])
		setRemovedVideos([])
		setShowForm(true)
	}

	// ✏️ Yangilikni tahrirlash
	const handleEdit = (newsItem) => {
		setEditingNews(newsItem)
		setFormData({
			title_uz: newsItem.title_uz || '',
			title_ru: newsItem.title_ru || '',
			title_en: newsItem.title_en || '',
			description_uz: newsItem.description_uz || '',
			description_ru: newsItem.description_ru || '',
			description_en: newsItem.description_en || '',
			photos: newsItem.photos || []
		})

		// Mavjud media fayllarni ajratish
		const existingPhotos = []
		const existingVideos = []

		newsItem.photos?.forEach(media => {
			if (media.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) {
				existingVideos.push(`${BASE_URL}${media}`)
			} else {
				existingPhotos.push(`${BASE_URL}${media}`)
			}
		})

		setPhotoPreviews(existingPhotos)
		setVideoPreviews(existingVideos)
		setSelectedPhotos([])
		setSelectedVideos([])
		setRemovedPhotos([])
		setRemovedVideos([])
		setShowForm(true)
	}

	// 📤 Formani yuborish
	const handleSubmit = async (e) => {
		e.preventDefault()

		try {
			setLoading(true)
			const token = localStorage.getItem("token")
			const submitData = new FormData()

			// Matn ma'lumotlarini qo'shish
			submitData.append('title_uz', formData.title_uz)
			submitData.append('title_ru', formData.title_ru)
			submitData.append('title_en', formData.title_en)
			submitData.append('description_uz', formData.description_uz)
			submitData.append('description_ru', formData.description_ru)
			submitData.append('description_en', formData.description_en)

			// Yangi rasmlarni qo'shish
			selectedPhotos.forEach(photo => {
				submitData.append('photos', photo)
			})

			// Yangi videolarni qo'shish
			selectedVideos.forEach(video => {
				submitData.append('photos', video)
			})

			// O'chirilgan media fayllarni yuborish
			if (editingNews) {
				removedPhotos.forEach(photoPath => {
					submitData.append('removedPhotos', photoPath)
				})
				removedVideos.forEach(videoPath => {
					submitData.append('removedPhotos', videoPath)
				})
			}

			let res
			if (editingNews) {
				res = await axios.put(
					`${BASE_URL}/api/news/update/${editingNews._id}`,
					submitData,
					{
						headers: {
							'Content-Type': 'multipart/form-data',
							Authorization: `Bearer ${token}`,
						},
					}
				)
			} else {
				res = await axios.post(`${BASE_URL}/api/news/create`, submitData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						Authorization: `Bearer ${token}`,
					},
				})
			}

			if (res.data.success) {
				alert(`✅ Yangilik ${editingNews ? "yangilandi" : "yaratildi"}!`)
				resetForm()
				fetchNews()
				setShowForm(false)
			}
		} catch (err) {
			console.error(err)
			alert("❌ Xatolik yuz berdi!")
		} finally {
			setLoading(false)
		}
	}

	// 🗑️ Yangilikni o'chirish
	const handleDelete = async (newsId) => {
		if (!window.confirm("Haqiqatan ham bu yangilikni o'chirmoqchimisiz?")) {
			return
		}

		try {
			const token = localStorage.getItem("token")
			const res = await axios.delete(`${BASE_URL}/api/news/delete/${newsId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})

			if (res.data.success) {
				alert("✅ Yangilik o'chirildi!")
				fetchNews()
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
			description_en: '',
			photos: []
		})
		setSelectedPhotos([])
		setSelectedVideos([])
		setPhotoPreviews([])
		setVideoPreviews([])
		setRemovedPhotos([])
		setRemovedVideos([])
		setEditingNews(null)
	}

	// ❌ Formani yopish
	const handleCancel = () => {
		setShowForm(false)
		resetForm()
	}

	// 🗑️ Rasmni o'chirish
	const removePhotoPreview = (index) => {
		const newPreviews = [...photoPreviews]
		const removedPreview = newPreviews.splice(index, 1)[0]

		if (removedPreview.startsWith('blob:')) {
			URL.revokeObjectURL(removedPreview)
		}

		setPhotoPreviews(newPreviews)

		const newPhotos = [...selectedPhotos]
		newPhotos.splice(index, 1)
		setSelectedPhotos(newPhotos)
	}

	// 🗑️ Videoni o'chirish
	const removeVideoPreview = (index) => {
		const newPreviews = [...videoPreviews]
		const removedPreview = newPreviews.splice(index, 1)[0]

		if (removedPreview.startsWith('blob:')) {
			URL.revokeObjectURL(removedPreview)
		}

		setVideoPreviews(newPreviews)

		const newVideos = [...selectedVideos]
		newVideos.splice(index, 1)
		setSelectedVideos(newVideos)
	}

	// 🗑️ Mavjud rasmni o'chirish
	const removeExistingPhoto = (index) => {
		if (!window.confirm("Bu rasmni o'chirmoqchimisiz?")) return

		const updatedPreviews = [...photoPreviews]
		const removedPreview = updatedPreviews.splice(index, 1)[0]

		// URL dan asl path ni ajratib olish
		const photoPath = removedPreview.replace(BASE_URL, '')
		setPhotoPreviews(updatedPreviews)
		setRemovedPhotos(prev => [...prev, photoPath])
	}

	// 🗑️ Mavjud videoni o'chirish
	const removeExistingVideo = (index) => {
		if (!window.confirm("Bu videoni o'chirmoqchimisiz?")) return

		const updatedPreviews = [...videoPreviews]
		const removedPreview = updatedPreviews.splice(index, 1)[0]

		// URL dan asl path ni ajratib olish
		const videoPath = removedPreview.replace(BASE_URL, '')
		setVideoPreviews(updatedPreviews)
		setRemovedVideos(prev => [...prev, videoPath])
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Yangiliklar Boshqaruvi</h1>
					<p className="text-gray-600">Barcha yangiliklarni boshqaring va tahrirlang</p>
				</div>

				{/* Search and Actions */}
				<div className="bg-white rounded-xl shadow-lg p-6 mb-8">
					<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
						{/* Search */}
						<div className="flex-1 w-full md:max-w-md">
							<div className="relative">
								<input
									type="text"
									placeholder="Yangiliklarni qidirish..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 text-gray-900 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</div>
						</div>

						{/* Add Button */}
						<button
							onClick={handleAddNew}
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-md"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<span>Yangi Yangilik</span>
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
						<div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="bg-blue-600 text-white p-6 rounded-t-xl sticky top-0 z-10">
								<div className="flex justify-between items-center">
									<h2 className="text-xl font-bold">
										{editingNews ? "Yangilikni Tahrirlash" : "Yangi Yangilik Yaratish"}
									</h2>
									<button
										onClick={handleCancel}
										className="text-white hover:text-gray-200 p-1 rounded transition-colors"
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
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Sarlavha (O'zbekcha) *</label>
										<input
											type="text"
											name="title_uz"
											value={formData.title_uz}
											onChange={handleInputChange}
											placeholder="O'zbekcha sarlavha..."
											className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
											placeholder='Русский заголовок...'
											className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
											placeholder='English title...'
											className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
											required
										/>
									</div>
								</div>

								{/* Descriptions - TinyMCE bilan */}
								<div className="space-y-6">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Tavsif (O'zbekcha) *
											<span className="text-xs text-gray-500 ml-2">Matn formati: shrift, o'lcham, rang, tekislash, jadvallar</span>
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

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Tavsif (Ruscha) *
											<span className="text-xs text-gray-500 ml-2">Формат текста: шрифт, размер, цвет, выравнивание, таблицы</span>
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

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Tavsif (Inglizcha) *
											<span className="text-xs text-gray-500 ml-2">Text formatting: font, size, color, alignment, tables</span>
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

								{/* Media Files */}
								<div className="space-y-6">
									{/* Photos */}
									<div className="space-y-4">
										<label className="block text-sm font-medium text-gray-700">Rasmlar ({photoPreviews.length} ta)</label>

										{photoPreviews.length > 0 && (
											<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
												{photoPreviews.map((preview, index) => (
													<div key={index} className="relative group">
														<img
															src={preview}
															alt={`Preview ${index + 1}`}
															className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
														/>
														<button
															type="button"
															onClick={() => {
																if (preview.startsWith(BASE_URL)) {
																	removeExistingPhoto(index)
																} else {
																	removePhotoPreview(index)
																}
															}}
															className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors shadow-md"
														>
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>
												))}
											</div>
										)}

										<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
											<input
												type="file"
												accept="image/*"
												onChange={handlePhotoChange}
												className="hidden"
												id="photo-upload"
												multiple
											/>
											<label htmlFor="photo-upload" className="cursor-pointer">
												<svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												<p className="text-gray-600">Rasmlarni tanlang yoki bu yerga tashlang</p>
												<p className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG fayllar</p>
											</label>
										</div>
									</div>

									{/* Videos */}
									<div className="space-y-4">
										<label className="block text-sm font-medium text-gray-700">Videolar ({videoPreviews.length} ta)</label>

										{videoPreviews.length > 0 && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												{videoPreviews.map((preview, index) => (
													<div key={index} className="relative group">
														<video
															src={preview}
															className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
															controls
														/>
														<button
															type="button"
															onClick={() => {
																if (preview.startsWith(BASE_URL)) {
																	removeExistingVideo(index)
																} else {
																	removeVideoPreview(index)
																}
															}}
															className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors shadow-md"
														>
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>
												))}
											</div>
										)}

										<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
											<input
												type="file"
												accept="video/*"
												onChange={handleVideoChange}
												className="hidden"
												id="video-upload"
												multiple
											/>
											<label htmlFor="video-upload" className="cursor-pointer">
												<svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
												</svg>
												<p className="text-gray-600">Videolarni tanlang yoki bu yerga tashlang</p>
												<p className="text-gray-400 text-sm mt-1">MP4, AVI, MOV fayllar</p>
											</label>
										</div>
									</div>
								</div>

								{/* Buttons */}
								<div className="flex space-x-3 pt-6 border-t border-gray-200">
									<button
										type="submit"
										disabled={loading}
										className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors shadow-md"
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
											editingNews ? "Yangilikni Yangilash" : "Yangilik Yaratish"
										)}
									</button>
									<button
										type="button"
										onClick={handleCancel}
										className="px-6 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors shadow-md"
									>
										Bekor qilish
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* News List */}
				<div className="bg-white rounded-xl shadow-lg overflow-hidden">
					{/* List Header */}
					<div className="bg-gray-50 border-b border-gray-200 p-6">
						<h2 className="text-xl font-bold text-gray-800">Barcha Yangiliklar</h2>
						<p className="text-gray-600 mt-1">
							{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredNews.length} ta natija` : `Jami: ${filteredNews.length} ta yangilik`}
						</p>
					</div>

					{/* News Items */}
					<div className="p-6">
						{filteredNews.length === 0 && !loading ? (
							<div className="text-center py-12">
								<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<h3 className="text-gray-600 text-lg font-medium mb-2">Yangiliklar topilmadi</h3>
								<p className="text-gray-500 text-sm mb-6">
									{searchTerm ? "Boshqa so'zlar bilan qidiring yoki filterni tozalang" : "Birinchi yangilikni yarating"}
								</p>
								{!searchTerm && (
									<button
										onClick={handleAddNew}
										className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
									>
										Yangi Yangilik Yaratish
									</button>
								)}
							</div>
						) : (
							<div className="space-y-4">
								{filteredNews.map((newsItem) => {
									const photosCount = newsItem.photos?.filter(media =>
										!media.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
									).length || 0
									const videosCount = newsItem.photos?.filter(media =>
										media.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)
									).length || 0

									return (
										<div key={newsItem._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<h3 className="font-semibold text-gray-800 mb-2 text-lg">{newsItem.title_uz}</h3>
													<div
														className="text-gray-600 mb-3 line-clamp-2 text-sm"
														dangerouslySetInnerHTML={{
															__html: newsItem.description_uz ?
																(stripHtml(newsItem.description_uz).substring(0, 200) +
																	(stripHtml(newsItem.description_uz).length > 200 ? '...' : ''))
																: 'Tavsif mavjud emas'
														}}
													/>
													<div className="flex items-center space-x-4 text-xs text-gray-500">
														<span className="flex items-center">
															<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
															</svg>
															{new Date(newsItem.createdAt).toLocaleDateString()}
														</span>
														{photosCount > 0 && (
															<span className="flex items-center">
																<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
																</svg>
																{photosCount} rasm
															</span>
														)}
														{videosCount > 0 && (
															<span className="flex items-center">
																<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
																</svg>
																{videosCount} video
															</span>
														)}
													</div>
												</div>
												<div className="flex space-x-2 ml-4">
													<button
														onClick={() => handleEdit(newsItem)}
														className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
														title="Tahrirlash"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
													<button
														onClick={() => handleDelete(newsItem._id)}
														className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
														title="O'chirish"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
														</svg>
													</button>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminNews
import { Editor } from '@tinymce/tinymce-react'
import axios from 'axios'
import {
	BookOpen,
	Calendar,
	Clock,
	Edit,
	Eye,
	Globe,
	Image as ImageIcon,
	Newspaper,
	Plus,
	Save,
	Search,
	Tag,
	Trash2,
	TrendingUp,
	Upload,
	X
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const NewsContent = ({ page, showForm, onShowFormChange }) => {
	// State'lar
	const [contents, setContents] = useState([])
	const [filteredContents, setFilteredContents] = useState([])
	const [loading, setLoading] = useState(false)
	const [contentLoading, setContentLoading] = useState(false)
	const [editingContent, setEditingContent] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedMedia, setSelectedMedia] = useState([])
	const [mediaPreviews, setMediaPreviews] = useState([])
	const [removedMedia, setRemovedMedia] = useState([])

	// Form ma'lumotlari
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

	// TinyMCE konfiguratsiyasi - BARCHA takliflar o'chirilgan
	const editorConfig = {
		height: 400,
		menubar: false,

		// Minimal plugin'lar
		plugins: [
			'advlist', 'autolink', 'lists', 'link', 'charmap', 'anchor',
			'searchreplace', 'visualblocks', 'code', 'fullscreen',
			'insertdatetime', 'table', 'wordcount', 'emoticons', 'directionality'
		],

		// Toolbar - faqat asosiy formatlash
		toolbar: 'undo redo | blocks | bold italic underline | ' +
			'fontfamily fontsize | forecolor backcolor | ' +
			'alignleft aligncenter alignright alignjustify | ' +
			'bullist numlist outdent indent | link | ' +
			'table | removeformat | fullscreen',

		// === BARCHA TAKLIFLAR VA AVTOMATIK XUSUSIYATLAR O'CHIRILDI ===

		// Spell check'ni butunlay o'chirish
		browser_spellcheck: false,
		gecko_spellcheck: false,

		// Autocomplete'ni butunlay o'chirish
		autocomplete: false,

		// Auto-correct va smart formatlashni o'chirish
		autocorrect_capitalize: false,
		autocorrect: false,
		smart_paste: false,
		smart_paste_smart_phone_number: false,
		smart_paste_smart_web_address: false,

		// Auto-link ni o'chirish
		autolink: false,

		// Text pattern (avtomatik formatlash) ni o'chirish
		text_patterns: false,

		// Word completion ni o'chirish
		wordcount: {
			show_characters: false,
			show_wordcount: false,
			show_paragraphs: false
		},

		// Emoji va special character takliflarini o'chirish
		emoticons_database: 'emojis',
		emoticons_images: false,

		// Context menu'dan spell check'ni olib tashlash
		contextmenu: "link table",

		// Paste qilganda faqat matn sifatida
		paste_as_text: true,
		paste_data_images: false,
		paste_retain_style_properties: "",
		paste_webkit_styles: "none",
		paste_remove_styles: true,
		paste_remove_styles_if_webkit: true,
		paste_strip_class_attributes: "all",

		// Rasm yuklashni butunlay o'chirish
		images_upload_handler: null,
		images_upload_url: false,
		automatic_uploads: false,
		image_advtab: false,
		image_caption: false,
		image_class_list: false,
		image_description: false,
		image_dimensions: false,
		image_prepend_url: false,
		image_title: false,
		file_picker_types: '',
		file_picker_callback: null,

		content_style: `
      body { 
        font-family: 'Arial', sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #000000;
        margin: 0;
        padding: 8px;
        -webkit-user-modify: read-write-plaintext-only; /* Safari uchun */
      }
      
      /* Barcha avtomatik takliflar va underline'lar uchun */
      * {
        text-decoration-skip-ink: none !important;
      }
      
      /* Spell check underline'ni yashirish */
      span[data-mce-style*="text-decoration"] {
        text-decoration: none !important;
      }
      
      /* Firefox spell check underline */
      span[data-mce-style*="text-decoration-line"] {
        text-decoration: none !important;
      }
      
      /* Rasmni butunlay yashirish */
      img { 
        display: none !important;
        max-width: 0 !important;
        height: 0 !important;
        visibility: hidden !important;
      }
      
      h1 { font-size: 2em; color: #000000; margin: 0.67em 0; }
      h2 { font-size: 1.5em; color: #000000; margin: 0.83em 0; }
      h3 { font-size: 1.17em; color: #000000; margin: 1em 0; }
      p { margin-bottom: 1em; line-height: 1.6; }
      blockquote { 
        border-left: 4px solid #3b82f6; 
        padding-left: 1em; 
        margin: 1em 0;
        font-style: italic;
        background-color: #f8fafc;
        padding: 1em;
      }
      
      /* Autocomplete dropdown'ni yashirish */
      .tox-autocompleter,
      .tox-menu,
      .tox-collection--list {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
      }
      
      /* Brauzerning o'z spell check underline'ini yashirish */
      ::spelling-error,
      ::grammar-error {
        text-decoration: none !important;
        background-color: transparent !important;
      }
      
      /* Text selection uchun */
      ::selection {
        background-color: rgba(59, 130, 246, 0.3) !important;
      }
    `,

		// Setup funksiyasi - qo'shimcha bloklash
		setup: function (editor) {
			// Editor yuklanganda birinchi ish - barcha autocomplete'lar o'chirish
			editor.on('init', function () {
				const body = editor.getBody()

				// Barcha autocomplete va spell check attribute'larini o'chirish
				body.setAttribute('autocomplete', 'off')
				body.setAttribute('autocorrect', 'off')
				body.setAttribute('autocapitalize', 'off')
				body.setAttribute('spellcheck', 'false')
				body.setAttribute('data-gramm', 'false')
				body.setAttribute('data-gramm_editor', 'false')
				body.setAttribute('data-enable-grammarly', 'false')

				// ContentEditable elementlarga ham attribute qo'shish
				const editableElements = body.querySelectorAll('[contenteditable="true"]')
				editableElements.forEach(el => {
					el.setAttribute('autocomplete', 'off')
					el.setAttribute('autocorrect', 'off')
					el.setAttribute('autocapitalize', 'off')
					el.setAttribute('spellcheck', 'false')
				})

				// Agar Grammarly yoki boshqa extension'lar bo'lsa
				body.classList.add('grammarly-disable')
			})

			// Input event'larida takliflar chiqishini oldini olish
			editor.on('keydown', function (e) {
				// Barcha autocomplete kombinatsiyalarini bloklash
				if ((e.key === ' ' && e.ctrlKey) ||
					(e.key === 'Enter' && e.altKey) ||
					(e.key === 'Tab' && !e.shiftKey)) {
					e.preventDefault()
					return false
				}

				// Ctrl+Z va Ctrl+Y ni saqlab qolish
				if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y')) {
					return true
				}
			})

			// Brauzerning o'z autocomplete'ini bloklash
			editor.on('focus', function () {
				const body = editor.getBody()
				body.setAttribute('autocomplete', 'new-password') // Eng samarali usul
				body.setAttribute('autocorrect', 'off')
				body.setAttribute('autocapitalize', 'none')
				body.setAttribute('spellcheck', 'false')
				body.setAttribute('inputmode', 'text')

				// Tinymce iframe ichidagi input'lar uchun
				const iframe = editor.iframeElement
				if (iframe) {
					iframe.setAttribute('autocomplete', 'off')
					iframe.setAttribute('spellcheck', 'false')
				}
			})

			// IME (Input Method Editor) uchun - maxsus belgilar kiritish
			editor.on('CompositionStart CompositionUpdate CompositionEnd', function (e) {
				// IME'dan keladigan takliflarni nazorat qilish
			})

			// Drag and drop bloklash
			editor.on('dragstart dragover drop', function (e) {
				e.preventDefault()
				e.stopPropagation()
				return false
			})

			// Paste bloklash - faqat plain text
			editor.on('paste', function (e) {
				e.preventDefault()
				const text = (e.clipboardData || window.clipboardData).getData('text/plain')

				// Faqat oddiy matn kiritish
				if (text) {
					editor.insertContent(text.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
				}
				return false
			})

			// Clipboard'dan formatlangan matn kelsa
			editor.on('beforepaste', function (e) {
				e.preventDefault()
				return false
			})

			// Editor ichidagi rasmlarni tekshirish va olib tashlash
			editor.on('SetContent', function () {
				const images = editor.dom.select('img')
				images.forEach(function (img) {
					// Barcha rasmlarni olib tashlash
					editor.dom.remove(img)
				})

				// Agar data:image formatida bo'lsa
				const content = editor.getContent()
				if (content.includes('data:image/')) {
					editor.setContent(content.replace(/<img[^>]*>/g, ''))
				}
			})

			// Input event'ida - real vaqtda takliflarni tekshirish
			editor.on('input', function () {
				// Brauzer autocomplete'ini qayta o'chirish
				const body = editor.getBody()
				body.setAttribute('autocomplete', 'off')
			})

			// Context menu yopilganda
			editor.on('contextmenu', function (e) {
				// Faqat bizning menyumiz chiqishi uchun
				setTimeout(() => {
					const menus = document.querySelectorAll('.tox-menu:not(.tox-collection__menu)')
					menus.forEach(menu => {
						if (menu.style.display !== 'none') {
							menu.style.display = 'none'
						}
					})
				}, 10)
			})

			// Tinymce toolbar'dan rasm tugmasini butunlay olib tashlash
			editor.ui.registry.addButton('image', {
				icon: 'image',
				tooltip: 'Rasm qo\'shish (O\'chirilgan)',
				enabled: false,
				onAction: function () {
					editor.notificationManager.open({
						text: 'Rasm yuklash imkoni mavjud emas',
						type: 'warning',
						timeout: 2000
					})
				}
			})
		}
	}

	// API funksiyalari
	const fetchContents = async () => {
		if (!page) return

		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/generalnews/getAll/${page.key}`)
			if (response.data.success) {
				setContents(response.data.news || [])
				setFilteredContents(response.data.news || [])
			} else {
				setContents([])
				setFilteredContents([])
			}
		} catch (error) {
			console.error('Yangiliklarni yuklashda xatolik:', error)
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

		// Media previewlarni o'rnatish
		if (content.photos && content.photos.length > 0) {
			const existingPreviews = content.photos.map(photo => ({
				type: 'image',
				url: `${BASE_URL}${photo}`,
				path: photo,
				name: typeof photo === 'string' ? photo.split('/').pop() : photo.name,
				isExisting: true
			}))
			setMediaPreviews(existingPreviews)
		} else {
			setMediaPreviews([])
		}

		setSelectedMedia([])
		setRemovedMedia([])
		onShowFormChange(true)
	}

	const handleDeleteContent = async (contentId, content) => {
		const title = content.title_uz || 'Nomsiz yangilik'
		if (window.confirm(`"${title}" yangiligini o'chirishni istaysizmi?`)) {
			try {
				const response = await axios.delete(`${BASE_URL}/api/generalnews/delete/${contentId}`)
				if (response.data.success) {
					alert('Yangilik muvaffaqiyatli o\'chirildi!')
					fetchContents()
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert('Yangilikni o\'chirishda xatolik yuz berdi')
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

	const handleMediaChange = (e) => {
		const files = Array.from(e.target.files)
		const newSelectedMedia = [...selectedMedia, ...files]
		setSelectedMedia(newSelectedMedia)

		// Preview yaratish
		const newPreviews = files.map(file => ({
			type: 'image',
			url: URL.createObjectURL(file),
			name: file.name,
			size: file.size,
			isExisting: false
		}))

		setMediaPreviews(prev => [...prev, ...newPreviews])
		e.target.value = ''
	}

	const removeMediaPreview = (index) => {
		const newPreviews = [...mediaPreviews]
		const removedPreview = newPreviews.splice(index, 1)[0]

		// Blob URL'ni tozalash
		if (!removedPreview.isExisting && removedPreview.url.startsWith('blob:')) {
			URL.revokeObjectURL(removedPreview.url)
		}

		// Agar mavjud media bo'lsa, removedMedia ga qo'shamiz
		if (removedPreview.isExisting) {
			const mediaPath = removedPreview.url.replace(BASE_URL, '')
			setRemovedMedia(prev => [...prev, mediaPath])
		}

		// SelectedMedia'dan ham o'chirish
		const newMedia = [...selectedMedia]
		if (!removedPreview.isExisting) {
			newMedia.splice(index, 1)
		}
		setSelectedMedia(newMedia)

		setMediaPreviews(newPreviews)
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
		setSelectedMedia([])
		setMediaPreviews([])
		setRemovedMedia([])
	}

	const closeModal = () => {
		// Blob URL'larni tozalash
		mediaPreviews.forEach(preview => {
			if (!preview.isExisting && preview.url.startsWith('blob:')) {
				URL.revokeObjectURL(preview.url)
			}
		})

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

	// Vaqtni formatlash
	const formatTimeAgo = (dateString) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffMs = now - date
		const diffMins = Math.floor(diffMs / 60000)
		const diffHours = Math.floor(diffMs / 3600000)
		const diffDays = Math.floor(diffMs / 86400000)

		if (diffMins < 60) {
			return `${diffMins} daqiqa oldin`
		} else if (diffHours < 24) {
			return `${diffHours} soat oldin`
		} else if (diffDays < 7) {
			return `${diffDays} kun oldin`
		} else {
			return date.toLocaleDateString()
		}
	}

	// Fayl o'lchamini formatlash
	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
	}

	// Submit funksiyasi
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

		if (!formData.description_uz.trim()) {
			alert('O\'zbekcha tavsifni kiriting!')
			return
		}

		try {
			setContentLoading(true)

			// FormData yaratish (rasmlar uchun)
			const submitData = new FormData()

			// Asosiy ma'lumotlar
			submitData.append('title_uz', formData.title_uz)
			submitData.append('title_ru', formData.title_ru)
			submitData.append('title_en', formData.title_en)
			submitData.append('description_uz', formData.description_uz)
			submitData.append('description_ru', formData.description_ru)
			submitData.append('description_en', formData.description_en)
			submitData.append('key', page.key)

			// Yangi rasmlarni qo'shish
			selectedMedia.forEach(media => {
				submitData.append('photos', media)
			})

			// O'chirilgan rasmlarni yuborish (faqat tahrirlashda)
			if (editingContent && removedMedia.length > 0) {
				removedMedia.forEach(mediaPath => {
					submitData.append('removedPhotos', mediaPath)
				})
			}

			// API endpoint va method
			const endpoint = editingContent
				? `${BASE_URL}/api/generalnews/update/${editingContent._id}`
				: `${BASE_URL}/api/generalnews/create`

			const config = {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}

			const response = editingContent
				? await axios.put(endpoint, submitData, config)
				: await axios.post(endpoint, submitData, config)

			if (response.data.success) {
				const message = editingContent
					? 'Yangilik muvaffaqiyatli yangilandi!'
					: 'Yangilik muvaffaqiyatli qo\'shildi!'
				alert(message)
				closeModal()
				fetchContents()
			} else {
				alert('Xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Yangilikni saqlashda xatolik yuz berdi: ' + (error.response?.data?.message || error.message))
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

	// Yangilik kartasini render qilish
	const renderNewsCard = (content) => {
		const shortDescription = stripHtml(content.description_uz || '')
		const truncatedDescription = shortDescription.length > 150
			? `${shortDescription.substring(0, 150)}...`
			: shortDescription

		return (
			<div key={content._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<div className="flex items-start gap-4">
							{/* Rasm qismi */}
							{content.photos && content.photos.length > 0 && (
								<div className="flex-shrink-0">
									<div className="relative w-40 h-32 rounded-lg overflow-hidden bg-gray-100 group">
										<img
											src={`${BASE_URL}${content.photos[0]}`}
											alt={content.title_uz}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

										{/* Rasm soni */}
										{content.photos.length > 1 && (
											<div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
												+{content.photos.length - 1}
											</div>
										)}
									</div>
								</div>
							)}

							<div className="flex-1">
								{/* Sarlavha va tillar */}
								<h4 className="font-bold text-gray-800 text-lg mb-2">
									{content.title_uz || 'Nomsiz yangilik'}
								</h4>

								<div className="flex flex-wrap gap-2 mb-3">
									{content.title_ru && (
										<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
											<Globe size={10} /> RU
										</span>
									)}
									{content.title_en && (
										<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs flex items-center gap-1">
											<Globe size={10} /> EN
										</span>
									)}
									<span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center gap-1">
										<Tag size={10} /> Yangilik
									</span>
								</div>

								{/* Qisqa tavsif */}
								<div className="mb-3">
									<div
										className="text-gray-600 text-sm leading-relaxed line-clamp-2"
										dangerouslySetInnerHTML={{
											__html: content.description_uz
												? (content.description_uz.length > 200
													? `${content.description_uz.substring(0, 200)}...`
													: content.description_uz)
												: 'Tavsif mavjud emas'
										}}
									/>
								</div>

								{/* Rasmlar gridi */}
								{content.photos && content.photos.length > 1 && (
									<div className="mb-3">
										<div className="grid grid-cols-3 gap-1">
											{content.photos.slice(1, 4).map((photo, index) => (
												<div key={index} className="aspect-square rounded overflow-hidden">
													<img
														src={`${BASE_URL}${photo}`}
														alt={`${content.title_uz} ${index + 2}`}
														className="w-full h-full object-cover"
													/>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Meta ma'lumotlar */}
								<div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t">
									<span className="flex items-center gap-1">
										<Calendar size={10} />
										{new Date(content.createdAt).toLocaleDateString()}
									</span>
									<span className="flex items-center gap-1">
										<Clock size={10} />
										{formatTimeAgo(content.createdAt)}
									</span>
									<span className="flex items-center gap-1">
										<Eye size={10} />
										0 ko'rish
									</span>
									{content.photos && content.photos.length > 0 && (
										<span className="flex items-center gap-1">
											<ImageIcon size={10} />
											{content.photos.length} rasm
										</span>
									)}
								</div>
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
							<p className="text-gray-600">{page.slug} • Yangiliklar</p>
						</div>
					</div>
					<button
						onClick={handleAddNew}
						className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<Plus size={20} />
						Yangi Yangilik
					</button>
				</div>

				{/* Qidiruv paneli */}
				<div className="relative">
					<Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
					<input
						type="text"
						placeholder="Yangiliklarni qidirish (sarlavha, mazmun)..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						autocomplete="off" // Qidiruv input'ida ham autocomplete o'chirish
					/>
				</div>
			</div>

			{/* Yangiliklar ro'yxati */}
			<div className="bg-white rounded-xl shadow-lg p-6">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-semibold text-gray-800">Mavjud Yangiliklar</h3>
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
						<Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<h3 className="text-gray-600 mb-2">Yangiliklar topilmadi</h3>
						<p className="text-gray-500 text-sm mb-4">
							{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi yangilikni yarating"}
						</p>
						{!searchTerm && (
							<button
								onClick={handleAddNew}
								className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
							>
								Yangi Yangilik
							</button>
						)}
					</div>
				) : (
					<div className="space-y-4">
						{filteredContents.map(renderNewsCard)}
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
									{editingContent ? 'Yangilikni Yangilash' : 'Yangi Yangilik Qo\'shish'}
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
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<TrendingUp size={20} />
									Yangilik Sarlavhalari
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
											placeholder="Yangilik sarlavhasi"
											required
											autoComplete="off" // Autocomplete o'chirish
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
											placeholder="News title"
											required
											autoComplete="off" // Autocomplete o'chirish
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
											placeholder="Название новости"
											required
											autoComplete="off" // Autocomplete o'chirish
										/>

									</div>
								</div>
							</div>

							{/* 2. Yangilik mazmuni */}
							<div className="space-y-6">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<BookOpen size={20} />
									Yangilik Mazmuni
								</h3>
								{/* O'zbekcha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Yangilik matni (O'zbekcha) *
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm relative">
										{/* Autocomplete bloklovchi overlay */}
										<div className="absolute inset-0 z-10 pointer-events-none"></div>
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => {
												editorRefUz.current = editor

												// Editor iframe'ga autocomplete attribute'larini qo'shish
												const iframe = editor.iframeElement
												if (iframe) {
													iframe.setAttribute('autocomplete', 'off')
													iframe.setAttribute('autocorrect', 'off')
													iframe.setAttribute('autocapitalize', 'off')
													iframe.setAttribute('spellcheck', 'false')
												}

												// Editor body'siga ham attribute qo'shish
												const body = editor.getBody()
												body.setAttribute('autocomplete', 'new-password')
												body.setAttribute('autocorrect', 'off')
												body.setAttribute('autocapitalize', 'none')
												body.setAttribute('spellcheck', 'false')
												body.setAttribute('data-gramm', 'false')
											}}
											value={formData.description_uz}
											onEditorChange={(content) => handleEditorChange(content, 'uz')}
											init={editorConfig}
										/>
									</div>
								</div>

								{/* Ruscha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Yangilik matni (Ruscha) *
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm relative">
										<div className="absolute inset-0 z-10 pointer-events-none"></div>
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => {
												editorRefRu.current = editor

												const iframe = editor.iframeElement
												if (iframe) {
													iframe.setAttribute('autocomplete', 'off')
													iframe.setAttribute('spellcheck', 'false')
												}

												const body = editor.getBody()
												body.setAttribute('autocomplete', 'new-password')
												body.setAttribute('spellcheck', 'false')
											}}
											value={formData.description_ru}
											onEditorChange={(content) => handleEditorChange(content, 'ru')}
											init={editorConfig}
										/>
									</div>
								</div>

								{/* Inglizcha editor */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Yangilik matni (Inglizcha) *
									</label>
									<div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm relative">
										<div className="absolute inset-0 z-10 pointer-events-none"></div>
										<Editor
											apiKey="r5lfyl7ylmdyglwp6ko95tl32asjztyc5ol9071lis988w0m"
											onInit={(evt, editor) => {
												editorRefEn.current = editor

												const iframe = editor.iframeElement
												if (iframe) {
													iframe.setAttribute('autocomplete', 'off')
													iframe.setAttribute('spellcheck', 'false')
												}

												const body = editor.getBody()
												body.setAttribute('autocomplete', 'new-password')
												body.setAttribute('spellcheck', 'false')
											}}
											value={formData.description_en}
											onEditorChange={(content) => handleEditorChange(content, 'en')}
											init={editorConfig}
										/>
									</div>

								</div>
							</div>

							{/* 3. Yangilik rasmlari */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
									<ImageIcon size={20} />
									Yangilik Rasmlari (Asosiy)
								</h3>
								{mediaPreviews.length > 0 && (
									<div className="space-y-3">
										<h4 className="text-sm font-medium text-gray-700">
											Tanlangan rasmlar ({mediaPreviews.length} ta):
										</h4>

										{/* Rasmlar gridi */}
										<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
											{mediaPreviews.map((preview, index) => (
												<div key={index} className="group relative rounded-lg overflow-hidden border border-gray-200">
													<div className="aspect-video bg-gray-100">
														<img
															src={preview.url}
															alt={`Preview ${index + 1}`}
															className="w-full h-full object-cover group-hover:scale-105 transition-transform"
														/>
													</div>

													{/* Fayl nomi */}
													<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
														<p className="text-white text-xs truncate">{preview.name}</p>
														{preview.size > 0 && (
															<p className="text-white/70 text-xs">{formatFileSize(preview.size)}</p>
														)}
													</div>

													{/* Asosiy rasm belgisi */}
													{index === 0 && (
														<div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
															ASOSIY
														</div>
													)}

													{/* O'chirish tugmasi */}
													<button
														type="button"
														onClick={() => removeMediaPreview(index)}
														className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
														title="O'chirish"
													>
														<X size={12} />
													</button>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Rasm yuklash qismi */}
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
									<input
										type="file"
										accept="image/*"
										onChange={handleMediaChange}
										className="hidden"
										id="image-upload"
										multiple
									/>
									<label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
										<Upload className="w-12 h-12 text-gray-400 mb-4" />
										<p className="text-gray-600 text-lg mb-2">Yangilik rasmlarini yuklang</p>
										<p className="text-sm text-gray-500 mb-3">
											Bir nechta rasm tanlash mumkin. Birinchi rasm asosiy sifatida tanlanadi.
										</p>
										<div className="flex items-center justify-center gap-4 text-xs text-gray-500">
											<div className="flex items-center gap-1">
												<ImageIcon className="w-4 h-4" />
												<span>JPG, PNG, WEBP</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												<span>Max 5MB</span>
											</div>
										</div>
										<button
											type="button"
											onClick={() => document.getElementById('image-upload').click()}
											className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
										>
											Rasmlarni tanlash
										</button>
									</label>
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

export default NewsContent
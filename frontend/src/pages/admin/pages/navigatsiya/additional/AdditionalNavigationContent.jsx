import { Editor } from '@tinymce/tinymce-react'
import axios from 'axios'
import { Briefcase, Clock, Edit, FileText, Mail, MapPin, Phone, Plus, Save, Search, Trash2, Upload, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const AdditionalNavigationContent = () => {
	const [pages, setPages] = useState([])
	const [selectedPage, setSelectedPage] = useState(null)
	const [contents, setContents] = useState([])
	const [filteredContents, setFilteredContents] = useState([])
	const [loading, setLoading] = useState(true)
	const [contentLoading, setContentLoading] = useState(false)
	const [showContentForm, setShowContentForm] = useState(false)
	const [editingContent, setEditingContent] = useState(null)
	const [uploadingPhotos, setUploadingPhotos] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [formData, setFormData] = useState({
		title_uz: '',
		title_ru: '',
		title_en: '',
		description_uz: '',
		description_ru: '',
		description_en: '',
		// LEADER uchun qo'shimcha maydonlar
		fullName_uz: '',
		fullName_ru: '',
		fullName_en: '',
		position_uz: '',
		position_ru: '',
		position_en: '',
		phone: '',
		email: '',
		address_uz: '',
		address_ru: '',
		address_en: '',
		working_hours_uz: '',
		working_hours_ru: '',
		working_hours_en: '',
		task_uz: '',
		task_ru: '',
		task_en: '', // Faqat bir marta task_en qo'shildi
		biography_uz: '',
		biography_ru: '',
		biography_en: '',
		photos: []
	})
	const [selectedMedia, setSelectedMedia] = useState([])
	const [mediaPreviews, setMediaPreviews] = useState([])
	const [removedMedia, setRemovedMedia] = useState([])
	const [selectedPhoto, setSelectedPhoto] = useState(null)
	const [photoPreview, setPhotoPreview] = useState(null)

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
		font_family_formats: 'Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva',
		font_size_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px 48px 60px 72px',
		block_formats: 'Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3; Header 4=h4; Header 5=h5; Header 6=h6',
		quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
		quickbars_insert_toolbar: 'quickimage quicktable',
		toolbar_mode: 'sliding',
		contextmenu: 'link image table',
		paste_data_images: true,
		images_upload_url: `${BASE_URL}/api/upload`,
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

	useEffect(() => {
		fetchPages()
	}, [])

	useEffect(() => {
		if (selectedPage) {
			fetchContents()
		}
	}, [selectedPage])

	useEffect(() => {
		if (searchTerm.trim() === '') {
			setFilteredContents(contents)
		} else {
			const filtered = contents.filter(item => {
				const title = getContentTitle(item)?.toLowerCase()
				const desc = getContentDescription(item)?.toLowerCase()
				const fullname = item.fullName_uz?.toLowerCase() || item.fullname_uz?.toLowerCase()
				const position = item.position_uz?.toLowerCase()
				const phone = item.phone?.toLowerCase()
				const email = item.email?.toLowerCase()

				const search = searchTerm.toLowerCase()
				return title?.includes(search) ||
					desc?.includes(search) ||
					fullname?.includes(search) ||
					position?.includes(search) ||
					phone?.includes(search) ||
					email?.includes(search)
			})
			setFilteredContents(filtered)
		}
	}, [searchTerm, contents])

	const fetchPages = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/pages/AdditCon`)

			if (response.data.success) {
				setPages(response.data.pages)
			} else {
				alert('Navigatsiyalarni yuklashda xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Navigatsiyalarni yuklashda xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	const fetchContents = async () => {
		if (!selectedPage) return

		try {
			setContentLoading(true)
			let endpoint = ''
			let responseKey = ''

			switch (selectedPage.type) {
				case 'static':
					endpoint = `${BASE_URL}/api/generalabout/getAll/${selectedPage.key}`
					responseKey = 'abouts'
					break
				case 'news':
					endpoint = `${BASE_URL}/api/generalnews/getAll/${selectedPage.key}`
					responseKey = 'news'
					break
				case 'gallery':
					endpoint = `${BASE_URL}/api/generalgallery/getAll/${selectedPage.key}`
					responseKey = 'gallarys'
					break
				case 'documents':
					endpoint = `${BASE_URL}/api/generalannouncement/getAll/${selectedPage.key}`
					responseKey = 'announcements'
					break
				case 'leader':
					endpoint = `${BASE_URL}/api/generalleader/getAll/${selectedPage.key}`
					responseKey = 'leaders'
					break
				default:
					return
			}

			const response = await axios.get(endpoint)
			if (response.data.success) {
				const contentData = response.data[responseKey] || []
				setContents(contentData)
				setFilteredContents(contentData)
			} else {
				setContents([])
				setFilteredContents([])
			}
		} catch (error) {
			console.error('Kontentlarni yuklashda xatolik:', error)
			setContents([])
			setFilteredContents([])
		} finally {
			setContentLoading(false)
		}
	}

	const handlePageSelect = (page) => {
		setSelectedPage(page)
		setShowContentForm(false)
		setEditingContent(null)
		setSearchTerm('')
		resetForm()
	}

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}))
	}

	// Editor inputlarini boshqarish
	const handleEditorChange = (content, language) => {
		setFormData(prev => ({
			...prev,
			[`description_${language}`]: content
		}))
	}

	// Fayl turini aniqlash (video yoki rasm)
	const getMediaType = (file) => {
		if (!file) return 'image'
		const fileName = file.name || file
		const extension = fileName.split('.').pop()?.toLowerCase()
		const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv']
		return videoExtensions.includes(extension) ? 'video' : 'image'
	}

	// Media fayllarni yuklash (galereya va documents uchun)
	const handleMediaChange = (e) => {
		const files = Array.from(e.target.files)
		const newSelectedMedia = [...selectedMedia, ...files]
		setSelectedMedia(newSelectedMedia)

		// Preview yaratish
		const newPreviews = files.map(file => {
			const type = getMediaType(file)
			if (type === 'video') {
				return {
					type: 'video',
					url: URL.createObjectURL(file),
					name: file.name
				}
			} else {
				return {
					type: 'image',
					url: URL.createObjectURL(file),
					name: file.name
				}
			}
		})
		setMediaPreviews(prev => [...prev, ...newPreviews])
		e.target.value = ''
	}

	// Bitta rasm yuklash (leader uchun)
	const handlePhotoChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			setSelectedPhoto(file)
			setPhotoPreview(URL.createObjectURL(file))
		}
		e.target.value = ''
	}

	// Tanlangan mediani o'chirish
	const removeMediaPreview = (index) => {
		const newPreviews = [...mediaPreviews]
		const removedPreview = newPreviews.splice(index, 1)[0]

		if (removedPreview.url.startsWith('blob:')) {
			URL.revokeObjectURL(removedPreview.url)
		}

		setMediaPreviews(newPreviews)

		const newMedia = [...selectedMedia]
		newMedia.splice(index, 1)
		setSelectedMedia(newMedia)
	}

	// Mavjud mediani o'chirish
	const removeExistingMedia = (index) => {
		const updatedPreviews = [...mediaPreviews]
		const removedPreview = updatedPreviews.splice(index, 1)[0]

		// Agar bu mavjud media bo'lsa, removedMedia ga qo'shamiz
		if (removedPreview.url.startsWith(BASE_URL)) {
			const mediaPath = removedPreview.url.replace(BASE_URL, '')
			setRemovedMedia(prev => [...prev, mediaPath])
		}

		setMediaPreviews(updatedPreviews)
	}

	// Rasm preview'ni o'chirish (leader uchun)
	const removePhotoPreview = () => {
		if (photoPreview && photoPreview.startsWith('blob:')) {
			URL.revokeObjectURL(photoPreview)
		}
		setPhotoPreview(null)
		setSelectedPhoto(null)
	}

	// Mavjud rasmni o'chirish (leader uchun)
	const removeExistingPhoto = () => {
		if (photoPreview && photoPreview.startsWith(BASE_URL)) {
			const photoPath = photoPreview.replace(BASE_URL, '')
			setRemovedMedia(prev => [...prev, photoPath])
		}
		setPhotoPreview(null)
	}

	const handleSubmitContent = async (e) => {
		e.preventDefault()
		if (!selectedPage) {
			alert('Iltimos, avval navigatsiyani tanlang!')
			return
		}

		try {
			setContentLoading(true)

			let endpoint = ''
			let submitData

			if (selectedPage.type === 'gallery' || selectedPage.type === 'documents') {
				// Gallery va Documents uchun FormData yaratamiz
				submitData = new FormData()
				submitData.append('title_uz', formData.title_uz)
				submitData.append('title_ru', formData.title_ru)
				submitData.append('title_en', formData.title_en)
				submitData.append('key', selectedPage.key)

				// Gallery va Documents uchun description qo'shamiz
				if (selectedPage.type === 'documents') {
					submitData.append('description_uz', formData.description_uz)
					submitData.append('description_ru', formData.description_ru)
					submitData.append('description_en', formData.description_en)
				}

				// Yangi media fayllarni qo'shish
				selectedMedia.forEach(media => {
					submitData.append('photos', media)
				})

				// O'chirilgan media'larni yuborish (faqat tahrirlashda)
				if (editingContent) {
					removedMedia.forEach(mediaPath => {
						submitData.append('removedPhotos', mediaPath)
					})
				}

				// Endpointlarni aniqlash
				switch (selectedPage.type) {
					case 'gallery':
						endpoint = editingContent
							? `${BASE_URL}/api/generalgallery/update/${editingContent._id}`
							: `${BASE_URL}/api/generalgallery/create`
						break
					case 'documents':
						endpoint = editingContent
							? `${BASE_URL}/api/generalannouncement/update/${editingContent._id}`
							: `${BASE_URL}/api/generalannouncement/create`
						break
				}
			} else if (selectedPage.type === 'leader') {
				// LEADER uchun FormData yaratamiz
				submitData = new FormData()

				// Asosiy ma'lumotlar
				submitData.append('fullName_uz', formData.fullName_uz)
				submitData.append('fullName_ru', formData.fullName_ru)
				submitData.append('fullName_en', formData.fullName_en)
				submitData.append('position_uz', formData.position_uz)
				submitData.append('position_ru', formData.position_ru)
				submitData.append('position_en', formData.position_en)

				// Aloqa ma'lumotlari
				submitData.append('phone', formData.phone)
				submitData.append('email', formData.email)
				submitData.append('address_uz', formData.address_uz)
				submitData.append('address_ru', formData.address_ru)
				submitData.append('address_en', formData.address_en)
				submitData.append('working_hours_uz', formData.working_hours_uz)
				submitData.append('working_hours_ru', formData.working_hours_ru)
				submitData.append('working_hours_en', formData.working_hours_en)

				// Vazifalar va biografiya
				submitData.append('task_uz', formData.task_uz)
				submitData.append('task_ru', formData.task_ru)
				submitData.append('task_en', formData.task_en)
				submitData.append('biography_uz', formData.biography_uz)
				submitData.append('biography_ru', formData.biography_ru)
				submitData.append('biography_en', formData.biography_en)

				// Key va sahifa ma'lumotlari
				submitData.append('key', selectedPage.key)

				// Title uchun fullName'dan foydalanamiz
				submitData.append('title_uz', formData.fullName_uz)
				submitData.append('title_ru', formData.fullName_ru)
				submitData.append('title_en', formData.fullName_en)

				// Rasm yuklash
				if (selectedPhoto) {
					submitData.append('photo', selectedPhoto)
				}

				// O'chirilgan rasmni yuborish (faqat tahrirlashda)
				if (editingContent) {
					removedMedia.forEach(photoPath => {
						submitData.append('removedPhotos', photoPath)
					})
				}

				endpoint = editingContent
					? `${BASE_URL}/api/generalleader/update/${editingContent._id}`
					: `${BASE_URL}/api/generalleader/create`
			} else {
				// Static va News uchun oddiy JSON data
				submitData = {
					...formData,
					key: selectedPage.key
				}

				switch (selectedPage.type) {
					case 'static':
						endpoint = editingContent
							? `${BASE_URL}/api/generalabout/update/${editingContent._id}`
							: `${BASE_URL}/api/generalabout/create`
						break
					case 'news':
						endpoint = editingContent
							? `${BASE_URL}/api/generalnews/update/${editingContent._id}`
							: `${BASE_URL}/api/generalnews/create`
						break
					default:
						return
				}
			}

			const response = editingContent
				? await axios.put(endpoint, submitData,
					(selectedPage.type === 'gallery' || selectedPage.type === 'documents' || selectedPage.type === 'leader') ? {
						headers: {
							'Content-Type': 'multipart/form-data'
						}
					} : {})
				: await axios.post(endpoint, submitData,
					(selectedPage.type === 'gallery' || selectedPage.type === 'documents' || selectedPage.type === 'leader') ? {
						headers: {
							'Content-Type': 'multipart/form-data'
						}
					} : {})

			if (response.data.success) {
				const message = editingContent ? 'Kontent muvaffaqiyatli yangilandi!' : 'Kontent muvaffaqiyatli qo\'shildi!'
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

	const handleAddNew = () => {
		setEditingContent(null)
		resetForm()
		setShowContentForm(true)
	}

	const handleEditContent = (content) => {
		setEditingContent(content)

		if (selectedPage?.type === 'leader') {
			// LEADER uchun form ma'lumotlarini to'ldirish
			setFormData({
				title_uz: content.title_uz || '',
				title_ru: content.title_ru || '',
				title_en: content.title_en || '',
				fullName_uz: content.fullName_uz || content.fullname_uz || '',
				fullName_ru: content.fullName_ru || content.fullname_ru || '',
				fullName_en: content.fullName_en || content.fullname_en || '',
				position_uz: content.position_uz || '',
				position_ru: content.position_ru || '',
				position_en: content.position_en || '',
				phone: content.phone || '',
				email: content.email || '',
				address_uz: content.address_uz || '',
				address_ru: content.address_ru || '',
				address_en: content.address_en || '',
				working_hours_uz: content.working_hours_uz || '',
				working_hours_ru: content.working_hours_ru || '',
				working_hours_en: content.working_hours_en || '',
				task_uz: content.task_uz || '',
				task_ru: content.task_ru || '',
				task_en: content.task_en || '',
				biography_uz: content.biography_uz || '',
				biography_ru: content.biography_ru || '',
				biography_en: content.biography_en || '',
				description_uz: '',
				description_ru: '',
				description_en: '',
				photos: content.photos || []
			})

			// Rasm preview'ni o'rnatish
			if (content.photo) {
				setPhotoPreview(`${BASE_URL}${content.photo}`)
			} else {
				setPhotoPreview(null)
			}
		} else {
			// Boshqa turlar uchun oddiy form to'ldirish
			setFormData({
				title_uz: content.title_uz || '',
				title_ru: content.title_ru || '',
				title_en: content.title_en || '',
				description_uz: content.description_uz || '',
				description_ru: content.description_ru || '',
				description_en: content.description_en || '',
				photos: content.photos || []
			})

			// Gallery va Documents uchun media previewlarni o'rnatish
			if (selectedPage?.type === 'gallery' || selectedPage?.type === 'documents') {
				const existingPreviews = (content.photos || []).map(photo => {
					const type = getMediaType(photo)
					return {
						type: type,
						url: `${BASE_URL}${photo}`,
						name: photo
					}
				})
				setMediaPreviews(existingPreviews)
			} else {
				// Boshqa turlar uchun oddiy photo preview
				setMediaPreviews((content.photos || []).map(photo => `${BASE_URL}${photo}`))
			}
		}

		setSelectedMedia([])
		setRemovedMedia([])
		setSelectedPhoto(null)
		setShowContentForm(true)
	}

	const handleDeleteContent = async (contentId, contentTitle) => {
		const title = getContentTitle(contentTitle)
		if (window.confirm(`"${title}" kontentini o'chirishni istaysizmi?`)) {
			try {
				let endpoint = ''
				switch (selectedPage.type) {
					case 'static':
						endpoint = `${BASE_URL}/api/generalabout/delete/${contentId}`
						break
					case 'news':
						endpoint = `${BASE_URL}/api/generalnews/delete/${contentId}`
						break
					case 'gallery':
						endpoint = `${BASE_URL}/api/generalgallery/delete/${contentId}`
						break
					case 'documents':
						endpoint = `${BASE_URL}/api/generalannouncement/delete/${contentId}`
						break
					case 'leader':
						endpoint = `${BASE_URL}/api/generalleader/delete/${contentId}`
						break
				}

				const response = await axios.delete(endpoint)

				if (response.data.success) {
					alert('Kontent muvaffaqiyatli o\'chirildi!')
					fetchContents()
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert("Kontentni o'chirishda xatolik yuz berdi")
			}
		}
	}

	const resetForm = () => {
		setFormData({
			title_uz: '',
			title_ru: '',
			title_en: '',
			fullName_uz: '',
			fullName_ru: '',
			fullName_en: '',
			position_uz: '',
			position_ru: '',
			position_en: '',
			phone: '',
			email: '',
			address_uz: '',
			address_ru: '',
			address_en: '',
			working_hours_uz: '',
			working_hours_ru: '',
			working_hours_en: '',
			task_uz: '',
			task_ru: '',
			task_en: '',
			biography_uz: '',
			biography_ru: '',
			biography_en: '',
			description_uz: '',
			description_ru: '',
			description_en: '',
			photos: []
		})
		setSelectedMedia([])
		setMediaPreviews([])
		setRemovedMedia([])
		setSelectedPhoto(null)
		setPhotoPreview(null)
	}

	const closeModal = () => {
		setShowContentForm(false)
		setEditingContent(null)
		resetForm()
	}

	const getContentTitle = (content) => {
		if (content.fullName_uz) {
			return content.fullName_uz
		}
		if (content.fullname_uz) {
			return content.fullname_uz
		}
		return content.title_uz || content.title?.uz || 'Nomsiz'
	}

	const getContentDescription = (content) => {
		if (selectedPage?.type === 'leader') {
			return content.position_uz || content.position?.uz || 'Lavozim ko\'rsatilmagan'
		}
		return content.description_uz || content.description?.uz || ''
	}

	// HTML taglarini olib tashlash
	const stripHtml = (html) => {
		if (!html) return ''
		const tmp = document.createElement("DIV")
		tmp.innerHTML = html
		return tmp.textContent || tmp.innerText || ""
	}

	// Media'lar sonini hisoblash
	const getMediaCounts = (content) => {
		if (!content.photos) return { images: 0, videos: 0 }

		const images = content.photos.filter(photo => getMediaType(photo) === 'image').length
		const videos = content.photos.filter(photo => getMediaType(photo) === 'video').length

		return { images, videos }
	}

	const renderPhotoSection = () => {
		if (!['news', 'gallery', 'documents', 'leader'].includes(selectedPage?.type)) return null

		if (selectedPage.type === 'leader') {
			// LEADER uchun bitta rasm yuklash
			return (
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
						Rahbar Rasmi
					</h3>

					{photoPreview ? (
						<div className="flex items-start gap-6">
							<div className="relative">
								<img
									src={photoPreview}
									alt="Rahbar rasmi"
									className="w-48 h-48 object-cover rounded-lg border-2 border-blue-200"
								/>
								<button
									type="button"
									onClick={() => {
										if (photoPreview.startsWith(BASE_URL)) {
											removeExistingPhoto()
										} else {
											removePhotoPreview()
										}
									}}
									className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
								>
									<X size={16} />
								</button>
							</div>
							<div className="flex-1">
								<p className="text-sm text-gray-600 mb-3">
									Rahbar rasmi. Rasm formati: JPEG, PNG, JPG.
									Rasm o'lchami: 500x500 piksel yoki undan katta.
								</p>
								<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
									<input
										type="file"
										accept="image/*"
										onChange={handlePhotoChange}
										className="hidden"
										id="leader-photo-upload"
									/>
									<label htmlFor="leader-photo-upload" className="cursor-pointer flex flex-col items-center">
										<Upload className="w-8 h-8 text-gray-400 mb-2" />
										<p className="text-gray-600">Rasmni almashtirish</p>
										<p className="text-sm text-gray-500 mt-1">Yangi rasmni tanlang</p>
									</label>
								</div>
							</div>
						</div>
					) : (
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
							<input
								type="file"
								accept="image/*"
								onChange={handlePhotoChange}
								className="hidden"
								id="leader-photo-upload"
							/>
							<label htmlFor="leader-photo-upload" className="cursor-pointer flex flex-col items-center">
								<Upload className="w-12 h-12 text-gray-400 mb-4" />
								<p className="text-gray-600 text-lg mb-2">Rasm yuklang</p>
								<p className="text-sm text-gray-500 mb-3">Rahbar uchun rasmini tanlang</p>
								<button
									type="button"
									onClick={() => document.getElementById('leader-photo-upload').click()}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Rasm tanlash
								</button>
							</label>
						</div>
					)}
				</div>
			)
		} else if (selectedPage.type === 'gallery') {
			// Gallery uchun maxsus media section
			return (
				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Media Fayllar ({mediaPreviews.length} ta) *
						<span className="text-xs text-gray-500 ml-2">(Rasm va Video qo'shish mumkin)</span>
					</label>

					{mediaPreviews.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{mediaPreviews.map((preview, index) => (
								<div key={index} className="relative group">
									{preview.type === 'video' ? (
										<div className="w-full h-24 bg-gray-800 rounded-lg flex items-center justify-center relative">
											<video className="w-full h-full object-cover rounded-lg">
												<source src={preview.url} type="video/mp4" />
											</video>
											<div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
												<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
													<path d="M8 5v14l11-7z" />
												</svg>
											</div>
											<div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded">
												VIDEO
											</div>
										</div>
									) : (
										<img
											src={preview.url}
											alt={`Preview ${index + 1}`}
											className="w-full h-24 object-cover rounded-lg border"
										/>
									)}
									<button
										type="button"
										onClick={() => {
											if (preview.url.startsWith(BASE_URL)) {
												removeExistingMedia(index)
											} else {
												removeMediaPreview(index)
											}
										}}
										className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
									>
										<X size={12} />
									</button>
								</div>
							))}
						</div>
					)}

					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
						<input
							type="file"
							accept="image/*,video/*"
							onChange={handleMediaChange}
							className="hidden"
							id="media-upload"
							multiple
						/>
						<label htmlFor="media-upload" className="cursor-pointer flex flex-col items-center">
							<Upload className="w-8 h-8 text-gray-400 mb-2" />
							<p className="text-gray-600">Rasm va Videolarni tanlang</p>
							<p className="text-sm text-gray-500 mt-1">(MP4, AVI, MOV, JPEG, PNG va boshqalar)</p>
						</label>
					</div>
				</div>
			)
		} else {
			// News va Documents uchun oddiy rasm yuklash
			return (
				<div className="space-y-4">
					<label className="block text-sm font-medium text-gray-700">
						Rasmlar ({mediaPreviews.length} ta)
					</label>

					{mediaPreviews.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{mediaPreviews.map((preview, index) => (
								<div key={index} className="relative">
									<img
										src={typeof preview === 'string' ? preview : preview.url}
										alt={`Preview ${index + 1}`}
										className="w-full h-24 object-cover rounded-lg border"
									/>
									<button
										type="button"
										onClick={() => {
											const previewUrl = typeof preview === 'string' ? preview : preview.url
											if (previewUrl.startsWith(BASE_URL)) {
												removeExistingMedia(index)
											} else {
												removeMediaPreview(index)
											}
										}}
										className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
									>
										<X size={12} />
									</button>
								</div>
							))}
						</div>
					)}

					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
						<input
							type="file"
							accept="image/*"
							onChange={handleMediaChange}
							className="hidden"
							id="photo-upload"
							multiple
						/>
						<label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
							<Upload className="w-8 h-8 text-gray-400 mb-2" />
							<p className="text-gray-600">Rasmlarni tanlang</p>
							<p className="text-sm text-gray-500 mt-1">Bir nechta rasm tanlash mumkin</p>
						</label>
					</div>
				</div>
			)
		}
	}

	// LEADER uchun maxsus form qismlari
	const renderLeaderFormSections = () => {
		if (selectedPage?.type !== 'leader') return null

		return (
			<>
				{/* 1. Asosiy ma'lumotlar */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
						<User size={20} />
						Asosiy Ma'lumotlar
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="md:col-span-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Familiya Ismi Sharifi (O'zbekcha) *
							</label>
							<input
								type="text"
								value={formData.fullName_uz}
								onChange={(e) => handleInputChange('fullName_uz', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Abdullayev Akmaljon Bahodirovich"
								required
							/>
						</div>
						<div className="md:col-span-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Full Name (English) *
							</label>
							<input
								type="text"
								value={formData.fullName_en}
								onChange={(e) => handleInputChange('fullName_en', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Abdullayev Akmaljon Bahodirovich"
								required
							/>
						</div>
						<div className="md:col-span-1">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Фамилия Имя Отчество (Русский) *
							</label>
							<input
								type="text"
								value={formData.fullName_ru}
								onChange={(e) => handleInputChange('fullName_ru', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Абдуллаев Акмалжон Баходирович"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Lavozimi (O'zbekcha) *
							</label>
							<input
								type="text"
								value={formData.position_uz}
								onChange={(e) => handleInputChange('position_uz', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Direktor"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Position (English) *
							</label>
							<input
								type="text"
								value={formData.position_en}
								onChange={(e) => handleInputChange('position_en', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Director"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Должность (Русский) *
							</label>
							<input
								type="text"
								value={formData.position_ru}
								onChange={(e) => handleInputChange('position_ru', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Директор"
								required
							/>
						</div>
					</div>
				</div>

				{/* 2. Aloqa ma'lumotlari */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
						<Phone size={20} />
						Aloqa Ma'lumotlari
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
								<Phone size={16} />
								Telefon raqami *
							</label>
							<input
								type="tel"
								value={formData.phone}
								onChange={(e) => handleInputChange('phone', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="+998901234567"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
								<Mail size={16} />
								Elektron pochta *
							</label>
							<input
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange('email', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="example@mail.uz"
								required
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
								<MapPin size={16} />
								Manzil (O'zbekcha)
							</label>
							<textarea
								value={formData.address_uz}
								onChange={(e) => handleInputChange('address_uz', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="3"
								placeholder="Toshkent shahri, Amir Temur ko'chasi"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Address (English)
							</label>
							<textarea
								value={formData.address_en}
								onChange={(e) => handleInputChange('address_en', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="3"
								placeholder="Tashkent city, Amir Temur street"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Адрес (Русский)
							</label>
							<textarea
								value={formData.address_ru}
								onChange={(e) => handleInputChange('address_ru', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="3"
								placeholder="г. Ташкент, улица Амира Темура"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
								<Clock size={16} />
								Ish vaqti (O'zbekcha)
							</label>
							<input
								type="text"
								value={formData.working_hours_uz}
								onChange={(e) => handleInputChange('working_hours_uz', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Dushanba - Juma, 09:00 - 18:00"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Working Hours (English)
							</label>
							<input
								type="text"
								value={formData.working_hours_en}
								onChange={(e) => handleInputChange('working_hours_en', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Monday - Friday, 09:00 - 18:00"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Рабочее время (Русский)
							</label>
							<input
								type="text"
								value={formData.working_hours_ru}
								onChange={(e) => handleInputChange('working_hours_ru', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Понедельник - Пятница, 09:00 - 18:00"
							/>
						</div>
					</div>
				</div>

				{/* 3. Vazifalar va Biografiya */}
				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
						<Briefcase size={20} />
						Vazifalar va Biografiya
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Vazifalari (O'zbekcha)
							</label>
							<textarea
								value={formData.task_uz}
								onChange={(e) => handleInputChange('task_uz', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="5"
								placeholder="Boshqaruv faoliyati, qabul qilish, mas'uliyatlar..."
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Responsibilities (English)
							</label>
							<textarea
								value={formData.task_en}
								onChange={(e) => handleInputChange('task_en', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="5"
								placeholder="Management activities, receptions, responsibilities..."
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Обязанности (Русский)
							</label>
							<textarea
								value={formData.task_ru}
								onChange={(e) => handleInputChange('task_ru', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="5"
								placeholder="Управленческая деятельность, приемы, обязанности..."
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Biografiya (O'zbekcha)
							</label>
							<textarea
								value={formData.biography_uz}
								onChange={(e) => handleInputChange('biography_uz', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="6"
								placeholder="Tug'ilgan yili, ta'lim, ish tajribasi..."
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Biography (English)
							</label>
							<textarea
								value={formData.biography_en}
								onChange={(e) => handleInputChange('biography_en', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="6"
								placeholder="Year of birth, education, work experience..."
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Биография (Русский)
							</label>
							<textarea
								value={formData.biography_ru}
								onChange={(e) => handleInputChange('biography_ru', e.target.value)}
								className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows="6"
								placeholder="Год рождения, образование, трудовой стаж..."
							/>
						</div>
					</div>
				</div>
			</>
		)
	}

	// Oddiy form uchun title inputlari
	const renderTitleSection = () => {
		if (selectedPage?.type === 'leader') return null // Leader uchun alohida section bor

		return (
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Sarlavha</h3>
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
							required
						/>
					</div>
				</div>
			</div>
		)
	}

	// TinyMCE editor ni render qilish (leader uchun emas)
	const renderEditorSection = () => {
		if (selectedPage?.type === 'gallery' || selectedPage?.type === 'leader') return null

		return (
			<div className="space-y-6">
				{/* O'zbekcha editor */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Tavsif (O'zbekcha) {selectedPage?.type !== 'gallery' ? '*' : ''}
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

				{/* Ruscha editor */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Tavsif (Ruscha) {selectedPage?.type !== 'gallery' ? '*' : ''}
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

				{/* Inglizcha editor */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Tavsif (Inglizcha) {selectedPage?.type !== 'gallery' ? '*' : ''}
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
		)
	}

	// Rahbar kartasini render qilish
	const renderLeaderCard = (content) => {
		return (
			<div key={content._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
				<div className="flex gap-4">
					{/* Rasm qismi */}
					<div className="flex-shrink-0">
						{content.photo ? (
							<img
								src={`${BASE_URL}${content.photo}`}
								alt={getContentTitle(content)}
								className="w-24 h-24 object-cover rounded-lg border-2 border-blue-100"
							/>
						) : (
							<div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center border-2 border-blue-200">
								<User className="w-12 h-12 text-blue-400" />
							</div>
						)}
					</div>

					{/* Ma'lumotlar qismi */}
					<div className="flex-1">
						<div className="flex justify-between items-start">
							<div>
								<h4 className="font-bold text-gray-800 text-lg mb-1">
									{getContentTitle(content)}
								</h4>
								<p className="text-blue-600 font-medium mb-2">
									{content.position_uz || 'Lavozim ko\'rsatilmagan'}
								</p>
							</div>
							<div className="flex items-center space-x-2">
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

						{/* Aloqa ma'lumotlari */}
						<div className="space-y-1 text-sm text-gray-600">
							{content.phone && (
								<div className="flex items-center gap-2">
									<Phone size={14} />
									<span>{content.phone}</span>
								</div>
							)}
							{content.email && (
								<div className="flex items-center gap-2">
									<Mail size={14} />
									<span>{content.email}</span>
								</div>
							)}
							{content.address_uz && (
								<div className="flex items-center gap-2">
									<MapPin size={14} />
									<span className="line-clamp-1">{content.address_uz}</span>
								</div>
							)}
							{content.working_hours_uz && (
								<div className="flex items-center gap-2">
									<Clock size={14} />
									<span>{content.working_hours_uz}</span>
								</div>
							)}
						</div>

						{/* Qo'shimcha ma'lumotlar */}
						<div className="mt-3 pt-3 border-t border-gray-100">
							<div className="flex items-center gap-2 text-xs text-gray-500">
								<span>Yaratilgan: {new Date(content.createdAt).toLocaleDateString()}</span>
								<span>•</span>
								<span>Yangilangan: {new Date(content.updatedAt).toLocaleDateString()}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
				<div className="mx-auto max-w-7xl">
					<div className="animate-pulse space-y-4">
						<div className="h-10 bg-gray-300 rounded"></div>
						<div className="h-32 bg-gray-300 rounded"></div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="mx-auto max-w-7xl">
				{/* Sarlavha */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Qo'shimcha Navigatsiyaga Ma'lumot Qo'shish</h1>
					<p className="text-gray-600">Tanlangan qo'shimcha navigatsiya bo'yicha kontentlarni boshqaring</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Navigatsiyalar ro'yxati */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl shadow-lg p-6">
							<h2 className="text-lg font-semibold text-gray-800 mb-4">Qo'shimcha Navigatsiyalar</h2>
							<div className="space-y-2">
								{pages.map((page) => (
									<button
										key={page._id}
										onClick={() => handlePageSelect(page)}
										className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPage?._id === page._id
											? 'bg-blue-50 border-blue-500 text-blue-700'
											: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
											}`}
									>
										<div className="flex items-center gap-3">
											<span className="text-lg">{page.icon}</span>
											<div>
												<div className="font-medium">{page.title.uz}</div>
												<div className="text-xs text-gray-500">
													{page.slug} • {page.type}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Kontentlar va form */}
					<div className="lg:col-span-3">
						{!selectedPage ? (
							<div className="bg-white rounded-xl shadow-lg p-8 text-center">
								<FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-800 mb-2">Navigatsiya tanlang</h3>
								<p className="text-gray-600">Kontent qo'shish uchun chap tomondan qo'shimcha navigatsiyani tanlang</p>
							</div>
						) : (
							<div className="space-y-6">
								{/* Tanlangan navigatsiya ma'lumoti va qidiruv */}
								<div className="bg-white rounded-xl shadow-lg p-6">
									<div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
										<div className="flex items-center gap-3">
											<span className="text-2xl">{selectedPage.icon}</span>
											<div>
												<h3 className="text-xl font-bold text-gray-800">{selectedPage.title.uz}</h3>
												<p className="text-gray-600">
													{selectedPage.slug} • {selectedPage.type}
												</p>
											</div>
										</div>
										<button
											onClick={handleAddNew}
											className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
										>
											<Plus size={20} />
											Yangi Kontent
										</button>
									</div>

									{/* Qidiruv paneli */}
									<div className="flex-1 w-full">
										<div className="relative">
											<Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
											<input
												type="text"
												placeholder={
													selectedPage.type === 'leader'
														? "Rahbarlarni qidirish (FIO, lavozim, telefon, email)..."
														: "Kontentlarni qidirish..."
												}
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="w-full pl-10 pr-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>
									</div>
								</div>

								{/* Mavjud kontentlar ro'yxati */}
								<div className="bg-white rounded-xl shadow-lg p-6">
									<div className="flex justify-between items-center mb-4">
										<h3 className="text-lg font-semibold text-gray-800">Mavjud Kontentlar</h3>
										<span className="text-sm text-gray-600">
											{searchTerm ? `"${searchTerm}" qidiruvi: ${filteredContents.length} ta` : `Jami: ${filteredContents.length} ta`}
										</span>
									</div>

									{contentLoading ? (
										<div className="animate-pulse space-y-3">
											{[1, 2, 3].map(i => (
												<div key={i} className="h-16 bg-gray-200 rounded"></div>
											))}
										</div>
									) : filteredContents.length === 0 ? (
										<div className="text-center py-8 text-gray-500">
											<FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
											<h3 className="text-gray-600 mb-2">Kontentlar topilmadi</h3>
											<p className="text-gray-500 text-sm mb-4">
												{searchTerm ? "Boshqa so'zlar bilan qidiring" : "Birinchi kontentni yarating"}
											</p>
											{!searchTerm && (
												<button
													onClick={handleAddNew}
													className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
												>
													Yangi Kontent
												</button>
											)}
										</div>
									) : (
										<div className="space-y-4">
											{selectedPage.type === 'leader' ? (
												// LEADER uchun alohida grid layout
												<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
													{filteredContents.map((content) => renderLeaderCard(content))}
												</div>
											) : (
												// Boshqa turlar uchun oddiy layout
												filteredContents.map((content) => {
													const mediaCounts = selectedPage?.type === 'gallery' ? getMediaCounts(content) : null
													return (
														<div key={content._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
															<div className="flex justify-between items-start">
																<div className="flex-1">
																	<h4 className="font-semibold text-gray-800 text-lg mb-2">
																		{getContentTitle(content)}
																	</h4>
																	{selectedPage?.type !== 'gallery' && (
																		<div
																			className="text-gray-600 mb-3 leading-relaxed line-clamp-3"
																			dangerouslySetInnerHTML={{
																				__html: content.description_uz ?
																					(stripHtml(content.description_uz).substring(0, 300) +
																						(stripHtml(content.description_uz).length > 300 ? '...' : ''))
																					: 'Tavsif mavjud emas'
																			}}
																		/>
																	)}

																	{/* Til versiyalari */}
																	<div className="flex flex-wrap gap-2 mb-3">
																		{content.title_ru && (
																			<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
																				RU: {content.title_ru}
																			</span>
																		)}
																		{content.title_en && (
																			<span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
																				EN: {content.title_en}
																			</span>
																		)}
																	</div>

																	{/* Gallery uchun media statistikasi */}
																	{selectedPage?.type === 'gallery' && mediaCounts && (
																		<div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
																			{mediaCounts.images > 0 && (
																				<span className="flex items-center gap-1">
																					<svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
																					</svg>
																					{mediaCounts.images} rasm
																				</span>
																			)}
																			{mediaCounts.videos > 0 && (
																				<span className="flex items-center gap-1">
																					<svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
																					</svg>
																					{mediaCounts.videos} video
																				</span>
																			)}
																		</div>
																	)}

																	{content.photos && content.photos.length > 0 && (
																		<div className="flex gap-2 mt-3">
																			{content.photos.slice(0, 3).map((photo, index) => {
																				const type = getMediaType(photo)
																				return type === 'video' ? (
																					<div key={index} className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center relative">
																						<div className="absolute inset-0 bg-black bg-opacity-30 rounded flex items-center justify-center">
																							<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
																								<path d="M8 5v14l11-7z" />
																							</svg>
																						</div>
																						<div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">
																							V
																						</div>
																					</div>
																				) : (
																					<img
																						key={index}
																						src={`${BASE_URL}${photo}`}
																						alt={`Content ${index + 1}`}
																						className="w-12 h-12 object-cover rounded"
																					/>
																				)
																			})}
																			{content.photos.length > 3 && (
																				<div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs">
																					+{content.photos.length - 3}
																				</div>
																			)}
																		</div>
																	)}

																	{/* Sana ma'lumotlari */}
																	<div className="flex items-center space-x-4 text-xs text-gray-500 mt-3 pt-3 border-t">
																		<span>Yaratilgan: {new Date(content.createdAt).toLocaleDateString()}</span>
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
												})
											)}
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Modal */}
				{showContentForm && (
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
							<div className="bg-blue-600 text-white p-6 rounded-t-xl">
								<div className="flex justify-between items-center">
									<h3 className="text-xl font-bold">
										{editingContent ? 'Kontentni Yangilash' : 'Yangi Kontent Qo\'shish'}
										{selectedPage?.type === 'leader' && ' (Rahbariyat)'}
									</h3>
									<button
										onClick={closeModal}
										className="text-white hover:text-gray-200 p-1 rounded"
									>
										<X size={24} />
									</button>
								</div>
							</div>

							<form onSubmit={handleSubmitContent} className="p-6 space-y-8">
								{/* Sarlavhalar (leader uchun emas) */}
								{renderTitleSection()}

								{/* LEADER uchun maxsus form qismlari */}
								{renderLeaderFormSections()}

								{/* Tavsiflar - TinyMCE Editor (leader uchun emas) */}
								{renderEditorSection()}

								{/* Rasm/Media yuklash qismi */}
								{renderPhotoSection()}

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
		</div>
	)
}

export default AdditionalNavigationContent
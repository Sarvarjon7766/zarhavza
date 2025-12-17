// components/TinyMCEImageHandler.js
import { Loader, Upload, X } from 'lucide-react'
import { useState } from 'react'

const TinyMCEImageHandler = ({ onImageUpload, onImageRemove, existingImages = [] }) => {
	const [uploading, setUploading] = useState(false)
	const [uploadedImages, setUploadedImages] = useState(existingImages)
	const [removedImages, setRemovedImages] = useState([])

	const handleImageUpload = async (e) => {
		const files = Array.from(e.target.files)
		if (!files.length) return

		setUploading(true)

		try {
			const uploaded = []
			for (const file of files) {
				const formData = new FormData()
				formData.append('image', file)

				const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/upload/tinymce`, {
					method: 'POST',
					body: formData
				})

				const data = await response.json()
				if (data.success && data.location) {
					uploaded.push({
						url: data.location,
						filename: data.filename,
						path: data.path
					})
				}
			}

			const newImages = [...uploadedImages, ...uploaded]
			setUploadedImages(newImages)
			onImageUpload?.(uploaded.map(img => img.path))

		} catch (error) {
			console.error('Rasm yuklashda xatolik:', error)
			alert('Rasm yuklashda xatolik yuz berdi')
		} finally {
			setUploading(false)
			e.target.value = ''
		}
	}

	const handleRemoveImage = async (image, index) => {
		if (window.confirm('Bu rasmni o\'chirishni istaysizmi?')) {
			try {
				// Agar mavjud rasm bo'lsa, removedImages ga qo'shamiz
				if (image.path) {
					setRemovedImages(prev => [...prev, image.path])

					// Backendga o'chirish haqida xabar berish
					await fetch(`${import.meta.env.VITE_BASE_URL}/api/upload/remove-tinymce`, {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ path: image.path })
					})
				}

				// Frontenddan o'chiramiz
				const newImages = [...uploadedImages]
				newImages.splice(index, 1)
				setUploadedImages(newImages)

				onImageRemove?.(image.path)

			} catch (error) {
				console.error('Rasmni o\'chirishda xatolik:', error)
				alert('Rasmni o\'chirishda xatolik yuz berdi')
			}
		}
	}

	return (
		<div className="space-y-4">
			<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
				<input
					type="file"
					accept="image/*"
					onChange={handleImageUpload}
					className="hidden"
					id="tinymce-upload"
					multiple
				/>
				<label htmlFor="tinymce-upload" className="cursor-pointer">
					<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
					<p className="text-gray-600">TinyMCE uchun rasmlarni yuklang</p>
					<p className="text-sm text-gray-500 mt-1">
						Yuklangan rasmlar TinyMCE editorida ishlatilishi mumkin
					</p>
				</label>
			</div>

			{uploading && (
				<div className="flex items-center justify-center gap-2 text-blue-600">
					<Loader className="w-4 h-4 animate-spin" />
					<span>Rasm yuklanmoqda...</span>
				</div>
			)}

			{uploadedImages.length > 0 && (
				<div className="space-y-3">
					<h4 className="text-sm font-medium text-gray-700">
						Yuklangan rasmlar ({uploadedImages.length} ta):
					</h4>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
						{uploadedImages.map((image, index) => (
							<div key={index} className="relative group rounded-lg overflow-hidden border">
								<img
									src={image.url}
									alt={`Uploaded ${index + 1}`}
									className="w-full h-24 object-cover"
								/>
								<button
									type="button"
									onClick={() => handleRemoveImage(image, index)}
									className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
									title="O'chirish"
								>
									<X size={12} />
								</button>
								<div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
									{image.filename}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default TinyMCEImageHandler
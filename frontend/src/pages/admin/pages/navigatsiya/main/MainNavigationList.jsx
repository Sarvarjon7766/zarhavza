import axios from 'axios'
import { ArrowDown, ArrowUp, Edit, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const BASE_URL = import.meta.env.VITE_BASE_URL

const MainNavigationList = () => {
	const [pages, setPages] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		fetchPages()
	}, [])

	const fetchPages = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${BASE_URL}/api/pages/getMain`)

			if (response.data.success) {
				setPages(response.data.pages)
			} else {
				setError(response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			setError('Ma\'lumotlarni yuklashda xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	const handleStatusToggle = async (pageId, currentStatus) => {
		try {
			const response = await axios.put(`${BASE_URL}/api/pages/${pageId}`, {
				isActive: !currentStatus
			})

			if (response.data.success) {
				// Local state ni yangilash
				setPages(prevPages =>
					prevPages.map(page =>
						page._id === pageId
							? { ...page, isActive: !currentStatus }
							: page
					)
				)
			} else {
				alert('Statusni o\'zgartirishda xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Statusni o\'zgartirishda xatolik yuz berdi')
		}
	}

	const handleDelete = async (pageId, pageTitle) => {
		if (window.confirm(`"${pageTitle.uz}" navigatsiyasini o'chirishni istaysizmi?`)) {
			try {
				const response = await axios.delete(`${BASE_URL}/api/pages/delete/${pageId}`)

				if (response.data.success) {
					// Local state dan o'chirish
					setPages(prevPages => prevPages.filter(page => page._id !== pageId))
					alert('Navigatsiya muvaffaqiyatli o\'chirildi!')
				} else {
					alert('O\'chirishda xatolik: ' + response.data.message)
				}
			} catch (error) {
				console.error('Xatolik:', error)
				alert('Navigatsiyani o\'chirishda xatolik yuz berdi')
			}
		}
	}

	const handleOrderChange = async (pageId, newOrder) => {
		try {
			const response = await axios.put(`${BASE_URL}/api/pages/${pageId}`, {
				order: newOrder
			})

			if (response.data.success) {
				// Local state ni yangilash
				setPages(prevPages =>
					prevPages.map(page =>
						page._id === pageId
							? { ...page, order: newOrder }
							: page
					).sort((a, b) => a.order - b.order)
				)
			} else {
				alert('Tartib raqamini o\'zgartirishda xatolik: ' + response.data.message)
			}
		} catch (error) {
			console.error('Xatolik:', error)
			alert('Tartib raqamini o\'zgartirishda xatolik yuz berdi')
		}
	}

	const getTypeLabel = (type) => {
		const types = {
			'static': 'Static sahifa',
			'news': 'Yangiliklar',
			'gallery': 'Galereya',
			'documents': 'Hujjatlar'
		}
		return types[type] || type
	}

	const getStatusBadge = (isActive) => {
		return isActive
			? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Faol</span>
			: <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Nofaol</span>
	}

	if (loading) {
		return (
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-800">Asosiy Navigatsiyalar</h1>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6">
					<div className="animate-pulse space-y-4">
						{[1, 2, 3, 4].map(i => (
							<div key={i} className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center space-x-4">
									<div className="w-8 h-8 bg-gray-300 rounded"></div>
									<div className="space-y-2">
										<div className="h-4 bg-gray-300 rounded w-32"></div>
										<div className="h-3 bg-gray-300 rounded w-24"></div>
									</div>
								</div>
								<div className="flex space-x-2">
									<div className="w-8 h-8 bg-gray-300 rounded"></div>
									<div className="w-8 h-8 bg-gray-300 rounded"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-bold text-gray-800">Asosiy Navigatsiyalar</h1>
				</div>
				<div className="bg-white rounded-lg shadow-md p-6 text-center">
					<div className="text-red-500 mb-4">
						<svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-gray-800 mb-2">Xatolik</h3>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={fetchPages}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Qayta urinish
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="p-6">
			{/* Sarlavha va qo'shish tugmasi */}
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Asosiy Navigatsiyalar</h1>
				<Link
					to="/admin/main-navigation/add"
					className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
				>
					<Plus size={20} />
					Yangi qo'shish
				</Link>
			</div>

			{/* Jadval */}
			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				{/* Jadval sarlavhasi */}
				<div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-semibold text-gray-700">
					<div className="col-span-1">Icon</div>
					<div className="col-span-2">Sarlavha (UZ)</div>
					<div className="col-span-1">Slug</div>
					<div className="col-span-1">Key</div>
					<div className="col-span-1">Turi</div>
					<div className="col-span-1">Tartib</div>
					<div className="col-span-1">Holat</div>
					<div className="col-span-4 text-center">Amallar</div>
				</div>

				{/* Jadval tarkibi */}
				{pages.length === 0 ? (
					<div className="p-8 text-center text-gray-500">
						Hech qanday navigatsiya topilmadi
					</div>
				) : (
					pages.map((page, index) => (
						<div
							key={page._id}
							className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50 transition-colors"
						>
							{/* Icon */}
							<div className="col-span-1 flex items-center">
								<span className="text-xl">{page.icon || '—'}</span>
							</div>

							{/* Sarlavha */}
							<div className="col-span-2">
								<div className="font-medium text-gray-800">{page.title.uz}</div>
								<div className="text-xs text-gray-500">
									EN: {page.title.en} | RU: {page.title.ru}
								</div>
							</div>

							{/* Slug */}
							<div className="col-span-1 flex items-center">
								<code className="bg-gray-100 px-2 py-1 text-black rounded text-sm">{page.slug}</code>
							</div>

							{/* Key */}
							<div className="col-span-1 flex items-center">
								<code className="bg-gray-100 px-2 py-1 text-black rounded text-sm">{page.key}</code>
							</div>

							{/* Turi */}
							<div className="col-span-1 flex items-center">
								<span className="text-sm text-black">{getTypeLabel(page.type)}</span>
							</div>

							{/* Tartib raqami */}
							<div className="col-span-1 flex items-center space-x-2">
								<span className="font-medium text-black">{page.order}</span>
								<div className="flex flex-col">
									<button
										onClick={() => handleOrderChange(page._id, page.order - 1)}
										className="p-1 hover:bg-gray-200 rounded"
									>
										<ArrowUp size={12} />
									</button>
									<button
										onClick={() => handleOrderChange(page._id, page.order + 1)}
										className="p-1 hover:bg-gray-200 rounded"
									>
										<ArrowDown size={12} />
									</button>
								</div>
							</div>

							{/* Holat */}
							<div className="col-span-1 flex items-center">
								{getStatusBadge(page.isActive)}
							</div>

							{/* Amallar */}
							<div className="col-span-4 flex items-center justify-center space-x-2">
								{/* Status toggle - faqat badge orqali, alohida tugma yo'q */}

								{/* Tahrirlash - yangilash sahifasiga yo'naltiradi */}
								<Link
									to={`/admin/main-navigation/edit/${page._id}`}
									className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
									title="Tahrirlash"
								>
									<Edit size={16} />
									Yangilash
								</Link>

								{/* O'chirish */}
								<button
									onClick={() => handleDelete(page._id, page.title)}
									className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors text-sm"
									title="O'chirish"
								>
									<Trash2 size={16} />
									O'chirish
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Umumiy ma'lumot */}
			<div className="mt-4 text-sm text-gray-500">
				Jami: {pages.length} ta navigatsiya
			</div>
		</div>
	)
}

export default MainNavigationList
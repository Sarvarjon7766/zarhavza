import axios from 'axios'
import { Edit, Facebook, Instagram, MapPin, Plus, Send, Trash2, X, Youtube } from 'lucide-react'
import { useEffect, useState } from 'react'

const SocialNetworks = () => {
	const [socialNetworks, setSocialNetworks] = useState([])
	const [loading, setLoading] = useState(true)
	const [showModal, setShowModal] = useState(false)
	const [editingItem, setEditingItem] = useState(null)
	const [formData, setFormData] = useState({
		name: '',
		link: '',
		key: 'notfount'
	})

	const BASE_URL = import.meta.env.VITE_BASE_URL

	// Available social network keys
	const availableKeys = [
		{ value: 'facebook', label: 'Facebook', icon: <Facebook size={20} /> },
		{ value: 'telegram', label: 'Telegram', icon: <Send size={20} /> },
		{ value: 'youtube', label: 'YouTube', icon: <Youtube size={20} /> },
		{ value: 'instagram', label: 'Instagram', icon: <Instagram size={20} /> },
		{ value: 'location', label: 'Lokatsiya', icon: <MapPin size={20} /> }
	]

	// Get social network icon
	const getSocialIcon = (key) => {
		const found = availableKeys.find(item => item.value === key)
		return found ? found.icon : <X size={20} />
	}

	// Get social network label
	const getSocialLabel = (key) => {
		const found = availableKeys.find(item => item.value === key)
		return found ? found.label : 'Noma\'lum'
	}

	// Fetch social networks
	const fetchSocialNetworks = async () => {
		try {
			setLoading(true)
			const { data } = await axios.get(`${BASE_URL}/api/social-networks/getAll`)
			if (data.success) {
				setSocialNetworks(data.data)
			}
		} catch (error) {
			console.error('❌ Xatolik yuz berdi:', error)
			alert('Ma\'lumotlarni yuklashda xatolik yuz berdi')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchSocialNetworks()
	}, [])

	// Reset form
	const resetForm = () => {
		setFormData({
			name: '',
			link: '',
			key: 'notfount'
		})
		setEditingItem(null)
	}

	// Open modal for create
	const handleCreate = () => {
		resetForm()
		setShowModal(true)
	}

	// Open modal for edit
	const handleEdit = (item) => {
		setFormData({
			name: item.name,
			link: item.link,
			key: item.key
		})
		setEditingItem(item)
		setShowModal(true)
	}

	// Close modal
	const handleCloseModal = () => {
		setShowModal(false)
		resetForm()
	}

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	// Check if key already exists
	const isKeyExists = (key) => {
		return socialNetworks.some(item =>
			item.key === key && item._id !== editingItem?._id
		)
	}

	// Get available keys for dropdown
	const getAvailableKeys = () => {
		const usedKeys = socialNetworks.map(item => item.key)
		return availableKeys.filter(keyItem =>
			!usedKeys.includes(keyItem.value) || keyItem.value === formData.key
		)
	}

	// Create new social network
	const handleCreateSubmit = async (e) => {
		e.preventDefault()

		if (isKeyExists(formData.key)) {
			alert('Bu turdagi ijtimoiy tarmoq allaqachon mavjud!')
			return
		}

		try {
			const { data } = await axios.post(`${BASE_URL}/api/social-networks/create`, formData)
			if (data.success) {
				await fetchSocialNetworks()
				handleCloseModal()
				alert('Ijtimoiy tarmoq muvaffaqiyatli qo\'shildi')
			}
		} catch (error) {
			console.error('❌ Yaratishda xatolik:', error)
			alert('Yaratishda xatolik yuz berdi')
		}
	}

	// Update social network
	const handleUpdateSubmit = async (e) => {
		e.preventDefault()

		if (isKeyExists(formData.key)) {
			alert('Bu turdagi ijtimoiy tarmoq allaqachon mavjud!')
			return
		}

		try {
			const { data } = await axios.put(
				`${BASE_URL}/api/social-networks/update/${editingItem._id}`,
				formData
			)
			if (data.success) {
				await fetchSocialNetworks()
				handleCloseModal()
				alert('Ijtimoiy tarmoq muvaffaqiyatli yangilandi')
			}
		} catch (error) {
			console.error('❌ Yangilashda xatolik:', error)
			alert('Yangilashda xatolik yuz berdi')
		}
	}

	// Delete social network
	const handleDelete = async (id) => {
		if (!confirm('Haqiqatan ham o\'chirmoqchimisiz?')) {
			return
		}

		try {
			const { data } = await axios.delete(`${BASE_URL}/api/social-networks/delete/${id}`)
			if (data.success) {
				await fetchSocialNetworks()
				alert('Ijtimoiy tarmoq muvaffaqiyatli o\'chirildi')
			}
		} catch (error) {
			console.error('❌ O\'chirishda xatolik:', error)
			alert('O\'chirishda xatolik yuz berdi')
		}
	}

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	return (
		<div className="p-6">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-800">Ijtimoiy Tarmoqlar</h1>
					<p className="text-gray-600">Ijtimoiy tarmoq linklarini boshqaring</p>
				</div>
				<button
					onClick={handleCreate}
					disabled={socialNetworks.length >= availableKeys.length}
					className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium ${socialNetworks.length >= availableKeys.length
						? 'bg-gray-400 cursor-not-allowed'
						: 'bg-blue-600 hover:bg-blue-700'
						}`}
				>
					<Plus size={20} />
					Qo'shish
				</button>
			</div>

			{/* Info Message */}
			{socialNetworks.length >= availableKeys.length && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
					<p className="text-yellow-800">
						Barcha ijtimoiy tarmoqlar qo'shilgan. Yangi qo'shish imkoni yo'q.
					</p>
				</div>
			)}

			{/* Social Networks List */}
			<div className="bg-white rounded-lg shadow border border-gray-200">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Nomi
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Turi
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Link
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Harakatlar
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{socialNetworks.length === 0 ? (
								<tr>
									<td colSpan="5" className="px-6 py-8 text-center text-gray-500">
										Hech qanday ijtimoiy tarmoq topilmadi
									</td>
								</tr>
							) : (
								socialNetworks.map((item) => (
									<tr key={item._id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm font-medium text-gray-900">{item.name}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-500">{getSocialLabel(item.key)}</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-blue-600 truncate max-w-xs">
												<a
													href={item.link}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:underline"
												>
													{item.link}
												</a>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center gap-2">
												<button
													onClick={() => handleEdit(item)}
													className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
													title="Tahrirlash"
												>
													<Edit size={18} />
												</button>
												<button
													onClick={() => handleDelete(item._id)}
													className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
													title="O'chirish"
												>
													<Trash2 size={18} />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Create/Edit Modal */}
			{showModal && (
				<>
					<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={handleCloseModal} />
					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
							{/* Modal Header */}
							<div className="flex justify-between items-center p-6 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-800">
									{editingItem ? 'Tahrirlash' : 'Yangi ijtimoiy tarmoq'}
								</h2>
								<button
									onClick={handleCloseModal}
									className="text-gray-400 hover:text-gray-600 transition-colors"
								>
									<X size={24} />
								</button>
							</div>

							{/* Modal Form */}
							<form
								onSubmit={editingItem ? handleUpdateSubmit : handleCreateSubmit}
								className="p-6 space-y-4"
							>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nomi *
									</label>
									<input
										type="text"
										name="name"
										value={formData.name}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Masalan: Bizning Facebook sahifamiz"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Ijtimoiy tarmoq turi *
									</label>
									<select
										name="key"
										value={formData.key}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
									>
										<option value="notfount">Tanlang</option>
										{getAvailableKeys().map((keyItem) => (
											<option key={keyItem.value} value={keyItem.value}>
												{keyItem.label}
											</option>
										))}
									</select>
									{isKeyExists(formData.key) && formData.key !== 'notfount' && (
										<p className="text-red-500 text-sm mt-1">
											Bu turdagi ijtimoiy tarmoq allaqachon mavjud!
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Link *
									</label>
									<input
										type="url"
										name="link"
										value={formData.link}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
										placeholder="https://example.com"
									/>
								</div>

								{/* Modal Actions */}
								<div className="flex justify-end gap-3 pt-4">
									<button
										type="button"
										onClick={handleCloseModal}
										className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									>
										Bekor qilish
									</button>
									<button
										type="submit"
										disabled={isKeyExists(formData.key) && formData.key !== 'notfount'}
										className={`px-4 py-2 text-white rounded-lg transition-colors ${isKeyExists(formData.key) && formData.key !== 'notfount'
											? 'bg-gray-400 cursor-not-allowed'
											: 'bg-blue-600 hover:bg-blue-700'
											}`}
									>
										{editingItem ? 'Yangilash' : 'Qo\'shish'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default SocialNetworks
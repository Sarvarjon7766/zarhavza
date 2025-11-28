import axios from 'axios'
import { Edit, Eye, EyeOff, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const AdminContact = () => {
	const [contacts, setContacts] = useState([])
	const [loading, setLoading] = useState(true)
	const [showModal, setShowModal] = useState(false)
	const [editingContact, setEditingContact] = useState(null)
	const [formData, setFormData] = useState({
		address_uz: '',
		address_ru: '',
		address_en: '',
		phone: '',
		phone_faks: '',
		email: '',
		workin_uz: '',
		workin_ru: '',
		workin_en: '',
		isActive: false
	})

	const BASE_URL = import.meta.env.VITE_BASE_URL

	// Fetch all contacts
	const fetchContacts = async () => {
		try {
			setLoading(true)
			const { data } = await axios.get(`${BASE_URL}/api/contact/getAll`)

			if (data.success) {
				setContacts(data.contacts || [])
			} else {
				console.log('API dan ma\'lumot olinmadi:', data.message)
				// Xatolik chiqarmasdan, bo'sh ro'yxatni ko'rsatish
				setContacts([])
			}
		} catch (error) {
			console.log('API so\'rovi muvaffaqiyatsiz:', error.message)
			// Xatolik chiqarmasdan, bo'sh ro'yxatni ko'rsatish
			setContacts([])
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchContacts()
	}, [])

	// Reset form
	const resetForm = () => {
		setFormData({
			address_uz: '',
			address_ru: '',
			address_en: '',
			phone: '',
			phone_faks: '',
			email: '',
			workin_uz: '',
			workin_ru: '',
			workin_en: '',
			isActive: false
		})
		setEditingContact(null)
	}

	// Open modal for create
	const handleCreate = () => {
		resetForm()
		setShowModal(true)
	}

	// Open modal for edit
	const handleEdit = (contact) => {
		setFormData({
			address_uz: contact.address_uz || '',
			address_ru: contact.address_ru || '',
			address_en: contact.address_en || '',
			phone: contact.phone || '',
			phone_faks: contact.phone_faks || '',
			email: contact.email || '',
			workin_uz: contact.workin_uz || '',
			workin_ru: contact.workin_ru || '',
			workin_en: contact.workin_en || '',
			isActive: contact.isActive || false
		})
		setEditingContact(contact)
		setShowModal(true)
	}

	// Close modal
	const handleCloseModal = () => {
		setShowModal(false)
		resetForm()
	}

	// Handle form input changes
	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}))
	}

	// Create new contact
	const handleCreateSubmit = async (e) => {
		e.preventDefault()

		try {
			const { data } = await axios.post(`${BASE_URL}/api/contact/create`, formData)

			if (data.success) {
				await fetchContacts()
				handleCloseModal()
				alert('Kontakt muvaffaqiyatli qo\'shildi')
			} else {
				alert(data.message || 'Yaratishda xatolik yuz berdi')
			}
		} catch (error) {
			console.error('Yaratishda xatolik:', error)
			// Xatolik xabarini foydalanuvchiga ko'rsatish
			if (error.response?.data?.message) {
				alert(error.response.data.message)
			} else {
				alert('Yaratishda xatolik yuz berdi')
			}
		}
	}

	// Update contact
	const handleUpdateSubmit = async (e) => {
		e.preventDefault()

		try {
			const { data } = await axios.put(
				`${BASE_URL}/api/contact/update/${editingContact._id}`,
				formData
			)

			if (data.success) {
				await fetchContacts()
				handleCloseModal()
				alert('Kontakt muvaffaqiyatli yangilandi')
			} else {
				alert(data.message || 'Yangilashda xatolik yuz berdi')
			}
		} catch (error) {
			console.error('Yangilashda xatolik:', error)
			// Xatolik xabarini foydalanuvchiga ko'rsatish
			if (error.response?.data?.message) {
				alert(error.response.data.message)
			} else {
				alert('Yangilashda xatolik yuz berdi')
			}
		}
	}

	// Delete contact
	const handleDelete = async (id) => {
		if (!confirm('Haqiqatan ham o\'chirmoqchimisiz?')) {
			return
		}

		try {
			const { data } = await axios.delete(`${BASE_URL}/api/contact/delete/${id}`)

			if (data.success) {
				await fetchContacts()
				alert('Kontakt muvaffaqiyatli o\'chirildi')
			} else {
				alert(data.message || 'O\'chirishda xatolik yuz berdi')
			}
		} catch (error) {
			console.error('O\'chirishda xatolik:', error)
			// Xatolik xabarini foydalanuvchiga ko'rsatish
			if (error.response?.data?.message) {
				alert(error.response.data.message)
			} else {
				alert('O\'chirishda xatolik yuz berdi')
			}
		}
	}

	// Toggle active status
	const handleToggleActive = async (contact) => {
		try {
			const { data } = await axios.put(`${BASE_URL}/api/contact/update/${contact._id}`, {
				...contact,
				isActive: !contact.isActive
			})

			if (data.success) {
				await fetchContacts()
				alert('Holat muvaffaqiyatli o\'zgartirildi')
			} else {
				alert(data.message || 'Holatni o\'zgartirishda xatolik')
			}
		} catch (error) {
			console.error('Holatni o\'zgartirishda xatolik:', error)
			// Xatolik xabarini foydalanuvchiga ko'rsatish
			if (error.response?.data?.message) {
				alert(error.response.data.message)
			} else {
				alert('Holatni o\'zgartirishda xatolik')
			}
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
					<h1 className="text-2xl font-bold text-gray-800">Kontaktlar Boshqaruvi</h1>
					<p className="text-gray-600">Kontakt ma'lumotlarini boshqaring</p>
				</div>
				<button
					onClick={handleCreate}
					className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					<Plus size={20} />
					Yangi Kontakt
				</button>
			</div>

			{/* Contacts List */}
			<div className="bg-white rounded-lg shadow border border-gray-200">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Manzil (UZ)
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Telefon
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Email
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Ish vaqti
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Holati
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Harakatlar
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{contacts.length === 0 ? (
								<tr>
									<td colSpan="6" className="px-6 py-12 text-center text-gray-500">
										<div className="flex flex-col items-center justify-center">
											<svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
											<h3 className="text-lg font-medium text-gray-600 mb-2">Kontaktlar topilmadi</h3>
											<p className="text-gray-500 text-sm mb-4">
												Hozircha hech qanday kontakt ma'lumotlari mavjud emas
											</p>
											<button
												onClick={handleCreate}
												className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
											>
												Birinchi kontaktni qo'shing
											</button>
										</div>
									</td>
								</tr>
							) : (
								contacts.map((contact) => (
									<tr key={contact._id} className="hover:bg-gray-50">
										<td className="px-6 py-4">
											<div className="text-sm font-medium text-gray-900">
												{contact.address_uz || 'Mavjud emas'}
											</div>
											<div className="text-xs text-gray-500 mt-1">
												RU: {contact.address_ru || 'Mavjud emas'}
											</div>
											<div className="text-xs text-gray-500">
												EN: {contact.address_en || 'Mavjud emas'}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900">{contact.phone || 'Mavjud emas'}</div>
											{contact.phone_faks && (
												<div className="text-xs text-gray-500">
													Faks: {contact.phone_faks}
												</div>
											)}
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900">{contact.email || 'Mavjud emas'}</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm text-gray-900">{contact.workin_uz || 'Mavjud emas'}</div>
											<div className="text-xs text-gray-500 mt-1">
												RU: {contact.workin_ru || 'Mavjud emas'}
											</div>
											<div className="text-xs text-gray-500">
												EN: {contact.workin_en || 'Mavjud emas'}
											</div>
										</td>
										<td className="px-6 py-4">
											<button
												onClick={() => handleToggleActive(contact)}
												className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${contact.isActive
													? 'bg-green-100 text-green-800 hover:bg-green-200'
													: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
													}`}
											>
												{contact.isActive ? (
													<>
														<Eye size={14} />
														Faol
													</>
												) : (
													<>
														<EyeOff size={14} />
														Nofaol
													</>
												)}
											</button>
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-2">
												<button
													onClick={() => handleEdit(contact)}
													className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
													title="Tahrirlash"
												>
													<Edit size={18} />
												</button>
												<button
													onClick={() => handleDelete(contact._id)}
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
					<div
						className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
						onClick={handleCloseModal}
					/>

					<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
							{/* Modal Header */}
							<div className="flex justify-between items-center p-6 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-800">
									{editingContact ? 'Kontaktni Tahrirlash' : 'Yangi Kontakt'}
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
								onSubmit={editingContact ? handleUpdateSubmit : handleCreateSubmit}
								className="p-6 space-y-6"
							>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Address Fields */}
									<div className="space-y-4">
										<h3 className="text-lg font-medium text-gray-800 border-b pb-2">Manzil</h3>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Manzil (O'zbekcha) *
											</label>
											<input
												type="text"
												name="address_uz"
												value={formData.address_uz}
												onChange={handleInputChange}
												required
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Manzil o'zbek tilida"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Manzil (Ruscha)
											</label>
											<input
												type="text"
												name="address_ru"
												value={formData.address_ru}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Manzil rus tilida"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Manzil (Inglizcha)
											</label>
											<input
												type="text"
												name="address_en"
												value={formData.address_en}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Manzil ingliz tilida"
											/>
										</div>
									</div>

									{/* Contact Fields */}
									<div className="space-y-4">
										<h3 className="text-lg font-medium text-gray-800 border-b pb-2">Aloqa Ma'lumotlari</h3>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Telefon *
											</label>
											<input
												type="tel"
												name="phone"
												value={formData.phone}
												onChange={handleInputChange}
												required
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="+998 XX XXX XX XX"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Faks
											</label>
											<input
												type="tel"
												name="phone_faks"
												value={formData.phone_faks}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="+998 XX XXX XX XX"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Email *
											</label>
											<input
												type="email"
												name="email"
												value={formData.email}
												onChange={handleInputChange}
												required
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="email@example.com"
											/>
										</div>
									</div>
								</div>

								{/* Working Hours */}
								<div className="space-y-4">
									<h3 className="text-lg font-medium text-gray-800 border-b pb-2">Ish Vaqti</h3>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Ish vaqti (O'zbekcha)
											</label>
											<input
												type="text"
												name="workin_uz"
												value={formData.workin_uz}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Dushanba-Juma 9:00-18:00"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Ish vaqti (Ruscha)
											</label>
											<input
												type="text"
												name="workin_ru"
												value={formData.workin_ru}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent"
												placeholder="Понедельник-Пятница 9:00-18:00"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Ish vaqti (Inglizcha)
											</label>
											<input
												type="text"
												name="workin_en"
												value={formData.workin_en}
												onChange={handleInputChange}
												className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Monday-Friday 9:00-18:00"
											/>
										</div>
									</div>
								</div>

								{/* Active Status */}
								<div className="flex items-center gap-3">
									<input
										type="checkbox"
										name="isActive"
										id="isActive"
										checked={formData.isActive}
										onChange={handleInputChange}
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
									/>
									<label htmlFor="isActive" className="text-sm font-medium text-gray-700">
										Faol kontakt
									</label>
								</div>

								{/* Modal Actions */}
								<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
									<button
										type="button"
										onClick={handleCloseModal}
										className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
									>
										Bekor qilish
									</button>
									<button
										type="submit"
										className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
									>
										<Save size={18} />
										{editingContact ? 'Yangilash' : 'Qo\'shish'}
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

export default AdminContact
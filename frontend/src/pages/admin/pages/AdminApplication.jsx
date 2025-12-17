import axios from 'axios'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

const AdminApplication = () => {
	const [applications, setApplications] = useState([])
	const [loading, setLoading] = useState(true)
	const [exportLoading, setExportLoading] = useState(false)
	const [replyModalOpen, setReplyModalOpen] = useState(false)
	const [selectedApplication, setSelectedApplication] = useState(null)
	const [replyMessage, setReplyMessage] = useState('')
	const [sendingReply, setSendingReply] = useState(false)
	const baseURL = import.meta.env.VITE_BASE_URL

	const fetchApplications = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${baseURL}/api/application/getAll`)
			console.log('API Response:', response.data) // Debug uchun
			setApplications(response.data.applications || [])
		} catch (err) {
			console.error('Error fetching applications:', err)
		} finally {
			setLoading(false)
		}
	}

	const updateApplicationStatus = async (applicationId, currentStatus) => {
		try {
			await axios.put(`${baseURL}/api/application/updateStatus/${applicationId}`, {
				isStatus: !currentStatus
			})
			setApplications(prevApplications =>
				prevApplications.map(app =>
					app._id === applicationId ? { ...app, isStatus: !currentStatus } : app
				)
			)
		} catch (err) {
			console.error('Error updating status:', err)
		}
	}

	// Javob yuborish funksiyasi
	const sendReply = async () => {
		if (!replyMessage.trim()) {
			alert('Javob matnini kiriting!')
			return
		}

		try {
			setSendingReply(true)
			await axios.post(`${baseURL}/api/nodemailer/sentmessage`, {
				_id: selectedApplication._id,
				email: selectedApplication.email,
				phone: selectedApplication.phone,
				askmessage: selectedApplication.message,
				replymessage: replyMessage
			})

			alert('Javob muvaffaqiyatli yuborildi!')
			setReplyModalOpen(false)
			setReplyMessage('')
			setSelectedApplication(null)

			// Ro'yxatni yangilash
			await fetchApplications()

		} catch (err) {
			console.error('Error sending reply:', err)
			alert('Javob yuborishda xatolik yuz berdi!')
		} finally {
			setSendingReply(false)
		}
	}

	// Modalni ochish
	const openReplyModal = (application) => {
		setSelectedApplication(application)
		setReplyMessage('')
		setReplyModalOpen(true)
	}

	// Modalni yopish
	const closeReplyModal = () => {
		setReplyModalOpen(false)
		setSelectedApplication(null)
		setReplyMessage('')
	}

	// Excell faylini yaratish va yuklash
	const exportToExcel = async (type = 'all') => {
		try {
			setExportLoading(true)

			// Ma'lumotlarni filtrlash
			let dataToExport = applications
			let fileName = 'barcha_murojaatlar'

			if (type === 'new') {
				dataToExport = applications.filter(app => !app.isStatus)
				fileName = 'yangi_murojaatlar'
			} else if (type === 'viewed') {
				dataToExport = applications.filter(app => app.isStatus)
				fileName = 'korilgan_murojaatlar'
			}

			if (dataToExport.length === 0) {
				alert('Yuklab olish uchun ma\'lumot mavjud emas!')
				return
			}

			// Ma'lumotlarni tayyorlash
			const excelData = dataToExport.map((app, index) => ({
				'№': index + 1,
				'Ism': app.name,
				'Email': app.email,
				'Telefon': app.phone,
				'Xabar': app.message,
				'Javob': app.reply_message || 'Javob berilmagan',
				'Holati': app.isStatus ? "Ko'rilgan" : "Yangi",
				'Sana': new Date(app.createdAt || Date.now()).toLocaleDateString('uz-UZ'),
				'Vaqt': new Date(app.createdAt || Date.now()).toLocaleTimeString('uz-UZ')
			}))

			// Yangi workbook yaratish
			const wb = XLSX.utils.book_new()
			const ws = XLSX.utils.json_to_sheet(excelData)

			// Ustun enlarini sozlash
			const colWidths = [
				{ wch: 5 },  // №
				{ wch: 20 }, // Ism
				{ wch: 25 }, // Email
				{ wch: 15 }, // Telefon
				{ wch: 40 }, // Xabar
				{ wch: 40 }, // Javob
				{ wch: 12 }, // Holati
				{ wch: 12 }, // Sana
				{ wch: 10 }  // Vaqt
			]
			ws['!cols'] = colWidths

			// Sarlavha stilini sozlash
			if (ws['!ref']) {
				const range = XLSX.utils.decode_range(ws['!ref'])
				for (let C = range.s.c; C <= range.e.c; ++C) {
					const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C })
					if (ws[cellAddress]) {
						ws[cellAddress].s = {
							font: {
								bold: true,
								color: { rgb: "FFFFFF" }
							},
							fill: {
								fgColor: { rgb: "2E86C1" }
							},
							alignment: {
								horizontal: "center",
								vertical: "center"
							}
						}
					}
				}
			}

			// Workbook ga worksheet qo'shish
			XLSX.utils.book_append_sheet(wb, ws, 'Murojaatlar')

			// Faylni yuklab olish
			const fileNameWithDate = `${fileName}_${new Date().toLocaleDateString('uz-UZ').replace(/\./g, '-')}.xlsx`
			XLSX.writeFile(wb, fileNameWithDate)

		} catch (error) {
			console.error('Excel export error:', error)
			alert('Faylni yuklab olishda xatolik yuz berdi!')
		} finally {
			setExportLoading(false)
		}
	}

	useEffect(() => {
		fetchApplications()
	}, [])

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-lg">Yuklanmoqda...</div>
			</div>
		)
	}

	const newApplications = applications.filter(app => !app.isStatus)
	const viewedApplications = applications.filter(app => app.isStatus)
	const repliedApplications = applications.filter(app => app.reply_message)

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Javob berish modali */}
			{replyModalOpen && (
				<div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">

					<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all">
						<div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
							<h2 className="text-xl font-bold text-white">Murojaatga javob berish</h2>
							<div className="text-blue-100 mt-1 text-sm">
								<strong>{selectedApplication?.name}</strong> • {selectedApplication?.email} • {selectedApplication?.phone}
							</div>
						</div>

						<div className="p-6 max-h-96 overflow-y-auto">
							{/* Foydalanuvchi xabari */}
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									📩 Foydalanuvchi xabari:
								</label>
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<p className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
										{selectedApplication?.message || "Xabar mavjud emas"}
									</p>
								</div>
							</div>

							{/* Oldingi javob (agar mavjud bo'lsa) */}
							{selectedApplication?.reply_message && (
								<div className="mb-6">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										📨 Avval berilgan javob:
									</label>
									<div className="bg-green-50 p-4 rounded-lg border border-green-200">
										<p className="text-green-800 whitespace-pre-wrap text-sm leading-relaxed">
											{selectedApplication.reply_message}
										</p>
										<div className="text-xs text-green-600 mt-2">
											⚠️ Yangi javob yuborsangiz, avvalgisi almashtiriladi
										</div>
									</div>
								</div>
							)}

							{/* Javob matni */}
							<div className="mb-2">
								<label htmlFor="replyMessage" className="block text-sm font-medium text-gray-700 mb-2">
									✏️ {selectedApplication?.reply_message ? 'Yangi javobingiz:' : 'Javobingiz:'}
								</label>
								<textarea
									id="replyMessage"
									value={replyMessage}
									onChange={(e) => setReplyMessage(e.target.value)}
									placeholder={selectedApplication?.reply_message ? "Yangi javob matnini kiriting..." : "Javob matnini kiriting..."}
									rows="6"
									className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black bg-white placeholder-gray-500"
								/>
							</div>
							<div className="text-xs text-gray-500 mb-4">
								Javob foydalanuvchining email manziliga yuboriladi
							</div>
						</div>

						<div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
							<button
								onClick={closeReplyModal}
								disabled={sendingReply}
								className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
							>
								Bekor qilish
							</button>
							<button
								onClick={sendReply}
								disabled={sendingReply || !replyMessage.trim()}
								className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm"
							>
								{sendingReply ? (
									<>
										<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
										Yuborilmoqda...
									</>
								) : (
									<>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
										</svg>
										{selectedApplication?.reply_message ? 'Javobni yangilash' : 'Javobni yuborish'}
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Sarlavha va Export tugmalari */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-800 mb-2">Murojaatlar Boshqaruvi</h1>
					<p className="text-gray-600">Barcha foydalanuvchi murojaatlarini ko'rib chiqing va boshqaring</p>
				</div>

				{/* Export tugmalari guruhi */}
				<div className="flex flex-col sm:flex-row gap-3">
					<button
						onClick={() => exportToExcel('new')}
						disabled={newApplications.length === 0 || exportLoading}
						className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none font-medium"
					>
						{exportLoading ? (
							<>
								<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Yuklanmoqda...
							</>
						) : (
							<>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Yangi ({newApplications.length})
							</>
						)}
					</button>

					<button
						onClick={() => exportToExcel('viewed')}
						disabled={viewedApplications.length === 0 || exportLoading}
						className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none font-medium"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Ko'rilgan ({viewedApplications.length})
					</button>

					<button
						onClick={() => exportToExcel('all')}
						disabled={applications.length === 0 || exportLoading}
						className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:shadow-none font-medium"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						Barchasi ({applications.length})
					</button>
				</div>
			</div>

			{/* Statistikalar */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-3xl font-bold mb-2">{applications.length}</div>
							<div className="text-blue-100 font-medium">Jami Murojaatlar</div>
						</div>
						<div className="bg-blue-400 bg-opacity-30 p-3 rounded-xl">
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-3xl font-bold mb-2">{newApplications.length}</div>
							<div className="text-orange-100 font-medium">Yangi Murojaatlar</div>
						</div>
						<div className="bg-orange-400 bg-opacity-30 p-3 rounded-xl">
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-3xl font-bold mb-2">{viewedApplications.length}</div>
							<div className="text-green-100 font-medium">Ko'rilgan Murojaatlar</div>
						</div>
						<div className="bg-green-400 bg-opacity-30 p-3 rounded-xl">
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-3xl font-bold mb-2">{repliedApplications.length}</div>
							<div className="text-purple-100 font-medium">Javob Berilgan</div>
						</div>
						<div className="bg-purple-400 bg-opacity-30 p-3 rounded-xl">
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			{/* Murojaatlar Jadvali */}
			<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
				{/* Jadval sarlavhasi */}
				<div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
						<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
						</svg>
						Barcha Murojaatlar
						<span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
							{applications.length}
						</span>
					</h2>
				</div>

				{/* Jadval kontenti */}
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="bg-gray-50 border-b border-gray-200">
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Foydalanuvchi</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Aloqa</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Xabar</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Javob</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Holati</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sana</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Harakatlar</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{applications.length === 0 ? (
								<tr>
									<td colSpan="7" className="px-6 py-12 text-center">
										<div className="text-gray-500">
											<svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
											<p className="text-lg font-medium">Hozircha murojaatlar mavjud emas</p>
										</div>
									</td>
								</tr>
							) : (
								applications.map((application) => (
									<ApplicationTableRow
										key={application._id}
										application={application}
										onUpdateStatus={updateApplicationStatus}
										onReply={openReplyModal}
									/>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Yangilash tugmasi */}
			<div className="text-center">
				<button
					onClick={fetchApplications}
					className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 mx-auto font-medium"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
					Ro'yxatni Yangilash
				</button>
			</div>
		</div>
	)
}

// ApplicationTableRow komponenti (jadval qatori)
const ApplicationTableRow = ({ application, onUpdateStatus, onReply }) => {
	return (
		<tr className="hover:bg-gray-50 transition-colors group">
			{/* Foydalanuvchi ma'lumotlari */}
			<td className="px-6 py-4 whitespace-nowrap">
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
						{application.name?.charAt(0)?.toUpperCase() || 'U'}
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900">{application.name}</div>
						{application.reply_message && (
							<div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
								<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								Javob berilgan
							</div>
						)}
					</div>
				</div>
			</td>

			{/* Aloqa ma'lumotlari */}
			<td className="px-6 py-4 whitespace-nowrap">
				<div className="text-sm text-gray-900">{application.email}</div>
				<div className="text-sm text-gray-500">{application.phone}</div>
			</td>

			{/* Xabar */}
			<td className="px-6 py-4">
				<div className="text-sm text-gray-900 max-w-xs">
					<div className="line-clamp-2" title={application.message}>
						{application.message || "Xabar mavjud emas"}
					</div>
				</div>
			</td>

			{/* Javob */}
			<td className="px-6 py-4">
				<div className="text-sm max-w-xs">
					{application.reply_message ? (
						<div className="bg-green-50 border border-green-200 rounded-lg p-3">
							<div className="text-green-800 line-clamp-2" title={application.reply_message}>
								{application.reply_message}
							</div>
							<div className="text-xs text-green-600 mt-1 flex items-center gap-1">
								<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Javob berilgan
							</div>
						</div>
					) : (
						<span className="text-gray-400 text-sm">Javob berilmagan</span>
					)}
				</div>
			</td>

			{/* Holati */}
			<td className="px-6 py-4 whitespace-nowrap">
				<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${application.isStatus
					? 'bg-green-100 text-green-800 border border-green-200'
					: 'bg-orange-100 text-orange-800 border border-orange-200'
					}`}>
					{application.isStatus ? '✓ Ko\'rilgan' : '● Yangi'}
				</span>
			</td>

			{/* Sana */}
			<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
				{new Date(application.createdAt || Date.now()).toLocaleDateString('uz-UZ')}
				<br />
				<span className="text-gray-400 text-xs">
					{new Date(application.createdAt || Date.now()).toLocaleTimeString('uz-UZ')}
				</span>
			</td>

			{/* Harakatlar */}
			<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
				<div className="flex items-center gap-2">
					<button
						onClick={() => onReply(application)}
						className={`inline-flex items-center px-3 py-2 border border-transparent text-xs leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${application.reply_message
							? 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
							: 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500'
							}`}
					>
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						{application.reply_message ? 'Javobni ko\'rish' : 'Javob berish'}
					</button>
					<button
						onClick={() => onUpdateStatus(application._id, application.isStatus)}
						className={`inline-flex items-center px-3 py-2 border border-transparent text-xs leading-4 font-medium rounded-md transition-colors ${application.isStatus
							? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
							: 'text-orange-700 bg-orange-100 hover:bg-orange-200'
							}`}
					>
						{application.isStatus ? 'Yangi qilish' : 'Ko\'rilgan'}
					</button>
				</div>
			</td>
		</tr>
	)
}

export default AdminApplication
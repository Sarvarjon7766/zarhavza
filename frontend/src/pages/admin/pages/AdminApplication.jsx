import axios from 'axios'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

const AdminApplication = () => {
	const [applications, setApplications] = useState([])
	const [loading, setLoading] = useState(true)
	const [exportLoading, setExportLoading] = useState(false)
	const baseURL = import.meta.env.VITE_BASE_URL

	const fetchApplications = async () => {
		try {
			setLoading(true)
			const response = await axios.get(`${baseURL}/api/application/getAll`)
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

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Sarlavha va Export tugmalari */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
				<h1 className="text-2xl font-bold text-gray-800">Murojaatlar Boshqaruvi</h1>

				{/* Export tugmalari guruhi */}
				<div className="flex flex-col sm:flex-row gap-3">
					<button
						onClick={() => exportToExcel('new')}
						disabled={newApplications.length === 0 || exportLoading}
						className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors shadow-md"
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
								Yangi murojaatlar ({newApplications.length})
							</>
						)}
					</button>

					<button
						onClick={() => exportToExcel('viewed')}
						disabled={viewedApplications.length === 0 || exportLoading}
						className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors shadow-md"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Ko'rilganlar ({viewedApplications.length})
					</button>

					<button
						onClick={() => exportToExcel('all')}
						disabled={applications.length === 0 || exportLoading}
						className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors shadow-md"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
						</svg>
						Barchasi ({applications.length})
					</button>
				</div>
			</div>

			{/* Statistikalar */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
					<div className="text-3xl font-bold text-blue-600 mb-2">{applications.length}</div>
					<div className="text-sm text-gray-600 font-medium">Jami Murojaatlar</div>
				</div>
				<div className="bg-white p-6 rounded-xl shadow-md border border-orange-100 text-center">
					<div className="text-3xl font-bold text-orange-600 mb-2">{newApplications.length}</div>
					<div className="text-sm text-gray-600 font-medium">Yangi Murojaatlar</div>
				</div>
				<div className="bg-white p-6 rounded-xl shadow-md border border-green-100 text-center">
					<div className="text-3xl font-bold text-green-600 mb-2">{viewedApplications.length}</div>
					<div className="text-sm text-gray-600 font-medium">Ko'rilgan Murojaatlar</div>
				</div>
			</div>

			{/* Yangi Murojaatlar */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Yangi Murojaatlar
						<span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm">
							{newApplications.length}
						</span>
					</h2>
				</div>

				{newApplications.length === 0 ? (
					<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
						<svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<p className="text-gray-500">Yangi murojaatlar mavjud emas</p>
					</div>
				) : (
					<div className="space-y-4">
						{newApplications.map((application) => (
							<ApplicationItem
								key={application._id}
								application={application}
								onUpdateStatus={updateApplicationStatus}
							/>
						))}
					</div>
				)}
			</div>

			{/* Ko'rilgan Murojaatlar */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4 text-green-600 flex items-center gap-2">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					Ko'rilgan Murojaatlar
					<span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
						{viewedApplications.length}
					</span>
				</h2>

				{viewedApplications.length === 0 ? (
					<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
						<svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p className="text-gray-500">Ko'rilgan murojaatlar mavjud emas</p>
					</div>
				) : (
					<div className="space-y-4">
						{viewedApplications.map((application) => (
							<ApplicationItem
								key={application._id}
								application={application}
								onUpdateStatus={updateApplicationStatus}
							/>
						))}
					</div>
				)}
			</div>

			{/* Yangilash tugmasi */}
			<div className="text-center">
				<button
					onClick={fetchApplications}
					className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors flex items-center gap-2 mx-auto"
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

// ApplicationItem komponenti
const ApplicationItem = ({ application, onUpdateStatus }) => {
	return (
		<div className={`bg-white rounded-xl shadow-md border-l-4 ${application.isStatus ? 'border-green-500' : 'border-orange-500'
			} p-6 hover:shadow-lg transition-shadow`}>
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<div className="flex-1">
					<div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
						<h3 className="font-semibold text-lg text-gray-800">{application.name}</h3>
						<span className={`px-3 py-1 text-sm font-medium rounded-full ${application.isStatus
							? 'bg-green-100 text-green-800 border border-green-200'
							: 'bg-orange-100 text-orange-800 border border-orange-200'
							}`}>
							{application.isStatus ? '✓ Ko\'rilgan' : '● Yangi'}
						</span>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
						<div className="flex items-center gap-2">
							<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
							<span>{application.email}</span>
						</div>
						<div className="flex items-center gap-2">
							<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
							</svg>
							<span>{application.phone}</span>
						</div>
					</div>
					{application.message && (
						<div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
							<p className="text-sm text-gray-700">{application.message}</p>
						</div>
					)}
				</div>
				<button
					onClick={() => onUpdateStatus(application._id, application.isStatus)}
					className={`px-6 py-2 text-white rounded-lg font-medium transition-colors shadow-sm ${application.isStatus
						? 'bg-gray-500 hover:bg-gray-600'
						: 'bg-orange-500 hover:bg-orange-600'
						}`}
				>
					{application.isStatus ? 'Yangi qilish' : 'Ko\'rilgan deb belgilash'}
				</button>
			</div>
		</div>
	)
}

export default AdminApplication
import axios from 'axios'
import { useEffect, useState } from 'react'
import ContentOutlet from './ContentOutlet'
import NavigationSidebar from './NavigationSidebar'

const BASE_URL = import.meta.env.VITE_BASE_URL

const MainNavigationContent = ({ navigationType }) => {
	const [pages, setPages] = useState([])
	const [selectedPage, setSelectedPage] = useState(null)
	const [loading, setLoading] = useState(true)
	const [showContentForm, setShowContentForm] = useState(false)

	// Navigation uchun API funksiyalari
	const fetchPages = async () => {
		try {
			setLoading(true)

			const endpoint =
				navigationType === 'main'
					? '/api/pages/MainCon'
					: '/api/pages/AdditCon'

			const response = await axios.get(`${BASE_URL}${endpoint}`)

			if (response.data.success) {
				setPages(response.data.pages)
			}
		} catch (error) {
			setPages([])

		} finally {
			setLoading(false)
		}
	}


	const handlePageSelect = (page) => {
		setSelectedPage(page)
		setShowContentForm(false)
	}

	useEffect(() => {
		fetchPages()
	}, [])

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
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						{navigationType === 'main'
							? "Asosiy Navigatsiyaga Ma'lumot Qo'shish"
							: "Qo'shimcha Navigatsiyaga Ma'lumot Qo'shish"}
					</h1>

					<p className="text-gray-600">
						{navigationType === 'main'
							? "Tanlangan asosiy navigatsiya bo'yicha kontentlarni boshqaring"
							: "Tanlangan qo'shimcha navigatsiya bo'yicha kontentlarni boshqaring"}
					</p>

				</div>

				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Navigatsiyalar ro'yxati - Sidebar */}
					<NavigationSidebar
						pages={pages}
						selectedPage={selectedPage}
						onPageSelect={handlePageSelect}
						navigationType={navigationType}
					/>

					{/* Kontent Outlet - Bu yerda tanlangan navigatsiya komponenti ochiladi */}
					<div className="lg:col-span-3">
						<ContentOutlet
							selectedPage={selectedPage}
							showContentForm={showContentForm}
							onShowFormChange={setShowContentForm}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MainNavigationContent
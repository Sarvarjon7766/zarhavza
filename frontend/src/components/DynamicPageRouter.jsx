// components/DynamicPageRouter.jsx
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ComunicationPage from '../pages/ComunicationPage'
import DocumentsPage from '../pages/DocumentsPage'
import GalleryPage from '../pages/GallaryPage'
import LeaderPage from '../pages/LeaderPage'
import NewsPage from '../pages/NewsPage'
import NotFound from '../pages/notfound/NotFound'
import StaticPage from '../pages/StaticPage'
import LoadingSpinner from './LoadingSpinner'
const BASE_URL = import.meta.env.VITE_BASE_URL

const DynamicPageRouter = () => {
	const location = useLocation()
	const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'uz')
	const [pageData, setPageData] = useState(null)
	const [loading, setLoading] = useState(true)

	// URL dan full slug ni olish
	const fullSlug = location.pathname // "/about-us" yoki "/opening-data/news"

	// Barcha sahifalarni olish va slug bo'yicha topish
	useEffect(() => {
		const fetchPageData = async () => {
			try {
				setLoading(true)
				const response = await axios.get(`${BASE_URL}/api/pages/getAll/${currentLang}`)
				if (response.data.success) {
					const allPages = response.data.data

					// Slug bo'yicha sahifani topish
					const foundPage = findPageBySlug(allPages, fullSlug)

					if (foundPage) {
						setPageData(foundPage)
					} else {
						console.log('❌ Page not found for slug:', fullSlug)
						setPageData(null)
					}
				} else {
					console.log('❌ API response not successful')
					setPageData(null)
				}
			} catch (err) {
				console.log('❌ Page fetch error:', err)
				console.log('Error details:', err.response?.data)
				setPageData(null)
			} finally {
				setLoading(false)
			}
		}

		// Faqat root emas bo'lsa fetch qilamiz
		if (fullSlug !== '/') {
			fetchPageData()
		} else {
			setLoading(false)
		}
	}, [fullSlug, currentLang])

	// Rekursiv funksiya: sahifani slug bo'yicha topish
	const findPageBySlug = (pages, targetSlug) => {
		for (const page of pages) {

			// Asosiy sahifani tekshirish
			if (page.slug === targetSlug) {
				return page
			}

			// Children lar ichida qidirish
			if (page.children && page.children.length > 0) {
				const foundInChildren = findPageBySlug(page.children, targetSlug)
				if (foundInChildren) {
					return foundInChildren
				}
			}
		}
		return null
	}

	// Til o'zgarishlarini kuzatish
	useEffect(() => {
		const handleLanguageChange = () => {
			const newLang = localStorage.getItem('lang') || 'uz'
			setCurrentLang(newLang)
		}

		window.addEventListener('languageChanged', handleLanguageChange)
		return () => window.removeEventListener('languageChanged', handleLanguageChange)
	}, [])

	// Agar root bo'lsa, Home page ga yo'naltiramiz
	if (fullSlug === '/') {
		return null // App.jsx da Home component ishlaydi
	}

	if (loading) {
		return <LoadingSpinner />
	}

	if (!pageData) {
		return <NotFound />
	}

	// Page type bo'yicha mos komponentni render qilish
	const renderPageComponent = () => {

		switch (pageData.type) {
			case 'static':
				return <StaticPage pageData={pageData} />
			case 'news':
				return <NewsPage pageData={pageData} />
			case 'gallery':
				return <GalleryPage pageData={pageData} />
			case 'documents':
				return <DocumentsPage pageData={pageData} />
			case 'leader':
				return <LeaderPage pageData={pageData} />
			case 'communication':
				return <ComunicationPage pageData={pageData} />
			default:
				console.log('⚠️ Unknown page type, defaulting to StaticPage')
				return <StaticPage pageData={pageData} />
		}
	}

	return renderPageComponent()
}

export default DynamicPageRouter
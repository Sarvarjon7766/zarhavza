import { lazy, Suspense } from 'react'
import EmptyState from './EmptyState'

// Lazy loading yordamida komponentlarni dinamik yuklash
const LeaderContent = lazy(() => import('./LeaderContent'))
const CommunicationContent = lazy(() => import('./CommunicationContent'))
const GalleryContent = lazy(() => import('./GalleryContent'))
const NewsContent = lazy(() => import('./NewsContent'))
const StaticContent = lazy(() => import('./StaticContent'))
const DocumentsContent = lazy(() => import('./DocumentsContent'))

const ContentOutlet = ({ selectedPage, showContentForm, onShowFormChange }) => {
	// Tanlangan navigatsiya bo'yicha komponentni aniqlash
	const renderContentComponent = () => {
		if (!selectedPage) return null

		const props = {
			page: selectedPage,
			showForm: showContentForm,
			onShowFormChange: onShowFormChange
		}

		switch (selectedPage.type) {
			case 'leader':
				return <LeaderContent {...props} />
			case 'communication':
				return <CommunicationContent {...props} />
			case 'gallery':
				return <GalleryContent {...props} />
			case 'news':
				return <NewsContent {...props} />
			case 'static':
				return <StaticContent {...props} />
			case 'documents':
				return <DocumentsContent {...props} />
			default:
				return <DefaultContent {...props} />
		}
	}

	if (!selectedPage) {
		return <EmptyState />
	}

	return (
		<Suspense fallback={
			<div className="bg-white rounded-xl shadow-lg p-8 text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-gray-600">Kontent yuklanmoqda...</p>
			</div>
		}>
			{renderContentComponent()}
		</Suspense>
	)
}

// Standart komponent
const DefaultContent = ({ page }) => (
	<div className="bg-white rounded-xl shadow-lg p-8">
		<div className="flex items-center gap-3 mb-4">
			<span className="text-2xl">{page.icon}</span>
			<div>
				<h3 className="text-xl font-bold text-gray-800">{page.title.uz}</h3>
				<p className="text-gray-600">{page.slug} • {page.type}</p>
			</div>
		</div>
		<p className="text-gray-600">Bu turdagi kontent hali qo'shilmagan.</p>
	</div>
)

export default ContentOutlet
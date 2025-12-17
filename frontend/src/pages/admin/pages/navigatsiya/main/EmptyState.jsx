import { FileText } from 'lucide-react'

const EmptyState = () => {
	return (
		<div className="bg-white rounded-xl shadow-lg p-8 text-center">
			<FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
			<h3 className="text-lg font-semibold text-gray-800 mb-2">
				Navigatsiya tanlang
			</h3>
			<p className="text-gray-600">
				Kontent qo'shish uchun chap tomondan asosiy navigatsiyani tanlang
			</p>
		</div>
	)
}

export default EmptyState
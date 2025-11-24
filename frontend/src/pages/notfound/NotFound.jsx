
const NotFound = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
				<p className="text-xl text-gray-600 mb-8">Sahifa topilmadi</p>
				<a
					href="/"
					className="text-blue-500 hover:text-blue-700 underline"
				>
					Bosh sahifaga qaytish
				</a>
			</div>
		</div>
	)
}

export default NotFound
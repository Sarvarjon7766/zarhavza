
const NavigationSidebar = ({ pages, selectedPage, onPageSelect, navigationType }) => {
	return (
		<div className="lg:col-span-1">
			<div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
				<h2 className="text-lg font-semibold text-gray-800 mb-4">

					{navigationType === 'main'
						? "Asosiy Navigatsiyalar"
						: "Qo'shimcha Navigatsiyalar"}
				</h2>
				<div className="space-y-2">
					{pages.map((page) => (
						<button
							key={page._id}
							onClick={() => onPageSelect(page)}
							className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPage?._id === page._id
								? 'bg-blue-50 border-blue-500 text-blue-700'
								: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
								}`}
						>
							<div className="flex items-center gap-3">
								<span className="text-lg">{page.icon}</span>
								<div>
									<div className="font-medium">{page.title.uz}</div>
									<div className="text-xs text-gray-500">
										{page.slug} • {page.type}
									</div>
								</div>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	)
}

export default NavigationSidebar
// components/Breadcrumb.jsx
const Breadcrumb = ({ items }) => {
	return (
		<div className="mb-6">
			<nav className="flex" aria-label="Breadcrumb">
				<ol className="flex items-center space-x-2 text-sm text-gray-500">
					{items.map((item, index) => (
						<li key={index} className="flex items-center">
							{index > 0 && (
								<svg className="w-4 h-4 mx-1" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
								</svg>
							)}
							{item.href ? (
								<a href={item.href} className="hover:text-blue-600 transition-colors duration-200">
									{item.label}
								</a>
							) : (
								<span className="text-blue-600 font-medium">{item.label}</span>
							)}
						</li>
					))}
				</ol>
			</nav>
		</div>
	)
}

export default Breadcrumb
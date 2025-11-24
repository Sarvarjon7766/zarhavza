const UsefulLinks = () => {
	const usefulLinks = [
		{
			title: "O'zbekiston Respublikasi Qonun hujjatlari ma'lumotlar milliy bazasi",
			url: "https://www.lex.uz/uz/",
			icon: "/resurs.png"
		},
		{
			title: "O'zbekiston Respublikasi Oliy Majlisining Qonunchilik palatasi",
			url: "https://parliament.gov.uz/",
			icon: "/oliy.png"
		},
		{
			title: "Yagona interaktiv davlat xizmatlari portali",
			url: "https://my.gov.uz/uz",
			icon: "/yag.png"
		},
		{
			title: "Normativ-huquqiy hujjatlar loyihalarini muhokama qilish portali",
			url: "https://regulation.gov.uz/oz",
			icon: "/nor.png"
		},
	]

	return (
		<section className="py-16 bg-gray-50">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
						Foydali havolalar
					</h2>
					<div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
					{usefulLinks.map((link, index) => (
						<a
							key={index}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group flex flex-col items-center text-center cursor-pointer hover:-translate-y-1"
						>
							<div className="w-28 h-28 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 p-5">
								<img
									src={link.icon}
									alt={link.title}
									className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
								/>
							</div>
							<h3 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-blue-700 transition-colors">
								{link.title}
							</h3>
						</a>
					))}
				</div>
			</div>
		</section>
	)
}

export default UsefulLinks
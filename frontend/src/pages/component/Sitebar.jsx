import { FolderOpen, Home, Info, Phone, Users } from "lucide-react"
import { useState } from "react"

const Sitebar = () => {
	const [active, setActive] = useState("about")

	const menu = [
		{ id: "home", label: "Bosh sahifa", icon: <Home className="w-5 h-5" /> },
		{ id: "about", label: "Biz haqimizda", icon: <Info className="w-5 h-5" /> },
		{ id: "projects", label: "Loyihalar", icon: <FolderOpen className="w-5 h-5" /> },
		{ id: "team", label: "Jamoa", icon: <Users className="w-5 h-5" /> },
		{ id: "contact", label: "Bog‘lanish", icon: <Phone className="w-5 h-5" /> },
	]

	return (
		<nav className="space-y-3">
			{menu.map((item) => (
				<button
					key={item.id}
					onClick={() => setActive(item.id)}
					className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-medium transition-all
						${active === item.id
							? "bg-blue-600 text-white shadow-md"
							: "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
						}`}
				>
					{item.icon}
					<span>{item.label}</span>
				</button>
			))}
		</nav>
	)
}

export default Sitebar

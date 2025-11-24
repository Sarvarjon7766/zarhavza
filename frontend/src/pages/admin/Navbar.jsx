import { Menu } from "lucide-react"

const Navbar = ({ onMenuClick }) => {
	return (
		<header className="flex items-center justify-between bg-gray-800 text-white px-4 py-3 shadow-md">
			<div className="flex items-center space-x-3">
				{/* 🔹 Mobil menyu tugmasi */}
				<button
					onClick={onMenuClick}
					className="md:hidden p-2 rounded hover:bg-gray-700 transition"
				>
					<Menu size={24} />
				</button>
				<h1 className="text-xl font-semibold">Boshqaruv Paneli</h1>
			</div>

			{/* 🔹 Profil yoki chiqish tugmasi */}
			<button
				onClick={() => {
					localStorage.removeItem("content-type")
					localStorage.removeItem("token")  // tokenni ham o'chirish
					window.location.href = "/login"
				}}
				className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
			>
				Chiqish
			</button>
		</header>
	)
}

export default Navbar

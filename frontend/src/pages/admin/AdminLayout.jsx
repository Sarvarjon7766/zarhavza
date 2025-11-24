import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Sitebar from "./Sitebar"

const AdminLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const token = localStorage.getItem("token")
		const role = localStorage.getItem("content-type")

		if (!token || !role) {
			localStorage.removeItem("token")
			localStorage.removeItem("content-type")
			navigate("/login")
		}
	}, [navigate])

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
			<div className="flex flex-1">
				<Sitebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
				<main className="flex-1 bg-gray-100">
					<Outlet />
				</main>
			</div>
		</div>
	)
}

export default AdminLayout

import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children, allowedRoles }) => {
	const role = localStorage.getItem("content-type")
	const token = localStorage.getItem("token")

	if (!role || !token) {
		localStorage.removeItem("token")
		localStorage.removeItem("content-type")
		return <Navigate to="/login" />
	}

	if (!allowedRoles.includes(role)) return <Navigate to="/" />

	return children
}

export default ProtectedRoute

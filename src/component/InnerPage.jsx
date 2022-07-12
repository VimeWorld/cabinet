import { Outlet } from "react-router-dom"
import { useApp } from "../App"

export const InnerPage = () => {
    const { app } = useApp()

    return <>
        <h1>Navbar</h1>
        <Outlet />
    </>
}

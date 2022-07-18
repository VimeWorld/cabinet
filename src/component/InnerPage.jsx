import { Outlet } from "react-router-dom"

export const InnerPage = () => {
    return <>
        <h1>Navbar</h1>
        <Outlet />
    </>
}

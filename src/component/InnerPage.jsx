import { Outlet } from "react-router-dom"
import MainNavbar from "./MainNavbar"
import Sidebar from "./Sidebar"

const InnerPage = () => {
    return <>
        <MainNavbar />
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-lg-3 col-md-4 col-12">
                    <Sidebar />
                </div>
                <div className="col-lg-9 col-md-8 col-12">
                    <Outlet />
                </div>
            </div>
        </div>
    </>
}

export default InnerPage

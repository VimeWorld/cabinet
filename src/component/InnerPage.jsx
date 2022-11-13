import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

const InnerPage = () => {
    return <div className="container pt-5">
        <div className="row justify-content-center">
            <div className="col-lg-3 col-md-4 col-12">
                <Sidebar />
            </div>
            <div className="col-lg-9 col-md-8 col-12">
                <Outlet />
            </div>
        </div>
    </div>
}

export default InnerPage

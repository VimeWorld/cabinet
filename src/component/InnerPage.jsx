import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

export const InnerPage = () => {
    return <div className="container pt-5">
        <div className="row justify-content-center">
            <div className="col-3">
                <Sidebar />
            </div>
            <div className="col-7">
                <Outlet />
            </div>
        </div>
    </div>
}

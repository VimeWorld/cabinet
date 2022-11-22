import classNames from "classnames"
import { Link, useLocation, useResolvedPath } from "react-router-dom"
import useApp from "../hook/useApp"
import './Sidebar.css'

const MenuItem = ({ to, icon, children, onClick, className }) => {
    const location = useLocation()
    const path = useResolvedPath(to)

    const active = !!to && path.pathname == location.pathname

    return <li className="nav-item">
        <Link
            className={classNames("nav-link", { "active": active }, className)}
            to={to}
            onClick={onClick}
        >
            <i className={"bi " + icon} />
            {children}
        </Link>
    </li>
}

const Sidebar = () => {
    const { logout } = useApp()

    return <div className="sidebar rounded-3 shadow-sm p-4 mb-5">
        <div>
            <div className="nav-header p-1 mb-1">Меню</div>
            <ul className="nav nav-pills flex-column mb-3">
                <MenuItem to="/" icon="bi-house-door">Главная</MenuItem>
                <MenuItem to="/payments" icon="bi-credit-card">Платежи</MenuItem>
                <MenuItem to="/security" icon="bi-shield">Безопасность</MenuItem>
                <MenuItem to="/bans" icon="bi-slash-circle">Баны</MenuItem>
                <MenuItem to="" onClick={logout} icon="bi-power">Выход</MenuItem>
            </ul>
            <div className="nav-header p-1 mb-1">Minigames</div>
            <ul className="nav nav-pills flex-column">
                <MenuItem to="/minigames/donate" icon="bi-cash-coin">Изменение статуса</MenuItem>
                <MenuItem to="/minigames/guild" icon="bi-people">Управление гильдией</MenuItem>
            </ul>
        </div>
    </div>
}

export default Sidebar

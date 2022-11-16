import classNames from "classnames"
import { Link, useLocation, useResolvedPath } from "react-router-dom"
import useApp from "../hook/useApp"
import './Sidebar.css'

const MenuItem2 = ({ to, icon, children }) => {
    const location = useLocation()
    const path = useResolvedPath(to)

    const active = !!to && path.pathname == location.pathname

    return <li className="nav-item">
        <Link className={classNames("nav-link", { "active": active })} to={to}>
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
                <MenuItem2 to="/" icon="bi-house-door">Главная</MenuItem2>
                <MenuItem2 to="/payments" icon="bi-credit-card">Платежи</MenuItem2>
                <MenuItem2 to="/security" icon="bi-shield">Безопасность</MenuItem2>
                <MenuItem2 to="/bans" icon="bi-slash-circle">Баны</MenuItem2>
                <MenuItem2 to="" onClick={logout} icon="bi-power">Выход</MenuItem2>
            </ul>
            <div className="nav-header p-1 mb-1">Minigames</div>
            <ul className="nav nav-pills flex-column">
                <MenuItem2 to="/minigames/donate" icon="bi-cash-coin">Платные услуги</MenuItem2>
                <MenuItem2 to="/minigames/guild" icon="bi-people">Управление гильдией</MenuItem2>
            </ul>
        </div>
    </div>
}

export default Sidebar

import { ListGroup } from "react-bootstrap"
import { Link, useLocation, useResolvedPath } from "react-router-dom"
import useApp from "../hook/useApp"

const MenuItem = ({ to, children }) => {
    const location = useLocation()
    const path = useResolvedPath(to)

    const active = path.pathname == location.pathname

    return <ListGroup.Item
        as={Link}
        to={to}
        active={active}
        action
    >
        {children}
    </ListGroup.Item>
}

const Sidebar = () => {
    const { logout } = useApp()

    return <div>
        <ListGroup className="mb-3 shadow">
            <MenuItem to="/">Главная</MenuItem>
            <MenuItem to="/payments">Платежи</MenuItem>
            <MenuItem to="/settings">Настройки</MenuItem>
            <ListGroup.Item action onClick={logout}>Выход</ListGroup.Item>
        </ListGroup>

        <div className="card shadow">
            <h5 className="card-header">Minigames</h5>
            <ListGroup>
                <MenuItem to="/minigames/donate">Платные услуги</MenuItem>
                <MenuItem to="/minigames/guild">Управление гильдией</MenuItem>
                <MenuItem to="/minigames/bans">Баны</MenuItem>
            </ListGroup>
        </div>
    </div>
}

export default Sidebar

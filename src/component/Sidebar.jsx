import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { Offcanvas } from "react-bootstrap"
import { Link, useLocation, useResolvedPath } from 'react-router-dom'
import useSharedState from '../hook/useSharedState'
import { EventBus } from '../lib/eventbus'
import './Sidebar.css'

const KeyShowToggle = Symbol('sidebar.show')
const KeyExists = Symbol('sidebar.exists')
let sidebarExists = false

const SidebarToggleButton = () => {
    const [show, setShow] = useSharedState(KeyShowToggle, false)
    const [exists, setExists] = useState(sidebarExists)

    useEffect(() => {
        return EventBus.on(KeyExists, val => {
            setExists(val)
        })
    }, [])

    if (!exists)
        return <div className="d-md-none" style={{ width: "3rem" }}></div>

    return <button
        aria-controls="sidebar-offcanvas"
        aria-label="Toggle sidebar navigation"
        className="border-0 navbar-toggler collapsed"
        onClick={() => setShow(!show)}
    >
        <i className="bi bi-list" style={{ fontSize: "130%" }} />
    </button>
}

const MenuItem = ({ to, icon, children, onClick, className }) => {
    const location = useLocation()
    const path = useResolvedPath(to)

    const active = !!to && path.pathname == location.pathname
    const click = () => {
        EventBus.emit(KeyShowToggle, false)
        onClick?.()
    }

    return <li className="nav-item">
        <Link
            className={classNames("nav-link", { "active": active }, className)}
            to={to}
            onClick={click}
        >
            <i className={"bi " + icon} />
            {children}
        </Link>
    </li>
}

const Sidebar = () => {
    const [show, setShow] = useSharedState(KeyShowToggle, false)

    useEffect(() => {
        sidebarExists = true
        EventBus.emit(KeyExists, true)
        return () => {
            sidebarExists = false
            EventBus.emit(KeyExists, false)
        }
    }, [])

    return <div className="bg-body rounded-3 shadow-sm p-4 mb-5 d-none d-md-block">
        <Offcanvas
            id="sidebar-offcanvas"
            aria-labelledby="sidebar-offcanvas-label"
            placement="start"
            responsive="md"
            show={show}
            onHide={() => setShow(false)}
            className={show ? "" : "sidebar-inplace"}
            scroll={true}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title id="sidebar-offcanvas-label">
                    Личный кабинет
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div className="sidebar w-100">
                    <div className="nav-header p-1 mb-1">Меню</div>
                    <ul className="nav nav-pills flex-column mb-3">
                        <MenuItem to="/" icon="bi-house-door">Главная</MenuItem>
                        <MenuItem to="/payments" icon="bi-credit-card">Платежи</MenuItem>
                        <MenuItem to="/security" icon="bi-shield">Безопасность</MenuItem>
                        <MenuItem to="/bans" icon="bi-slash-circle">Баны</MenuItem>
                    </ul>
                    <div className="nav-header p-1 mb-1">Minigames</div>
                    <ul className="nav nav-pills flex-column">
                        <MenuItem to="/minigames/donate" icon="bi-cash-coin">Изменение статуса</MenuItem>
                        <MenuItem to="/minigames/guild" icon="bi-people">Управление гильдией</MenuItem>
                    </ul>
                </div>
            </Offcanvas.Body>
        </Offcanvas >
    </div>
}

export default Sidebar
export { SidebarToggleButton }

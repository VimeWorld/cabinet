import { Container, Nav, Navbar, NavDropdown, Offcanvas } from "react-bootstrap"
import useApp from "../hook/useApp"
import { SidebarToggleButton } from "./Sidebar";

const UserBox = () => {
    const { app, logout } = useApp()
    if (!app.user)
        return null;
    const anticache = app.skinModified ? '?_=' + app.skinModified : ''
    return <Nav>
        <NavDropdown id="userDropdown" title={<span>
            <img
                width="26"
                height="26"
                className="m-n1"
                alt={app.user.username}
                src={`https://skin.vimeworld.com/helm/3d/${app.user.username}/26.png${anticache}`}
            />
            <span className="ms-2">{app.user.username}</span>
        </span>}>
            <NavDropdown.Item onClick={logout}>Выход</NavDropdown.Item>
        </NavDropdown>
    </Nav>
}

const MainNavbar = () => {
    return <Navbar bg="white" expand="md" className="shadow-sm">
        <Container>
            <SidebarToggleButton />
            <Navbar.Brand
                href="https://vimeworld.com"
                className="p-0 me-0 me-md-4 fs-4 fw-bold"
            >
                VimeWorld
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="main-nav-offcanvas" className="border-0">
                <i className="bi bi-three-dots" style={{ fontSize: "130%" }} />
            </Navbar.Toggle>
            <Navbar.Offcanvas
                id="main-nav-offcanvas"
                aria-labelledby="main-nav-offcanvas-label"
                placement="end"
                scroll={true}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title id="main-nav-offcanvas-label">
                        VimeWorld
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-grow-1">
                        <Nav.Link href="https://vimeworld.com">Сайт</Nav.Link>
                        <Nav.Link href="https://forum.vimeworld.com">Форум</Nav.Link>
                        <Nav.Link href="https://forum.vimeworld.com/forum/139-%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8/">Новости</Nav.Link>
                    </Nav>
                    <UserBox />
                </Offcanvas.Body>
            </Navbar.Offcanvas>
        </Container>
    </Navbar>
}

export default MainNavbar

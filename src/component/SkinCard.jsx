import { useEffect, useState } from "react"
import { Button, Modal } from "react-bootstrap"
import useApp from "../hook/useApp"
import { fetchApi } from "../lib/api"

let capeExistsCache = null

const ModalCape = ({ show, close, exists }) => {
    return <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
            <Modal.Title>Покупка плаща</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={close}>
                Закрыть
            </Button>
            <Button variant="primary" onClick={close}>
                Купить
            </Button>
        </Modal.Footer>
    </Modal>
}

export const SkinCard = () => {
    const { app } = useApp()
    const [capeExists, setCapeExists] = useState(capeExistsCache)
    const [showModalCape, setShowModalCape] = useState(false)

    useEffect(() => {
        if (capeExists)
            return
        fetchApi('/cp/user/cape')
            .then(response => response.json())
            .then(body => {
                if (body.success) {
                    capeExistsCache = body.response.exists
                    setCapeExists(body.response.exists)
                }
            })
            .catch(console.log)
    }, [])

    const capeStyle = { width: 150, height: 240 }

    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Скин и плащ</h4>
            <span>Здесь вы можете изменить свой скин на всех серверах VimeWorld</span>
        </div>
        <div className="card-body">
            <div className="row">
                <div className="col d-flex align-items-center justify-content-center flex-column">
                    <img src={`https://skin.vimeworld.com/body/${app.user.username}.png`} style={{ width: 160, height: 320 }} />
                    <button className="btn btn-outline-primary mt-3 ">Изменить</button>
                </div>
                <div className="col d-flex align-items-center justify-content-center flex-column">
                    <div className="flex-grow-1 d-flex align-items-center justify-items-center">
                        {capeExists === null && <div className="placeholder-glow" style={capeStyle}><span className="placeholder bg-secondary h-100 w-100"></span></div>}
                        {capeExists === false && <img src="/assets/image/no_cloak.jpg" style={capeStyle} />}
                        {capeExists === true && <img src={`https://skin.vimeworld.com/cape/${app.user.username}.png`} style={capeStyle} />}
                    </div>
                    {capeExists !== null &&
                        <button className="flex-shrink-1 btn btn-outline-primary mt-3" onClick={() => setShowModalCape(true)}>{capeExists ? 'Изменить' : 'Купить'}</button>
                    }
                </div>
            </div>
            <ModalCape
                show={showModalCape}
                close={() => setShowModalCape(false)}
                exists={capeExists}
            />
        </div>
    </div>
}

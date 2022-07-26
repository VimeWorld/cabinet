import { useEffect, useRef, useState } from "react"
import { Button, Modal, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap"
import useApp from "../hook/useApp"
import { fetchApi } from "../lib/api"
import Notifications from "../lib/notifications"

const maxSizeKb = 50
let capeExistsCache = null

const ModalSkin = ({ show, close }) => {
    const file = useRef()
    const [skinType, setSkinType] = useState('steve')
    const [loading, setLoading] = useState(false)

    const onSubmit = e => {
        e.preventDefault()
        const skinFile = file.current.files[0]

        if (skinFile.size >= maxSizeKb * 1024) {
            Notifications.error(`Максимальный размер скина ${maxSizeKb}кб`)
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('file', skinFile)
        formData.append('type', skinType)
        fetchApi('/cp/user/skin', {
            method: 'POST',
            body: formData,
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Скин успешно изменен')
                    close()
                } else {
                    switch (body.response.type) {
                        case "too_large":
                            Notifications.error(`Максимальный размер скина ${maxSizeKb}кб`)
                            break
                        case "invalid_dimension":
                            Notifications.error('Размеры скина должны быть 64x64 или 64x32')
                            break
                        case "not_png":
                            Notifications.error('Файл скина должен быть .png файлом')
                            break
                        default:
                            Notifications.error(body.response.title)
                    }
                }
                file.current.value = null
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <Modal show={show} onHide={close}>
        <form onSubmit={onSubmit}>
            <Modal.Header closeButton>
                <Modal.Title>Изменение скина</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Скин должен быть в формате <code>.png</code>.
                    Размеры скина должны быть <code>64x64</code> или <code>64х32</code>.
                </p>

                <input ref={file} className="form-control mb-3" type="file" required accept="image/png" />

                <div>
                    <span className="me-3">Тип скина:</span>
                    <div className="form-check form-check-inline">
                        <input
                            id="check-steve"
                            className="form-check-input"
                            type="radio"
                            checked={skinType == 'steve'}
                            onChange={e => setSkinType('steve')}
                        />
                        <OverlayTrigger overlay={<Tooltip>Стандартный скин</Tooltip>}>
                            <label className="form-check-label" htmlFor="check-steve">Стив</label>
                        </OverlayTrigger>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            id="check-alex"
                            className="form-check-input"
                            type="radio"
                            checked={skinType == 'alex'}
                            onChange={e => setSkinType('alex')}
                        />
                        <OverlayTrigger overlay={<Tooltip>Более тонкие руки</Tooltip>}>
                            <label className="form-check-label" htmlFor="check-alex">Алекс</label>
                        </OverlayTrigger>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close}>
                    Закрыть
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading && <Spinner className="align-baseline" animation="border" as="span" size="sm" aria-hidden="true" />}
                    {loading ? ' Загрузка...' : 'Изменить'}
                </Button>
            </Modal.Footer>
        </form>
    </Modal>
}

const ModalCape = ({ show, close, exists, onChanged }) => {
    const { fetchAuth } = useApp()
    const file = useRef()
    const [loading, setLoading] = useState(false)

    const onSubmit = e => {
        e.preventDefault()
        const skinFile = file.current.files[0]

        if (skinFile.size >= maxSizeKb * 1024) {
            Notifications.error(`Максимальный размер плаща ${maxSizeKb}кб`)
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('file', skinFile)
        fetchApi('/cp/user/cape', {
            method: 'POST',
            body: formData,
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    if (!exists) {
                        Notifications.success('Плащ успешно установлен')
                        capeExistsCache = true
                        fetchAuth()
                    } else {
                        Notifications.success('Плащ успешно изменен')
                    }
                    onChanged?.()
                    close()
                } else {
                    switch (body.response.type) {
                        case "insufficient_funds":
                            Notifications.error('У вас недостаточно вимеров')
                            close()
                            break
                        case "too_large":
                            Notifications.error(`Максимальный размер плаща ${maxSizeKb}кб`)
                            break
                        case "invalid_dimension":
                            Notifications.error('Размеры плаща должны быть 22х17 или 64х32')
                            break
                        case "not_png":
                            Notifications.error('Файл плаща должен быть .png файлом')
                            break
                        default:
                            Notifications.error(body.response.title)
                    }
                }
                file.current.value = null
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <Modal show={show} onHide={close}>
        <form onSubmit={onSubmit}>
            <Modal.Header closeButton>
                <Modal.Title>{exists ? 'Изменение' : 'Покупка'} плаща</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!exists && <p>
                    Стоимость плаща <b className="text-success">50 вимеров</b>.
                    После покупки вы сможете менять плащ сколько угодно раз.
                </p>}

                <p>
                    Плащ должен быть в формате <code>.png</code>.
                    Размеры плаща должны быть <code>22х17</code> или <code>64х32</code>.
                </p>

                <input ref={file} className="form-control" type="file" required accept="image/png" />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close}>
                    Закрыть
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading && <Spinner className="align-baseline" animation="border" as="span" size="sm" aria-hidden="true" />}
                    {loading ? ' Загрузка...' : exists ? 'Изменить' : 'Купить'}
                </Button>
            </Modal.Footer>
        </form>
    </Modal>
}

export const SkinCard = () => {
    const { app } = useApp()
    const [capeExists, setCapeExists] = useState(capeExistsCache)
    const [showModalCape, setShowModalCape] = useState(false)
    const [showModalSkin, setShowModalSkin] = useState(false)

    useEffect(() => {
        if (capeExists != null)
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
    }, [capeExists])

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
                    <button className="btn btn-outline-primary mt-3" onClick={() => setShowModalSkin(true)}>Изменить</button>
                </div>
                <div className="col d-flex align-items-center justify-content-center flex-column">
                    <div className="flex-grow-1 d-flex align-items-center justify-items-center">
                        {capeExists === null && <div className="placeholder-glow" style={capeStyle}><span className="placeholder bg-secondary h-100 w-100"></span></div>}
                        {capeExists === false && <img src="/assets/image/no_cloak.jpg" style={capeStyle} />}
                        {capeExists === true && <img src={`https://skin.vimeworld.com/cape/${app.user.username}.png`} style={capeStyle} />}
                    </div>
                    <button
                        className="flex-shrink-1 btn btn-outline-primary mt-3"
                        onClick={() => setShowModalCape(true)}
                        disabled={capeExists === null}>
                        {capeExists === null ? 'Загрузка...' : capeExists ? 'Изменить' : 'Купить'}
                    </button>
                </div>
            </div>
            <ModalCape
                show={showModalCape}
                close={() => setShowModalCape(false)}
                exists={capeExists}
                onChanged={() => setCapeExists(true)}
            />
            <ModalSkin
                show={showModalSkin}
                close={() => setShowModalSkin(false)}
            />
        </div>
    </div>
}

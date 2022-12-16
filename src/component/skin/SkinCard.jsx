import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { Button, Modal, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap"
import useApp from "../../hook/useApp"
import { fetchApi } from "../../lib/api"
import { EventBus, EVENT_LOGOUT } from "../../lib/eventbus"
import Notifications from "../../lib/notifications"

const SkinViewer3d = lazy(() => import("./SkinViewer3d"))

const maxSizeKb = 50
let capeExistsCache = null

EventBus.on(EVENT_LOGOUT, () => {
    capeExistsCache = null
})

const ModalSkin = ({ show, close }) => {
    const { updateApp } = useApp()
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
        fetchApi('/user/skin', {
            method: 'POST',
            body: formData,
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    updateApp({ skinModified: Date.now() })
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
                            onChange={() => setSkinType('steve')}
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
                            onChange={() => setSkinType('alex')}
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
                    {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                    {loading ? ' Загрузка...' : 'Изменить'}
                </Button>
            </Modal.Footer>
        </form>
    </Modal>
}

const ModalCape = ({ show, close, exists, onChanged }) => {
    const { fetchAuth, updateApp } = useApp()
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
        fetchApi('/user/cape', {
            method: 'POST',
            body: formData,
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    if (!exists) {
                        updateApp({ skinModified: Date.now() })
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
                    {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                    {loading ? ' Загрузка...' : exists ? 'Изменить' : 'Купить'}
                </Button>
            </Modal.Footer>
        </form>
    </Modal>
}

const SkinCard = () => {
    const { app } = useApp()
    const [capeExists, setCapeExists] = useState(capeExistsCache)
    const [showModalCape, setShowModalCape] = useState(false)
    const [showModalSkin, setShowModalSkin] = useState(false)

    const cardRef = useRef()

    useEffect(() => {
        if (capeExists != null)
            return
        fetchApi('/user/cape')
            .then(response => response.json())
            .then(body => {
                if (body.success) {
                    capeExistsCache = body.response.exists
                    setCapeExists(body.response.exists)
                }
            })
            .catch(console.log)
    }, [capeExists])

    const anticache = app.skinModified ? '?_=' + app.skinModified : ''

    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Скин и плащ</h4>
            <span>Здесь вы можете изменить свой скин на всех серверах VimeWorld</span>
        </div>
        <div ref={cardRef} className="card-body">
            <Suspense fallback={
                <div className="d-flex justify-content-center align-items-center" style={{ height: 255 }}>
                    <Spinner size="lg" variant="secondary" />
                </div>
            }>
                <SkinViewer3d
                    skin={`https://mc.vimeworld.com/launcher/skins/${app.user.username}.png${anticache}`}
                    cape={capeExists && `https://mc.vimeworld.com/launcher/cloaks/${app.user.username}.png${anticache}`}
                    height={250}
                    parent={cardRef}
                />
            </Suspense>
            <div className="d-flex justify-content-center gap-3">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowModalSkin(true)}>
                    Изменить скин
                </button>

                <button
                    className="btn btn-outline-primary"
                    onClick={() => setShowModalCape(true)}
                    disabled={capeExists === null}>
                    {capeExists === null ? 'Загрузка...' : capeExists ? 'Изменить плащ' : 'Купить плащ'}
                </button>
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

export default SkinCard

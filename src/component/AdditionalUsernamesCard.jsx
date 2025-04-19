import { useEffect, useState } from "react"
import { fetchApi } from "../lib/api"
import { Button, Form, Spinner, Modal, OverlayTrigger, Tooltip } from "react-bootstrap"
import { useForm } from "react-hook-form"
import useApp from "../hook/useApp"
import Notifications from "../lib/notifications"

const buyUsernamePrice = Math.floor(699);
const changeUsernamePrice = Math.floor(349);

const ModalUpdateCase = ({ show, close, username }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            new_nickname: username,
        }
    })
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        reset(formValues => ({
            ...formValues,
            new_nickname: username
        }));
    }, [username]);

    const onSubmit = data => {
        if (loading) {
            return;
        }
        setLoading(true)
        fetchApi('/user/nickname/update_case', {
            method: 'POST',
            body: {'nickname': username, 'new_nickname': data.new_nickname},
        }).then(r => r.json())
            .then(body => {
                close();
                if (body.success) {
                    Notifications.success(<>
                        Никнейм успешно изменен
                    </>)
                    window.location.reload(false);
                    return
                }
                switch (body.response.type) {
                    case 'invalid_username':
                        Notifications.error('Некорректный никнейм')
                        break
                    case 'throttle':
                        Notifications.error('Слишком частая смена ника')
                        break
                    case 'insufficient_donate':
                        Notifications.error('ОБТ: Доступно от доната Divine')
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <Modal show={show} onHide={close}>
        <form onSubmit={handleSubmit(onSubmit)}>
            <Modal.Header closeButton>
                <Modal.Title>Изменение регистра никнейма</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Здесь вы можете изменить регистр своего никнейма. Поменяйте регистр нужных букв в своем никнейме и нажмите Изменить. Стоимость изменения <code>{changeUsernamePrice} вимеров</code>.
                </p>

                <Form.Group className="mb-3" controlId="new_nickname">
                    <Form.Label>Введите новый никнейм</Form.Label>
                    <Form.Control type="text" defaultValue={username} {...register('new_nickname', {
                        validate: (val) => {
                            if (val.toLowerCase() !== username.toLowerCase())
                                return 'Никнеймы должны совпадать'
                        },
                    })} isInvalid={!!errors.new_nickname} />
                    {errors.new_nickname && <Form.Control.Feedback type="invalid">{errors.new_nickname.message}</Form.Control.Feedback>}
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={close}>
                    Закрыть
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                    {loading ? ' Загрузка...' : 'Изменить (' + changeUsernamePrice + ' вим.)'}
                </Button>
            </Modal.Footer>
        </form>
    </Modal>
}

export const AdditionalUsernamesCard = () => {
    const { app, updateApp } = useApp()
    const [additionalUsernames, setAdditionalUsernames] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activateLoading, setActivateLoading] = useState(false);
    const [activateInstall, setActivateInstall] = useState(false);
    const [nicknameUpdateCase, setNicknameUpdateCase] = useState(null);
    const [showModalUpdateCase, setShowModalUpdateCase] = useState(false)
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            username: ''
        }
    })
    const installUsername = (username) => {
        if (activateInstall) return;
        setActivateInstall(true);
        fetchApi('/user/nickname/install', {
            method: 'POST',
            body: {'nickname': username},
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success(<>
                        Никнейм успешно изменен
                    </>)
                    updateApp({
                        user: body.response,
                    })
                    window.location.reload(false);
                    return
                }
                switch (body.response.type) {
                    case 'invalid_username':
                        Notifications.error('Некорректный никнейм')
                        break
                    case 'throttle':
                        Notifications.error('Слишком частая смена ника')
                        break
                    case 'insufficient_donate':
                        Notifications.error('ОБТ: Доступно от доната Divine')
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setActivateInstall(false))
    };
    const registerUsername = data => {
        if (activateLoading) return;
        setActivateLoading(true);
        fetchApi('/user/nickname/create', {
            method: 'POST',
            body: data,
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success(<>
                        Никнейм успешно куплен
                    </>)
                    reset()
                    window.location.reload(false);
                    return
                }
                switch (body.response.type) {
                    case 'invalid_username':
                        setError('username_additional', { message: 'Некорректный никнейм' }, { shouldFocus: true })
                        break
                    case 'username_already_exists':
                        setError('username_additional', { message: 'Такой никнейм уже зарегистрирован' }, { shouldFocus: true })
                        break
                    case 'insufficient_funds':
                        setError('username_additional', { message: 'Недостаточно вимеров для покупки' }, { shouldFocus: true })
                        break
                    case 'insufficient_donate':
                        Notifications.error('ОБТ: Доступно от доната Divine')
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setActivateLoading(false))
    };
    useEffect(() => {
        if (additionalUsernames != null)
            return
        fetchApi('/user/nickname/list')
            .then(response => response.json())
            .then(body => {
                if (body.success) {
                    setAdditionalUsernames(body.response.nicknames);
                    setLoading(false);
                }
            })
            .catch(console.log)
    }, [additionalUsernames])
    return <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
            <div className="mb-0">
                <h4 className="mb-0">Никнеймы</h4>
                <span>Тут вы можете купить дополнительные никнеймы и переключаться между ними</span>
                <br />
                <a href="https://collect.vimeworld.com">
                    <button className="btn btn-primary text-nowrap" type="submit">
                        Vime Collect
                    </button>
                </a>
            </div>
        </div>
        <div className="card-table">
            <table className="table">
                <tbody>
                    <tr key={app.user.username}>
                            <td className="fit">{app.user.username}<OverlayTrigger overlay={<Tooltip>
                        Изменить регистр никнейма
                    </Tooltip>}>
                        <button type="button" className="btn" onClick={() => {
                            setNicknameUpdateCase(app.user.username);
                            setShowModalUpdateCase(true);
                        }}><i className="bi bi-pencil text-primary"></i></button>
                    </OverlayTrigger></td>
                            <td className="fit"><button type="button" className="btn btn-outline-success" disabled={true}><i className="bi bi-check" /></button></td>
                    </tr>
                    {!loading && additionalUsernames.map(username => {
                        return <tr key={username.username}>
                            <td className="fit">{username.username}<OverlayTrigger overlay={<Tooltip>
                        Изменить регистр никнейма
                    </Tooltip>}>
                        <button type="button" className="btn" onClick={() => {
                            setNicknameUpdateCase(username.username);
                            setShowModalUpdateCase(true);
                        }}><i className="bi bi-pencil text-primary"></i></button>
                    </OverlayTrigger></td>
                            <td className="fit"><button type="button" disabled={activateInstall} onClick={() => installUsername(username.username)} className="btn btn-outline-primary"><i className="bi bi-check" /></button></td>
                        </tr>
                    })}
                </tbody>
            </table>
            <div className="card-body">
                <form onSubmit={handleSubmit(registerUsername)}>
                        <div className="d-flex">
                                <Form.Group className="w-100" controlId="inp_promo">
                                    <Form.Control
                                        {...register("nickname", {
                                            required: true,
                                        })}
                                        autoComplete="off"
                                        placeholder={app.user.username}
                                        isInvalid={!!errors.username_additional}
                                    />
                                    {errors.username_additional && <Form.Control.Feedback type="invalid">{errors.username_additional.message}</Form.Control.Feedback>}
                                </Form.Group>
                                <div className="ms-3">
                                    <button className="btn btn-primary text-nowrap" type="submit" disabled={activateLoading}>
                                        {activateLoading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                                        {activateLoading ? ' Загрузка...' : 'Купить | ' + buyUsernamePrice + ' вим.'}
                                    </button>
                                </div>
                            </div>
                </form>
                <ModalUpdateCase
                    show={showModalUpdateCase}
                    close={() => setShowModalUpdateCase(false)}
                    username={nicknameUpdateCase}
                />
            </div>
        </div>
    </div>
};
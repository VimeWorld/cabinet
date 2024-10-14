import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { fetchApi } from "../lib/api"
import { Form, Spinner } from "react-bootstrap"
import { useForm } from "react-hook-form"
import useApp from "../hook/useApp"
import Notifications from "../lib/notifications"

export const AdditionalUsernamesCard = () => {
    const { app, updateApp } = useApp()
    const [additionalUsernames, setAdditionalUsernames] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activateLoading, setActivateLoading] = useState(false);
    const [activateInstall, setActivateInstall] = useState(false);
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
                        Notifications.error('ОБТ: Доступно от доната Elite')
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
                        Notifications.error('ОБТ: Доступно от доната Elite')
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
            </div>
        </div>
        <div className="card-table">
            <table className="table">
                <tbody>
                    <tr key={app.user.username}>
                            <td className="fit">{app.user.username}</td>
                            <td className="fit"><button type="button" className="btn btn-outline-success" disabled={true}><i className="bi bi-check" /></button></td>
                    </tr>
                    {!loading && additionalUsernames.map(username => {
                        return <tr key={username.username}>
                            <td className="fit">{username.username}</td>
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
                                        {activateLoading ? ' Загрузка...' : 'Купить | 1999 вим.'}
                                    </button>
                                </div>
                            </div>
                </form>
            </div>
        </div>
    </div>
};
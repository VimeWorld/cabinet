import { useState } from "react"
import { Form, Spinner } from "react-bootstrap"
import { useForm } from "react-hook-form"
import useApp from "../hook/useApp"
import useLoadPages from "../hook/useLoadPages"
import { fetchApi } from "../lib/api"
import Notifications from "../lib/notifications"

export const PromoCard = () => {
    const { fetchAuth } = useApp()

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            promo: ''
        }
    })
    const [activateLoading, setActivateLoading] = useState(false)

    const pages = useLoadPages(id => fetchApi('/promo/history?count=10&id=' + id), false)

    const activatePromo = data => {
        if (activateLoading) return
        setActivateLoading(true)
        fetchApi('/promo/activate', {
            method: 'POST',
            body: { promo: data.promo },
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success(<>
                        Промо-код успешно активирован: {<span dangerouslySetInnerHTML={{ __html: body.response.info }} />}
                    </>)
                    reset()
                    if (pages.id === 0) pages.load()
                    if (body.response.action === 'vimer') fetchAuth()
                    return
                }
                switch (body.response.type) {
                    case 'already_activated':
                        setError('promo', { message: 'Промо-код уже активирован' }, { shouldFocus: true })
                        break
                    case 'not_exists':
                        setError('promo', { message: 'Такого промо-кода не существует' }, { shouldFocus: true })
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setActivateLoading(false))
    }

    return <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
            <div className="mb-0">
                <h4 className="mb-0">Промо-код</h4>
                <span>Если у вас есть промо-код, активируйте его и получите награду</span>
            </div>
            {pages.loading && <div>
                <Spinner variant="secondary" />
            </div>}
        </div>

        <div className="card-body">
            <form onSubmit={handleSubmit(activatePromo)}>
                <div className="d-flex">
                    <Form.Group className="w-100" controlId="inp_promo">
                        <Form.Control
                            {...register("promo", {
                                required: true,
                            })}
                            autoComplete="off"
                            placeholder="XXX-XXXXXX-XX-XXXX"
                            isInvalid={!!errors.promo}
                        />
                        {errors.promo && <Form.Control.Feedback type="invalid">{errors.promo.message}</Form.Control.Feedback>}
                    </Form.Group>
                    <div className="ms-3">
                        <button className="btn btn-primary text-nowrap" type="submit" disabled={activateLoading}>
                            {activateLoading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                            {activateLoading ? ' Загрузка...' : 'Активировать'}
                        </button>
                    </div>
                </div>
            </form>
        </div>

        {pages.isLoadRequested ?
            <div className="card-table table-responsive">
                <table className="table">
                    <thead className="table-tertiary">
                        <tr>
                            <th scope="col" className="border-bottom-0">Код</th>
                            <th scope="col" className="border-bottom-0">Дата</th>
                            <th scope="col" style={{ minWidth: 300 }} className="border-bottom-0">Описание</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.loading && !pages.items && <tr><td className="placeholder-glow" colSpan="3">
                            <span className="placeholder bg-secondary col-1"></span>
                            <span className="placeholder bg-secondary col-10 ms-2"></span>
                        </td></tr>}

                        {pages.error && !pages.loading && <tr><td className="text-center text-danger" colSpan="3">
                            <p>При загрузке произошла ошибка</p>
                            <button className="btn btn-outline-secondary" onClick={() => pages.load()}>Попробовать снова</button>
                        </td></tr>}

                        {pages.items?.length === 0 && <tr><td className="text-center text-body-secondary" colSpan="3">
                            Вы еще не активировали ни одного кода...
                        </td></tr>}

                        {pages.items?.map(p => {
                            return <tr key={p.id}>
                                <td className="fit text-body-secondary"><code>{p.code}</code></td>
                                <td className="fit">{new Date(Date.parse(p.date)).toLocaleString()}</td>
                                <td dangerouslySetInnerHTML={{ __html: p.info }}></td>
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
            :
            <div className="card-body">
                <div className="text-center">
                    <button
                        className="btn btn-outline-primary"
                        style={{ marginTop: "-1.5rem" }}
                        onClick={() => pages.load()}>
                        История активаций
                    </button>
                </div>
            </div>
        }

        {pages.hasPages &&
            <div className="card-body">
                {pages.Pagination}
            </div>}
    </div>
}

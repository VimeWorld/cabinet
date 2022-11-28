import { useEffect, useState } from "react"
import { Form, OverlayTrigger, ProgressBar, Spinner, Tooltip } from "react-bootstrap"
import { useForm } from "react-hook-form"
import useApp from "../hook/useApp"
import { useTitle } from "../hook/useTitle"
import { fetchApi } from "../lib/api"
import { EventBus, EVENT_MINIGAMES_PROFILE_UPDATED } from "../lib/eventbus"
import { ruPluralizeVimers } from "../lib/i18n"
import Notifications from "../lib/notifications"

const max = 5000
const segments = [{
    name: 'VIP',
    limit: 200,
    barColor: 'rgb(33 150 243 / 15%)',
    duration: '30 дней',
}, {
    name: 'Premium',
    limit: 500,
    barColor: 'rgb(33 150 243 / 35%)',
    duration: '45 дней',
}, {
    name: 'Premium',
    limit: 1000,
    barColor: 'rgb(33 150 243 / 50%)',
    duration: '60 дней',
}, {
    name: 'Holy',
    limit: 1500,
    barColor: 'rgb(33 150 243 / 65%)',
    duration: 'навсегда',
}, {
    name: 'Immortal',
    limit: 5000,
    barColor: 'rgb(33 150 243 / 80%)',
    duration: 'навсегда',
}]

const ranks = {
    "": {
        name: "Игрок",
    },
    "vip": {
        name: "VIP",
        rich: <b style={{ color: "#00BE00" }}>VIP</b>,
    },
    "premium": {
        name: "Premium",
        rich: <b style={{ color: "#00DADA" }}>Premium</b>,
    },
    "holy": {
        name: "Holy",
        rich: <b style={{ color: "#FFBA2D" }}>Holy</b>,
    },
    "immortal": {
        name: "Immortal",
        rich: <b style={{ color: "#E800D5" }}>Immortal</b>,
    },
    "moder": {
        name: "Модератор",
        rich: <b className="text-primary">Модератор</b>,
    },
    "warden": {
        name: "Проверенный модератор",
        rich: <b className="text-primary">Проверенный модератор</b>,
    },
    "chief": {
        name: "Главный модератор",
        rich: <b className="text-primary">Главный модератор</b>,
    },
    "admin": {
        name: "Администратор",
        rich: <b className="text-danger">Администратор</b>,
    },
    "youtube": {
        name: "Ютубер",
        rich: <b className="text-danger">Ютубер</b>,
    },
    "dev": {
        name: "Разработчик",
        rich: <b className="text-primary">Разработчик</b>,
    },
    "builder": {
        name: "Строитель",
        rich: <b className="text-success">Строитель</b>,
    },
    "maplead": {
        name: "Главный строитель",
        rich: <b className="text-success">Главный строитель</b>,
    },
    "srbuilder": {
        name: "Проверенный строитель",
        rich: <b className="text-success">Проверенный строитель</b>,
    },
    "organizer": {
        name: "Организатор",
        rich: <b className="text-primary">Организатор</b>,
    },
}

const exchangeRate = 250

const TableRankComparison = () => {
    const checkOff = <i className="bi bi-check-circle-fill text-secondary opacity-75"></i>
    const checkOn = <i className="bi bi-check-circle-fill text-success"></i>

    return <table className="table">
        <thead className="table-light">
            <tr>
                <th style={{ minWidth: 200 }}></th>
                <th width="120px" style={{ color: "#00BE00" }}>VIP</th>
                <th width="120px" style={{ color: "#00DADA" }}>Premium</th>
                <th width="120px" style={{ color: "#FFBA2D" }}>Holy</th>
                <th width="120px" style={{ color: "#E800D5" }}>Immortal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Количество получаемых коинов</td>
                <td>x<b>2</b></td>
                <td>x<b>3</b></td>
                <td>x<b>4</b></td>
                <td>x<b>5</b></td>
            </tr>
            <tr>
                <td>Приставка перед ником</td>
                <td><b style={{ color: "#00BE00" }}>[V]</b></td>
                <td><b style={{ color: "#00DADA" }}>[P]</b></td>
                <td><b style={{ color: "#FFBA2D" }}>[H]</b></td>
                <td style={{ whiteSpace: 'nowrap' }}><b style={{ color: "#E800D5" }}>
                    [свой]
                    <OverlayTrigger overlay={<Tooltip>
                        Вы сами можете изменять свой префикс с помощью команды
                        <br />
                        <code>/prefix &lt;новый префикс&gt;</code>
                    </Tooltip>}>
                        <i className="bi bi-info-circle ms-2 text-primary"></i>
                    </OverlayTrigger>
                </b></td>
            </tr>
            <tr>
                <td>Шанс выпадения сундуков в играх</td>
                <td>135%</td>
                <td>180%</td>
                <td>230%</td>
                <td>300%</td>
            </tr>
            <tr>
                <td>Количество друзей</td>
                <td>30</td>
                <td>50</td>
                <td>80</td>
                <td>150</td>
            </tr>
            <tr>
                <td>Количество игроков в группе</td>
                <td>6</td>
                <td>7</td>
                <td>8</td>
                <td>10</td>
            </tr>
            <tr>
                <td>Количество ежедневных заданий</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
            </tr>
            <tr>
                <td>Вход на переполненный сервер</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
            </tr>
            <tr>
                <td>Полет в лобби</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
            </tr>
            <tr>
                <td>Просмотр игр</td>
                <td>{checkOff}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
            </tr>
            <tr>
                <td>Создание своей гильдии</td>
                <td>{checkOff}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
            </tr>
            <tr>
                <td>
                    Цветной чат
                    <OverlayTrigger overlay={<Tooltip>
                        <div className="text-start">
                            <div><span style={{ color: "#000000" }} className="bg-secondary">&0</span> - черный</div>
                            <div><span style={{ color: "#0000bf" }} className="bg-secondary">&1</span> - темно-синий</div>
                            <div><span style={{ color: "#00be00" }}>&2</span> - зелёный</div>
                            <div><span style={{ color: "#00bebe" }}>&3</span> - бирюзовый</div>
                            <div><span style={{ color: "#be0000" }}>&4</span> - бордовый</div>
                            <div><span style={{ color: "#be00be" }}>&5</span> - фиолетовый</div>
                            <div><span style={{ color: "#D9A334" }}>&6</span> - оранжевый</div>
                            <div><span style={{ color: "#bebebe" }}>&7</span> - серый</div>
                            <div><span style={{ color: "#3f3f3f" }} className="bg-secondary">&8</span> - темно-серый</div>
                            <div><span style={{ color: "#3f3ffe" }}>&9</span> - синий</div>
                            <div><span style={{ color: "#3ffe3f" }}>&a</span> - салатовый</div>
                            <div><span style={{ color: "#3ffefe" }}>&b</span> - голубой</div>
                            <div><span style={{ color: "#fe3f3f" }}>&c</span> - красный</div>
                            <div><span style={{ color: "#fe3ffe" }}>&d</span> - розовый</div>
                            <div><span style={{ color: "#fefe3f" }}>&e</span> - желтый</div>
                            <div><span style={{ color: "#ffffff" }}>&f</span> - белый</div>
                        </div>
                    </Tooltip>}>
                        <i className="bi bi-info-circle ms-2 text-primary"></i>
                    </OverlayTrigger>
                </td>
                <td>{checkOff}</td>
                <td>{checkOff}</td>
                <td>{checkOff}</td>
                <td>{checkOn}</td>
            </tr>
            <tr>
                <td>Оповещение о заходе в лобби</td>
                <td>{checkOff}</td>
                <td>{checkOff}</td>
                <td>{checkOff}</td>
                <td>{checkOn}</td>
            </tr>
            <tr>
                <td>
                    Создание своих серверов
                    <OverlayTrigger overlay={<Tooltip>
                        С помощью команды
                        <br />
                        <code>/game create</code>
                    </Tooltip>}>
                        <i className="bi bi-info-circle ms-2 text-primary"></i>
                    </OverlayTrigger>
                </td>
                <td>{checkOff}</td>
                <td>{checkOff}</td>
                <td>{checkOff}</td>
                <td>{checkOn}</td>
            </tr>
            <tr>
                <td>Получение удовольствия</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
                <td>{checkOn}</td>
            </tr>
        </tbody>
    </table>
}

const ExchangeCoins = ({ profile }) => {
    const [loading, setLoading] = useState(false)
    const { app, fetchAuth } = useApp()
    const {
        register,
        handleSubmit,
        watch,
        setError,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
    })

    const onSubmit = async data => {
        if (loading)
            return
        setLoading(true)

        fetchApi('/server/minigames/exchange', {
            method: 'POST',
            body: { amount: data.vimers },
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно обменяли ' + ruPluralizeVimers(data.vimers))
                    reset({
                        vimers: null,
                        coins: null,
                    })
                    EventBus.emit(EVENT_MINIGAMES_PROFILE_UPDATED, body.response)
                    fetchAuth()
                } else if (body.response.type == "invalid_amount") {
                    setError('vimers', { message: 'Некорректное количество вимеров' })
                } else if (body.response.type == "insufficient_funds") {
                    setError('vimers', { message: 'У вас недостаточно вимеров' })
                    fetchAuth()
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <form onSubmit={handleSubmit(onSubmit)}>
        <h5 className="mb-3">Обмен вимеров на коины</h5>

        <p>Сумма обменов: <b className="text-success">{ruPluralizeVimers(profile.donated)}</b></p>

        <p>
            Работает система накопления.
            Все обмены суммируются и вы можете получить статус, когда количество ваших обменов достигнет определенной суммы.
        </p>

        <div className="d-flex justify-content-between align-items-center mb-3">
            <Form.Group controlId="vimers">
                <Form.Control
                    {...register("vimers", {
                        required: true,
                        valueAsNumber: true,
                        onChange: () => {
                            setValue('coins', watch("vimers") * exchangeRate, { shouldValidate: true })
                        },
                        validate: val => {
                            if (isNaN(val))
                                return false
                            if (!Number.isInteger(val))
                                return 'Сумма в вимерах должна быть целой'
                            if (val < 1)
                                return 'Минимум 1 вимер'
                            if (val > app.user.cash)
                                return 'У вас недостаточно вимеров'
                        }
                    })}
                    placeholder="Вимеров"
                    autoComplete="off"
                    type="number"
                    isInvalid={!!errors.vimers}
                />
            </Form.Group>

            <i className="bi bi-arrow-right p-2" />

            <Form.Group controlId="coins">
                <Form.Control
                    {...register("coins", {
                        required: true,
                        valueAsNumber: true,
                        onChange: () => {
                            setValue('vimers', watch("coins") / exchangeRate, { shouldValidate: true })
                        },
                        validate: val => {
                            if (isNaN(val))
                                return false
                        }
                    })}
                    placeholder="Коинов"
                    autoComplete="off"
                    type="number"
                    isInvalid={!!errors.coins}
                />
            </Form.Group>
        </div>
        {errors.vimers?.message && <div className="invalid-feedback d-block mt-n3">{errors.vimers.message}</div>}
        <div className="text-end">
            <button className="btn btn-primary" disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Обменять'}
            </button>
        </div>
    </form>
}

const KindnessRowCard = ({ profile }) => {
    const progress = profile.donated / max
    const expireDate = Date.parse(profile.rank_donate_expire)

    const donatedTooltip = <Tooltip>
        Ваш вклад: <b>{profile.donated}</b> {ruPluralizeVimers(profile.donated, false)}
    </Tooltip>

    return <div className='card'>
        <div className="card-header">
            <h4 className="mb-0">Статус на MiniGames</h4>
            <span>Обмен вимеров на коины и получение донатного статуса</span>
        </div>
        <ProgressBar style={{ borderRadius: 0 }}>
            <OverlayTrigger overlay={donatedTooltip}>
                <ProgressBar isChild={true} striped variant="success" now={100 * progress} />
            </OverlayTrigger>
            {segments.map((curr, idx) => {
                const start = Math.max(progress, idx == 0 ? 0 : segments[idx - 1].limit / max)
                const end = curr.limit / max

                if (start >= end)
                    return null

                const tooltip = <Tooltip>
                    {curr.name} <span className="text-success">{ruPluralizeVimers(curr.limit)}</span>
                    {curr.duration && <span className="text-warning"><br /> {curr.duration}</span>}
                </Tooltip>
                return <OverlayTrigger key={idx} overlay={tooltip}>
                    <ProgressBar isChild={true} style={{ backgroundColor: curr.barColor }} now={100 * (end - start)} />
                </OverlayTrigger>
            })}
        </ProgressBar>
        <div className='card-body'>
            <div className="row gy-4">
                <div className="col-lg-6 col-12">
                    <p>
                        Текущий статус: {ranks[profile.rank] ? ranks[profile.rank].rich || ranks[profile.rank].name : profile.rank}
                        {profile.rank_donate && profile.rank_donate == profile.rank && expireDate && <>
                            <br />
                            Действует до: {new Date(expireDate).toLocaleString()}
                        </>}
                    </p>

                    <ul className="list-group list-group-flush">
                        {segments.map((curr, idx) => {
                            const till = curr.duration.startsWith("на") ? curr.duration : "на " + curr.duration
                            const name = ranks[curr.name.toLowerCase()].rich
                            return <li
                                key={idx}
                                className="list-group-item"
                                style={{ borderLeft: "10px solid " + curr.barColor }}
                            >
                                {curr.limit} вимеров - {name} {till}
                            </li>
                        })}
                    </ul>
                </div>
                <div className="col-lg-6 col-12">
                    <ExchangeCoins profile={profile} />
                </div>
            </div>
        </div>
        <div className="card-header">
            <h4>Возможности статусов</h4>
        </div>
        <div className="card-table table-responsive">
            <TableRankComparison />
        </div>
    </div>
}

const MinigamesDonatePage = () => {
    useTitle('Статус на MiniGames')
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState(false)
    const { app } = useApp()

    useEffect(() => {
        setLoading(true)
        setError(false)
        setProfile(null)
        fetchApi('/server/minigames/profile')
            .then(r => r.json())
            .then(body => {
                if (body.success)
                    setProfile(body.response)
                else if (body.error && body.response.type == 'no_profile_exists')
                    setProfile({
                        id: -1,
                        donated: 0,
                        exp: 0,
                        coins: 8000,
                        last_seen: "1970-01-01T03:00:00+03:00",
                        rank: "",
                        rank_donate: "",
                        rank_donate_expire: "1970-01-01T03:00:00+03:00",
                        rank_full: "",
                        username: app.user.username,
                        online: 0,
                    })
                else
                    setError(true)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        return EventBus.on(EVENT_MINIGAMES_PROFILE_UPDATED, update => setProfile(update))
    }, [])

    if (!profile)
        return <div className='card'>
            <div className="card-header">
                <h4 className="mb-0">Статус на MiniGames</h4>
                <span>Обмен вимеров на коины и получение донатного статуса</span>
            </div>
            <div className='card-body'>
                {loading && <div className='text-center'><Spinner variant='secondary' /></div>}
                {error && <div className='text-center text-danger'>При загрузке произошла ошибка</div>}
                {!loading && !error && <div className='text-center text-muted'>Вы еще ни разу не заходили на MiniGames</div>}
            </div>
        </div>

    return <>
        <div className='row mb-4'>
            <div className='col'>
                <KindnessRowCard profile={profile} />
            </div>
        </div>
    </>
}

export default MinigamesDonatePage

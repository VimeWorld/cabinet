import { useMemo, useState } from "react"
import { Form, Spinner } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { BalanceCard } from "../component/BalanceCard"
import { PaymentHistoryCard } from "../component/PaymentHistoryCard"
import useApp from "../hook/useApp"
import { useTitle } from "../hook/useTitle"
import { fetchApi } from "../lib/api"
import { EventBus, EVENT_UPDATE_PAYMENTS } from "../lib/eventbus"
import { ruPluralizeVimers } from "../lib/i18n"
import Notifications from "../lib/notifications"

const TransferCard = () => {
    const { app, fetchAuth } = useApp()
    const {
        register,
        handleSubmit,
        watch,
        setError,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            target: '',
            amount: ''
        }
    })
    const [checkedLogin, setCheckedLogin] = useState({
        login: '',
        error: '',
    })
    const [loading, setLoading] = useState(false)

    const onSubmit = async data => {
        if (loading)
            return

        if (checkedLogin.login == data.target && checkedLogin.error) {
            setError('target', { type: 'custom', message: checkedLogin.error }, { shouldFocus: true })
            return
        }
        setLoading(true)

        try {
            const response = await fetchApi('/payment/transfer', {
                method: 'POST',
                body: {
                    target: data.target,
                    amount: data.amount,
                }
            })
            const body = await response.json()
            if (response.ok) {
                Notifications.success('Вы перевели ' + ruPluralizeVimers(data.amount) + ' игроку ' + data.target)
                reset({ target: '', amount: '' })
                EventBus.emit(EVENT_UPDATE_PAYMENTS)
                fetchAuth()
            } else {
                switch (body.response.type) {
                    case "invalid_target":
                        setError('target', { type: 'custom', message: 'Такого игрока не существует' }, { shouldFocus: true })
                        setCheckedLogin({ login, error: 'Такого игрока не существует' })
                        break
                    case "invalid_target_self":
                        setError('target', { type: 'custom', message: 'Вы не можете переводить себе' }, { shouldFocus: true })
                        setCheckedLogin({ login, error: 'Вы не можете переводить себе' })
                        break
                    case "invalid_amount":
                        setError('amount', { type: 'custom', message: 'Некорректное количество' })
                        break
                    case "insufficient_funds":
                        setError('amount', { type: 'custom', message: 'У вас недостаточно вимеров' })
                        fetchAuth()
                        break
                    default:
                        Notifications.error(body.response.title)
                }
            }
        } catch (e) {
            Notifications.error('Невозможно подключиться к серверу')
        }
        setLoading(false)
    }

    const onTargetBlur = async () => {
        const login = watch('target')
        if (!!errors.target || !login)
            return
        if (checkedLogin.login == login && !checkedLogin.error)
            return
        if (login.toLowerCase() == app.user.username.toLowerCase()) {
            let error = 'Вы не можете переводить себе'
            setError('target', { type: 'custom', message: error })
            setCheckedLogin({ login, error })
            return
        }

        let error = ''
        try {
            const response = await fetchApi('/user?name=' + login)
            if (response.ok) {
                const body = await response.json()
                if (!body.response.exists)
                    error = 'Такого игрока не существует'
            } else {
                error = 'Ошибка сервера, невозможно проверить существование игрока'
            }
        } catch {
            error = 'Сетевая ошибка, невозможно проверить существование игрока'
        }
        if (error)
            setError('target', { type: 'custom', message: error })
        setCheckedLogin({ login, error })
    }

    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Перевод игроку</h4>
            <span>Вы можете перевести вимеры любому игроку</span>
        </div>
        <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3" controlId="target">
                    <Form.Control
                        {...register("target", {
                            required: true,
                            onBlur: onTargetBlur,
                        })}
                        placeholder="Игрок"
                        isInvalid={!!errors.target}
                        isValid={checkedLogin.login && !checkedLogin.error && checkedLogin.login == watch('target')}
                    />
                    {errors.target && <Form.Control.Feedback type="invalid">{errors.target.message}</Form.Control.Feedback>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="amount">
                    <Form.Control
                        {...register("amount", {
                            required: true,
                            min: 1,
                            valueAsNumber: true,
                            validate: val => {
                                if (isNaN(val))
                                    return false
                                if (!Number.isInteger(val))
                                    return 'Можно передавать только целое количество'
                                if (val > app.user.cash)
                                    return 'У вас недостаточно вимеров'
                            }
                        })}
                        autoComplete="off"
                        type="number"
                        placeholder="Количество"
                        isInvalid={!!errors.amount}
                    />
                    {errors.amount && <Form.Control.Feedback type="invalid">{errors.amount.message}</Form.Control.Feedback>}
                </Form.Group>
                <div className="text-end">
                    <button className="btn btn-primary" disabled={loading}>
                        {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                        {loading ? ' Загрузка...' : 'Перевести'}
                    </button>
                </div>
            </form>
        </div>
    </div>
}

const logos = {
    visa: <img className="px-3" height="32px" src="/assets/image/paysystem/Visa_Brandmark_Blue_RGB_2021.png" />,
    mastercard: <img className="px-3" height="32px" src="/assets/image/paysystem/mastercard-securecode.png" />,
    googlepay: <img height="58px" src="/assets/image/paysystem/google-pay-mark_800.svg" />,
    iomoney: <img className="px-3" height="32px" src="/assets/image/paysystem/iomoney.svg" />,
    mir: <img className="px-3" height="32px" src="/assets/image/paysystem/mir.png" />,
}

const paysystems = [
    {
        id: 'fondy',
        description: '(Visa / Mastercard / Google Pay / Apple Pay)',
        img: <img src="/assets/image/paysystem/fondy.svg" height="32px" />,
        logos: ['visa', 'mastercard', 'googlepay'],
        filter: user => user.client_country != 'RU',
        filterMsg: 'Недоступно в РФ',
    },
    {
        id: 'interkassa',
        description: '(Криптовалюты, Perfect Money, AdvCash)',
        img: <img src="/assets/image/paysystem/interkassa.png" height="32px" />,
        logos: [],
    },
    {
        id: 'unitpay',
        description: '(Yandex Pay)',
        img: <img src="/assets/image/paysystem/unitpay.svg" height="32px" />,
        logos: ['iomoney', 'mir'],
        filter: user => user.client_country == 'RU',
        filterMsg: 'Только для РФ',
    },
]

const PaysystemListElement = ({ paysystem, checked, onChange, filterMsg = false }) => {
    return <li className="list-group-item px-0 py-3">
        <div className="form-check">
            <input
                type="radio"
                id={paysystem.id}
                name="paysystem"
                className="form-check-input"
                checked={checked}
                onChange={onChange}
            />
            <label className="form-check-label w-100" htmlFor={paysystem.id}>
                <div className="d-flex justify-content-between align-items-center">
                    {paysystem.img}
                    {filterMsg && <span className="badge bg-light text-muted">{paysystem.filterMsg}</span>}
                </div>
                <div>{paysystem.description}</div>
            </label>
        </div>
    </li>
}

const PayCard = () => {
    const { app } = useApp()
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [showHidden, setShowHidden] = useState(false)

    const [psVisible, logoList, psHidden] = useMemo(() => {
        const psVisible = paysystems.filter(p => !p.filter || p.filter(app.user))
        const logoList = new Set([].concat(...psVisible.map(p => p.logos)))
        const psHidden = paysystems.filter(p => !psVisible.find(p0 => p0.id == p.id))
        return [psVisible, logoList, psHidden]
    })
    const [paysystem, setPaysystem] = useState(psVisible[0].id)

    const onSubmit = e => {
        e.preventDefault()
        if (loading) return
        setLoading(true)

        fetchApi('/payment/purchase', {
            method: 'POST',
            body: {
                method: paysystem,
                amount: parseInt(amount),
            }
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    if (body.response.method == 'url') {
                        window.location.href = body.response.data
                    } else if (body.response.method == 'post') {
                        const data = body.response.data
                        const form = document.createElement('form')
                        form.style.visibility = 'hidden'
                        form.method = 'POST'
                        form.action = data.url
                        for (let key in data.params) {
                            const input = document.createElement('input')
                            input.name = key
                            input.value = data.params[key]
                            form.appendChild(input)
                        }
                        document.body.appendChild(form)
                        form.submit()
                        document.body.removeChild(form)
                    }
                } else {
                    switch (body.response.type) {
                        case "invalid_method":
                            Notifications.error('Выбранный метод оплаты не поддерживается')
                            break
                        case "invalid_amount":
                            Notifications.error('Некорректная сумма пополнения')
                            break
                        default:
                            Notifications.error('Ошибка сервера, попробуйте позже')

                    }
                }
            })
            .catch(e => Notifications.error('Невозможно подключиться к серверу' + e))
            .finally(() => setLoading(false))
    }

    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Пополнение счета</h4>
            <span>Вы можете пополнить свой счет на любое количество вимеров</span>
        </div>
        <div className="card-body">
            <form onSubmit={onSubmit} className="mb-3">
                <div className="d-flex mb-3">
                    <input
                        className="form-control"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        autoComplete="off"
                        placeholder="Количество"
                        required
                        min="1"
                        max="500000"
                    />
                    <button className="btn btn-primary ms-3" type="submit" disabled={loading}>
                        {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                        {!loading && 'Пополнить'}
                    </button>
                </div>
                <ul className="list-group list-group-flush">
                    {psVisible.map(e => {
                        return <PaysystemListElement
                            key={e.id}
                            paysystem={e}
                            checked={paysystem == e.id}
                            onChange={() => setPaysystem(e.id)}
                        />
                    })}

                    {showHidden && psHidden.length > 0 && psHidden.map(e => {
                        return <PaysystemListElement
                            key={e.id}
                            paysystem={e}
                            checked={paysystem == e.id}
                            onChange={() => setPaysystem(e.id)}
                            filterMsg={true}
                        />
                    })}
                </ul>

                {psHidden.length > 0 && <div
                    role="button"
                    className="text-muted text-center"
                    onClick={e => {
                        setShowHidden(!showHidden);
                        e.preventDefault();
                        return false;
                    }}
                >
                    {showHidden
                        ? <>Скрыть недоступные<i className="ms-1 bi bi-chevron-up" /></>
                        : <>Показать недоступные<i className="ms-1 bi bi-chevron-down" /></>
                    }
                </div>}

            </form>
            <div className="text-center opacity-25">
                {Array.from(logoList).map(e => {
                    return <span key={e}>{logos[e]}</span>
                })}
            </div>
        </div>
    </div>
}

const PaymentsPage = () => {
    useTitle('Платежи')
    return <>
        <div className="row mb-4 gy-4">
            <div className="col-lg-6 col-12">
                <PayCard />
            </div>

            <div className="col-lg-6 col-12">
                <div className="mb-4">
                    <BalanceCard />
                </div>
                <TransferCard />
            </div>
        </div>
        <div className="row mb-4">
            <div className="col">
                <PaymentHistoryCard />
            </div>
        </div>
    </>
}

export default PaymentsPage

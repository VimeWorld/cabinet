import { Fragment, useEffect, useMemo, useState } from "react"
import { Form, OverlayTrigger, Placeholder, Popover, Spinner, Tooltip } from "react-bootstrap"
import { useForm } from "react-hook-form"
import { BalanceCard } from "../component/BalanceCard"
import { PaymentHistoryCard } from "../component/PaymentHistoryCard"
import useApp from "../hook/useApp"
import { useTitle } from "../hook/useTitle"
import { fetchApi } from "../lib/api"
import { EventBus, EVENT_UPDATE_PAYMENTS } from "../lib/eventbus"
import { ruPluralizeVimers, ruPluralize } from "../lib/i18n"
import Notifications from "../lib/notifications"
import { ConfirmModal } from "../component/ConfirmModal"
import './Payments.css'

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

        if (checkedLogin.login === data.target && checkedLogin.error) {
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
                        setCheckedLogin({ login: data.target, error: 'Такого игрока не существует' })
                        break
                    case "invalid_target_self":
                        setError('target', { type: 'custom', message: 'Вы не можете переводить себе' }, { shouldFocus: true })
                        setCheckedLogin({ login: data.target, error: 'Вы не можете переводить себе' })
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
        if (checkedLogin.login === login && !checkedLogin.error)
            return
        if (login.toLowerCase() === app.user.username.toLowerCase()) {
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
                        isValid={checkedLogin.login && !checkedLogin.error && checkedLogin.login === watch('target')}
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
                        min="1"
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

const ThemedPaysystemImage = ({ img, dark, light, ...props }) => {
    const { app } = useApp()

    if (app.theme === 'light' && light) img = light
    if (app.theme === 'dark' && dark) img = dark

    if (!props.height)
        props.height = "32px"

    return <img src={`/assets/image/paysystem/${img}`} {...props} />
}

const SmallPaysystemImage = ({ img, dark, light }) => {
    const { app } = useApp()

    if (app.theme === 'light' && light) img = light
    if (app.theme === 'dark' && dark) img = dark

    return <img src={`/assets/image/paysystem/${img}`} style={{ height: '16px', width: 'auto' }} />
}

const logos = {
    visa: <ThemedPaysystemImage img="Visa_Brandmark_Blue_RGB_2021.png" />,
    mastercard: <ThemedPaysystemImage img="mastercard-securecode.png" />,
    googlepay: <ThemedPaysystemImage img="google-pay.svg" />,
    iomoney: <ThemedPaysystemImage img="iomoney.svg" />,
    mir: <ThemedPaysystemImage img="mir.svg" />,
    sbp: <ThemedPaysystemImage img="sbp-light.svg" dark="sbp-dark.svg" />,
}

const smallLogos = {
    visa: <SmallPaysystemImage img="Visa_Brandmark_Blue_RGB_2021.png" />,
    mastercard: <SmallPaysystemImage img="mastercard-securecode.png" />,
    mir: <SmallPaysystemImage img="mir.svg" />,
    tinkoff: <SmallPaysystemImage img="tinkoff.svg" dark="tinkoff-dark.svg" />,
}

const paysystems = [
    {
        id: 'fondy',
        description: 'Visa / Mastercard, Google Pay / Apple Pay',
        img: <ThemedPaysystemImage img="fondy-main-light.svg" dark="fondy-main-dark.svg" />,
        logos: ['visa', 'mastercard', 'googlepay'],
        filter: {
            test: user => !['RU', 'BY'].includes(user.client_country),
            message: 'Недоступно в РФ и Беларуси',
        },
    },
    {
        id: 'unitpay',
        description: 'Банковская карта, Yandex Pay',
        img: <ThemedPaysystemImage img="unitpay.svg" dark="unitpay-dark.svg" />,
        logos: ['visa', 'mastercard', 'mir'],
        filter: {
            test: user => ['RU', 'BY'].includes(user.client_country),
            message: 'Для РФ и Беларуси',
        },
    },
    {
        id: 'paypalych',
        description: 'Зарубежные банковские карты, СБП',
        img: <ThemedPaysystemImage img="paypalych-light.svg" dark="paypalych-dark.svg" />,
        logos: ['sbp'],
        filter: {
            test: user => !['BY', 'UA', 'PL'].includes(user.client_country),
            message: 'Недоступно в Беларуси, Украине и Польше',
        },
    },
    {
        id: 'paypalychua',
        description: 'Украинские банковские карты (минимум 1000 вим)',
        img: <ThemedPaysystemImage img="paypalych-light.svg" dark="paypalych-dark.svg" />,
        logos: ['sbp'],
        filter: {
            test: user => ['UA'].includes(user.client_country),
            message: 'Доступно только в Украине',
        },
    },
    {
        id: 'cryptomus',
        description: 'Криптовалюты',
        img: <ThemedPaysystemImage img="cryptomus-light.svg" dark="cryptomus-dark.svg" />,
        logos: [],
    },
    {
        id: 'tome',
        description: 'Банковская карта, СБП',
        img: <ThemedPaysystemImage img="tome-light.svg" dark="tome-dark.svg" />,
        logos: ['visa', 'mastercard'],
    },
    {
        id: 'enot',
        description: '(Visa / Mastercard, ЮMoney, Криптовалюты)',
        img: <ThemedPaysystemImage img="enot-light.svg" dark="enot-dark.svg" />,
        logos: ['visa', 'mastercard', 'mir'],
        filter: {
            test: user => ['RU', 'BY'].includes(user.client_country),
            message: 'Для РФ и Беларуси',
        },
    },
    {
        id: 'freekassa',
        description: 'Банковская карта P2P от 1000 вим, ЮMoney, Steam',
        img: <ThemedPaysystemImage img="freekassa-light.svg" dark="freekassa-dark.svg" />,
        logos: ['visa', 'mastercard', 'mir'],
        filter: {
            test: user => ['RU', 'UA'].includes(user.client_country),
            message: 'Для Украины и РФ',
        },
    },
    {
        id: 'tebex',
        description: 'Банковская карта, Google Pay, Apple Pay, PayPal',
        img: <ThemedPaysystemImage img="tebex-light.svg" dark="tebex-dark.svg" />,
        logos: ['visa', 'mastercard', 'googlepay'],
        filter: {
            test: user => !['RU', 'BY'].includes(user.client_country),
            message: 'Недоступно в РФ и Беларуси',
        },
    },
    {
        id: 'stripe',
        description: 'Банковская карта, Google Pay, Apple Pay',
        img: <ThemedPaysystemImage img="stripe.svg" dark="stripe.svg" />,
        logos: ['visa', 'mastercard', 'googlepay'],
        filter: {
            test: user => !['RU', 'BY'].includes(user.client_country),
            message: 'Недоступно в РФ и Беларуси',
        },
    },
    {
        id: 'tinkoff',
        description: 'Банковская карта, СБП, Yandex Pay, Mir Pay',
        img: <ThemedPaysystemImage img="tinkoff.svg" dark="tinkoff-dark.svg" />,
        logos: ['visa', 'mastercard', 'mir', 'sbp'],
        filter: {
            test: user => ['RU', 'BY'].includes(user.client_country),
            message: 'Для РФ и Беларуси',
        },
    },
    {
        id: "dolyame",
        description: "Оплатите 25% от стоимости покупки, а оставшиеся 3 части спишутся автоматически с шагом в две недели. Без процентов и комиссий, как обычная оплата картой",
        img: <ThemedPaysystemImage img="dolyami-logo-black.svg" dark="dolyami-logo-white.svg" />,
        logos: ['visa', 'mastercard', 'mir', 'sbp'],
        filter: {
            test: user => ['RU', 'BY'].includes(user.client_country),
            message: 'Для РФ и Беларуси',
        },
    },
    {
        id: 'paypal',
        description: 'PayPal, Банковская карта, Google Pay',
        img: <ThemedPaysystemImage img="paypal.svg" dark="paypal.svg" />,
        logos: ['visa', 'mastercard', 'googlepay'],
        filter: {
            test: user => !['RU', 'BY'].includes(user.client_country),
            message: 'Недоступно в РФ и Беларуси',
        },
    },
]

const bonusRewards = [
    {
        from: 25000,
        rewardPercents: 15
    },
    {
        from: 15000,
        rewardPercents: 11
    },
    {
        from: 7000,
        rewardPercents: 9
    },
    {
        from: 3000,
        rewardPercents: 7
    },
    {
        from: 1000,
        rewardPercents: 6
    },
    {
        from: 500,
        rewardPercents: 5
    }
]

const PaysystemListElement = ({ paysystem, checked, onChange }) => {
    const { app } = useApp()
    const filtered = paysystem.filter && !paysystem.filter.test(app.user)

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
            <label className="form-check-label w-100 stretched-link" htmlFor={paysystem.id}>
                <div className="d-flex justify-content-between align-items-center">
                    {paysystem.img}
                    {filtered && <span className="badge bg-tertiary text-body-secondary">
                        {paysystem.filter.message}
                    </span>}
                </div>
                <div>{paysystem.description}</div>
            </label>
        </div>
    </li>
}

const PriceCalculator = ({ amount }) => {
    const [rates, setRates] = useState(null)
    const [error, setError] = useState(false)
    useEffect(() => {
        fetchApi('/payment/rates')
            .then(response => response.json())
            .then(body => {
                if (body.success)
                    setRates(body.response.rates)
                else
                    setError(true)
            })
            .catch(() => setError(true))
    }, [])

    amount = Math.min(Math.max(1, amount), 1500000)

    const Currency = ({ id, name }) => {
        if (!rates)
            return <li><Placeholder style={{ width: 40 }} /> {name}</li>
        if (!(id in rates))
            return <li className="text-danger">Not found: {id}</li>
        return <div>~ {(amount * rates[id]).toFixed(2)} {name}</div>
    }

    return <>
        <Popover.Header>{ruPluralizeVimers(amount)}</Popover.Header>
        <Popover.Body>
            {error && rates == null && <div className="text-danger text-center">Ошибка сервера</div>}
            {!error && <>
                <Currency id="RUB" name="руб." />
                <Currency id="UAH" name="грн." />
                <Currency id="USD" name="$" />
                <Currency id="EUR" name="€" />
                <div className="pt-2">Стоимость 85 вимеров = 1 евро</div>
            </>}
        </Popover.Body>
    </>
}

const SavedCard = ({ card, selected, onSelect, onDelete }) => {
    const { app } = useApp()
    const cardType = card.type.toLowerCase()
    const cardLogo = cardType === 'мир' ? smallLogos.mir : smallLogos[cardType]
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleDelete = async () => {
        try {
            const response = await fetchApi('/payment/saved_card_delete', {
                method: 'POST',
                body: {
                    card_id: card.id
                }
            })
            const body = await response.json()
            if (body.success && body.response.status === 'D') {
                Notifications.success('Карта успешно удалена')
                onDelete(card.id)
            } else {
                Notifications.error(body.response.title || 'Ошибка при удалении карты')
            }
        } catch (e) {
            Notifications.error('Невозможно подключиться к серверу')
        }
        setShowDeleteConfirm(false)
    }

    return (
        <div className="saved-card col-6 col-md-4 px-2">
            <div 
                className="card h-100" 
                style={{ 
                    background: 'linear-gradient(45deg, #3D3D3D, #434343, #373737)',
                    aspectRatio: '168/109',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderColor: selected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'border-color 0.2s ease-in-out',
                    cursor: 'pointer'
                }}
                onClick={() => onSelect(card)}
            >
                <div className="card-body p-2 p-md-2 d-flex flex-column justify-content-between position-relative">
                    <div className="d-flex justify-content-between align-items-start">
                        <div style={{ maxWidth: '20%', opacity: 0.8 }}>{smallLogos.tinkoff}</div>
                        <button 
                            className="btn btn-link btn-sm text-white p-0" 
                            style={{ opacity: 0.7 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(true)
                            }}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <div className="d-flex justify-content-start align-items-end">
                        <div className="text-white">
                            <div className="small">{card.last4}</div>
                        </div>
                    </div>
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '8px', 
                        right: '28px', 
                        maxWidth: '20%', 
                        opacity: 0.8 
                    }}>{cardLogo}</div>
                </div>
            </div>
            <ConfirmModal 
                show={showDeleteConfirm} 
                close={() => setShowDeleteConfirm(false)}
                confirmText="Удалить"
                cancelText="Отмена"
                title="Удаление карты"
                onConfirm={handleDelete}
            >
                <p>Вы уверены, что хотите удалить карту {card.last4}?</p>
            </ConfirmModal>
        </div>
    )
}

const SavedCards = ({ selectedCard, onSelectCard, savedCards, onCardDelete }) => {
    if (savedCards.length === 0) return null

    return (
        <div className="mb-3">
            <div className="row g-3">
                {savedCards.map(card => (
                    <SavedCard 
                        key={card.id} 
                        card={card} 
                        selected={selectedCard?.id === card.id}
                        onSelect={onSelectCard}
                        onDelete={onCardDelete}
                    />
                ))}
            </div>
        </div>
    )
}

const PayCard = ({alfaLink}) => {
    const { app, fetchAuth } = useApp()
    const [amount, setAmount] = useState('')
    const [amountBonuses, setAmountBonuses] = useState(0);
    const [amountAlfa, setAmountAlfa] = useState(0);
    const [bonusesTip, setBonusesTip] = useState(undefined);
    const [loading, setLoading] = useState(false)
    const [showHidden, setShowHidden] = useState(false)
    const [showConfirmBuy, setShowConfirmBuy] = useState(false)
    const [paypalButtons, setPayPalButtons] = useState(undefined)
    
    // Parse URL parameters for auto-payment
    const [autoPaymentParams] = useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            action: urlParams.get('action'),
            system: urlParams.get('system'),
            sum: urlParams.get('sum'),
            username: urlParams.get('username')
        };
    });
    const [saveCard, setSaveCard] = useState(true)
    const [selectedCard, setSelectedCard] = useState(null)
    const [savedCards, setSavedCards] = useState([])

    useEffect(() => {
        // Fetch saved cards when component mounts
        fetchApi('/payment/saved_cards')
            .then(r => r.json())
            .then(body => {
                if (body.response) {
                    const cards = body.response.cards.map(card => ({
                        id: card.card_id,
                        type: card.pan.startsWith('4') ? 'Visa' : 
                            card.pan.startsWith('5') ? 'Mastercard' : 
                            card.pan.startsWith('2') ? 'МИР' : 'Unknown',
                        last4: card.pan.slice(-4)
                    }))
                    setSavedCards(cards)
                    if (cards.length > 0) {
                        setSelectedCard(cards[0])
                        setPaysystem(`tinkoff_${cards[0].card_id}`)
                    }
                }
            })
            .catch(() => Notifications.error('Невозможно загрузить сохраненные карты'))
    }, [])

    useEffect(() => {
        setAmountBonuses(getBonusReward(Number(amount)));
        setAmountAlfa(parseInt(Number(amount) * 0.15, 10));
        setBonusesTip(getTip(Number(amount)));
    }, [amount]);
    
    useEffect(() => {
        if (paypalButtons) {
            paypalButtons.render('#paypal-buttons')
        }
    }, [paypalButtons])

    // Auto-payment effect
    useEffect(() => {
        if (autoPaymentParams.action === 'pay' && autoPaymentParams.system === 'paypal' && autoPaymentParams.sum) {
            // Check username parameter if provided
            if (autoPaymentParams.username && autoPaymentParams.username !== app.user.username) {
                Notifications.error(`Вам необходимо авторизоваться под аккаунтом ${autoPaymentParams.username}`);
                return;
            }
            
            const sum = parseInt(autoPaymentParams.sum);
            if (sum > 0 && sum <= 1500000) {
                setAmount(sum.toString());
                // Set PayPal as selected payment system
                const paypalSystem = paysystems.find(p => p.id === 'paypal');
                if (paypalSystem) {
                    setPaysystem('paypal');
                    // Trigger payment after a short delay to ensure form is ready
                    setTimeout(() => {
                        handleAutoPayment(sum);
                    }, 500);
                }
            }
        }
    }, [autoPaymentParams, app.user.username]);

    const handleAutoPayment = async (sum) => {
        if (loading) return;
        setLoading(true);

        try {
            const response = await fetchApi('/payment/purchase', {
                method: 'POST',
                body: {
                    method: 'paypal',
                    amount: sum,
                }
            });
            
            const body = await response.json();
            if (body.success && body.response.method === 'paypal') {
                const data = body.response.data;
                if (paypal && paypal.Buttons) {
                    setShowConfirmBuy(true);
                    const buttonsContainer = document.getElementById('paypal-buttons');
                    if (buttonsContainer) {
                        buttonsContainer.innerHTML = '';
                    }
                    const buttonsComponent = paypal.Buttons({
                        style: {
                            tagline: false,
                            height: 40,
                        },
                        createOrder: async () => {
                            return data.paypal_order_id;
                        },
                        onApprove: async (paypalData, actions) => {
                            try {
                                const captureResult = await (await fetchApi('/payment/paypal/capture', {
                                    method: 'POST',
                                    body: {
                                        order_id: data.order_id,
                                        paypal_order: data.paypal_order_id,
                                    }
                                })).json();

                                if (captureResult.success) {
                                    Notifications.success('Вы успешно пополнили баланс, ожидайте до 5-и минут');
                                    // Clear URL parameters after successful payment
                                    window.history.replaceState({}, document.title, window.location.pathname);
                                } else {
                                    Notifications.error('При пополнении произошла ошибка');
                                }
                                setShowConfirmBuy(false);
                            } catch (error) {
                                console.error('Error during onApprove for one-time purchase:', error);
                            }
                        },
                        onError: (error) => {
                            console.error('Error during PayPal payment:', error);
                            Notifications.error('Ошибка сервера, попробуйте позже');
                            setShowConfirmBuy(false);
                        },
                    });
                    setPayPalButtons(buttonsComponent);
                }
            } else {
                Notifications.error('Ошибка при создании платежа');
            }
        } catch (e) {
            Notifications.error('Невозможно подключиться к серверу');
        }
        setLoading(false);
    };

    const [psVisible, logoList, hasHidden] = useMemo(() => {
        // Список и порядок определяется сервером
        const list = app.user.config.payment_methods.map(name => {
            return paysystems.find(p => p.id === name)
        }).filter(p => p)

        const psVisible = list.filter(p => !p.filter || p.filter.test(app.user))
        const hasHidden = list.length !== psVisible.length
        if (showHidden)
            list.filter(p => !psVisible.find(p0 => p0.id === p.id))
                .forEach(p => psVisible.push(p))
        const logoList = new Set([].concat(...psVisible.map(p => p.logos)))
        return [psVisible, logoList, hasHidden]
    }, [showHidden])
    const [paysystem, setPaysystem] = useState(psVisible[0]?.id || '')

    const handleCardSelect = (card) => {
        setSelectedCard(card)
        setPaysystem(`tinkoff_${card.id}`)
    }

    const handlePaysystemSelect = (paysystemId) => {
        setPaysystem(paysystemId)
        if (!paysystemId.startsWith('tinkoff_')) {
            setSelectedCard(null)
        }
    }

    const handleCardDelete = (cardId) => {
        setSavedCards(cards => cards.filter(card => card.id !== cardId))
        if (selectedCard?.id === cardId) {
            setSelectedCard(null)
            setPaysystem(psVisible[0].id)
        }
    }

    const onSubmit = e => {
        e.preventDefault()
        if (loading) return
        setLoading(true)

        // Check if we're using a saved card
        if (paysystem.startsWith('tinkoff_')) {
            const cardId = selectedCard?.id
            if (!cardId) {
                Notifications.error('Карта не выбрана')
                setLoading(false)
                return
            }
            fetchApi('/payment/saved_card_charge', {
                method: 'POST',
                body: {
                    card_id: cardId,
                    amount: parseInt(amount)
                }
            }).then(r => r.json())
                .then(body => {
                    if (body.success) {
                        if (body.response.status === 'CONFIRMED') {
                            Notifications.success('Оплата прошла успешно')
                            setTimeout(() => {
                                EventBus.emit(EVENT_UPDATE_PAYMENTS)
                                fetchAuth()
                            }, 1500)
                        } else if (body.response.status === 'REJECTED') {
                            Notifications.error('Оплата была отклонена')
                        }
                    } else {
                        Notifications.error(body.response.title || 'Ошибка при оплате')
                    }
                })
                .catch(e => Notifications.error('Невозможно подключиться к серверу'))
                .finally(() => {
                    setLoading(false)
                    setAmount('')
                })
            return
        }

        // Regular payment flow for non-saved cards
        fetchApi('/payment/purchase', {
            method: 'POST',
            body: {
                method: paysystem,
                amount: parseInt(amount),
                save_card: saveCard
            }
        }).then(r => r.json())
            .then(async body => {
                if (body.success) {
                    if (body.response.method === 'url') {
                        window.location.href = body.response.data
                    } else if (body.response.method === 'post') {
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
                    } else if (body.response.method == 'paypal') {
                        const data = body.response.data
                        if (paypal && paypal.Buttons) {
                            setShowConfirmBuy(true)
                            const buttonsContainer = document.getElementById('paypal-buttons');
                            if (buttonsContainer) {
                              buttonsContainer.innerHTML = '';
                            }
                            const buttonsComponent = paypal.Buttons({
                                style: {
                                  tagline: false,
                                  height: 40,
                                },
                                createOrder: async () => {
                                      return data.paypal_order_id;
                                },
                                onApprove: async (paypalData, actions) => {
                                    try {
                                      const captureResult = await (await fetchApi('/payment/paypal/capture', {
                                          method: 'POST',
                                          body: {
                                                order_id: data.order_id,
                                                paypal_order: data.paypal_order_id,
                                          }
                                      })).json()
                  
                                      if (captureResult.success) {
                                        Notifications.success('Вы успешно пополнили баланс, ожидайте до 5-и минут')
                                      } else {
                                        Notifications.error('При пополнении произошла ошибка')
                                      }
                                      setShowConfirmBuy(false)
                                    } catch (error) {
                                      console.error('Error during onApprove for one-time purchase:', error);
                                    }
                                },
                                onError: (error) => {
                                  console.error('Error during PayPal payment:', error);
                                  Notifications.error('Ошибка сервера, попробуйте позже')
                                  setShowConfirmBuy(false)
                                },
                              });
                            setPayPalButtons(buttonsComponent);
                        }
                    }
                } else {
                    switch (body.response.type) {
                        case "invalid_method":
                            Notifications.error('Выбранный метод оплаты не поддерживается')
                            break
                        case "invalid_amount":
                            if (paysystem === 'paypalych' && amount < 15)
                                Notifications.error('Минимальная сумма пополнения PayPalych - 15 вимеров')
                            else
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
                <div className="d-flex gap-2 mb-3">
                    <input
                        className="form-control"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        autoComplete="off"
                        placeholder="Количество"
                        required
                        min="1"
                        max="1500000"
                    />
                    <OverlayTrigger trigger="click" overlay={<Popover id="vimer-rate">
                        <PriceCalculator amount={amount} />
                    </Popover>}>
                        <button type="button" className="btn btn-link px-2"><i className="bi bi-currency-exchange" /></button>
                    </OverlayTrigger>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                        {!loading && 'Пополнить'}
                    </button>
                </div>
                <div className="d-flex gap-2 mb-1">
                    <span style={{ "color": "#faa700" }}>+{amountBonuses} {ruPluralize(amountBonuses, ['бонусный вимер', 'бонусных вимера', 'бонусных вимеров'], false)}</span><OverlayTrigger overlay={<Tooltip>
                        За пополнения вы бесплатно получаете бонусные вимеры<br />{bonusRewards.map(reward => (<>от <b className="text-success">{reward.from}</b> вимеров <b style={{ "color": "#faa700" }}>+{reward.rewardPercents}%</b><br /></>))}
                    </Tooltip>}>
                        <i className="bi bi-info-circle ms-2 text-primary"></i>
                    </OverlayTrigger>
                </div>
                <div className="d-flex gap-2 mb-1">{bonusesTip}</div>
                <SavedCards 
                    selectedCard={selectedCard} 
                    onSelectCard={handleCardSelect} 
                    savedCards={savedCards}
                    onCardDelete={handleCardDelete}
                />
                <Form.Check 
                    type="switch"
                    id="save-card-switch"
                    label={<>
                        Запомнить карту. Это безопасно. Сохраняя карту, вы соглашаетесь с <a href="https://vimeworld.com/link_card">Условиями привязки карты</a>
                    </>}
                    className="mb-3"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                />
                <ul className="list-group list-group-flush">
                    {psVisible.map(e => {
                        return <PaysystemListElement
                            key={e.id}
                            paysystem={e}
                            checked={paysystem === e.id}
                            onChange={() => handlePaysystemSelect(e.id)}
                        />
                    })}
                </ul>

                {hasHidden && <div
                    role="button"
                    className="text-body-secondary text-center"
                    onClick={e => {
                        setShowHidden(!showHidden)
                        e.preventDefault()
                        return false
                    }}
                >
                    {showHidden
                        ? <>Скрыть недоступные<i className="ms-1 bi bi-chevron-up" /></>
                        : <>Показать недоступные<i className="ms-1 bi bi-chevron-down" /></>
                    }
                </div>}

            </form>
            <div style={{ opacity: 0.3 }} className="d-flex flex-wrap justify-content-center gap-3">
                {Array.from(logoList).map(e => {
                    return <Fragment key={e}>{logos[e]}</Fragment>
                })}
            </div>
            <ConfirmModal show={showConfirmBuy} close={() => setShowConfirmBuy(false)}
                confirmText={undefined}
                cancelText={undefined}
                title="Оплата PayPal"
            >
                <div id="paypal-buttons" className="card-body" style={{ position: "relative", zIndex: 0, backgroundColor: 'white', padding: '5px', borderRadius: '5px' }}></div>
            </ConfirmModal>
        </div>
    </div>
}

export const AlfaBankBanner = ({alfaLink}) => {
    return <div className="card">
            <a href="https://forum.vimeworld.com/topic/1349397-условия-акции-мир-выгод-с-альфа-картой/#comment-7099693">Условия акции</a>
            <div className="img-container">
                <a href={alfaLink}>
                    <img src={"/assets/image/alfa_banner.png"} className="img-fluid rounded" />
                    <div class="btn-arrow">
                        <svg viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg" width="5" height="8" style={{height: '32px', width: 'auto'}}>
                                <g clip-path="url(#clip0_6913_1829)">
                                    <path d="M0 8V7.00244H0.997559V6.00049H1.99951V5.00293H2.99707V3.00342H1.99951V2.00146H0.997559V1.00391H0V0.00195312H1.99951V1.00391H2.99707V2.00146H3.99902V3.00342H4.99658V5.00293H3.99902V6.00049H2.99707V7.00244H1.99951V8H0Z" fill="#ffffff"></path>
                                </g>
                                <defs>
                                    <clipPath id="clip0_6913_1829">
                                        <rect width="5" height="8" fill="white"></rect>
                                    </clipPath>
                                </defs>
                            </svg>    
                    </div>
                </a>
            </div>
        </div>
}

export function getBonusReward(amount) {
    let reward = bonusRewards.find(reward => amount >= reward.from);
    if (!reward) {
        return 0;
    }
    return Math.ceil(amount * (reward.rewardPercents / 100.0));
}

export function getTip(amount) {
    let nextReward = undefined;
    for (let i = 0; i < bonusRewards.length; i++) {
        let reward = bonusRewards[i];
        if (amount >= reward.from) {
            if (i <= 0) {
                return undefined;
            }
            nextReward = bonusRewards[i - 1];
            break;
        }
    }
    if (!nextReward) {
        nextReward = bonusRewards[bonusRewards.length - 1];
    }
    return <><span>Пополните баланс ещё на <b className="text-success">{ruPluralizeVimers(nextReward.from - amount)}</b> чтобы получить награду в <span style={{ "color": "#faa700" }}>{ruPluralize(Math.ceil(nextReward.from * (nextReward.rewardPercents / 100)), ['бонусный вимер', 'бонусных вимера', 'бонусных вимеров'])}</span></span></>;
}

const PaymentsPage = () => {
    const [alfaLink, setAlfaLink] = useState(undefined)
    useEffect(() => {
        fetchApi('/user/alfa_link', {
            method: 'GET'
        }).then(r => r.json()).then(body => {
            if (body.success) {
                setAlfaLink(body.response.link);
            }
        });
    }, []);
    useTitle('Платежи')
    return <>
        <div className="row mb-4 gy-4">
            <div className="col-lg-6 col-12">
                <PayCard alfaLink={alfaLink} />
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

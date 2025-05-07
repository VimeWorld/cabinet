import { Spinner } from "react-bootstrap"
import useMinigamesProfile from "../hook/userMinigamesProfile"
import { ruPluralize, ruPluralizeVimers } from "../lib/i18n"
import { useState } from "react"
import { ConfirmModal } from "../component/ConfirmModal"
import useApp from "../hook/useApp"
import { useNavigate } from "react-router-dom"
import { fetchApi } from "../lib/api"
import Notifications from "../lib/notifications"
import { EVENT_MINIGAMES_PROFILE_UPDATED, EventBus } from "../lib/eventbus"
import useDonatePrices from "../hook/useDonatePrices"

const plans = [
    { id: 'prime_7', title: '7 дней', days: 7 },
    { id: 'prime_30', title: '1 месяц', days: 30 },
    { id: 'prime_90', title: '3 месяца', days: 90, profit: 17 },
    { id: 'prime_180', title: '6 месяцев', days: 180, profit: 25 },
    { id: 'prime_365', title: '12 месяцев', days: 365, profit: 38 },
]

const features = [
    {
        image: "/assets/image/prime/hd_skin.jpg",
        title: "HD скин 128x128",
        description: "Возможность установить скин размером 128x128 пикселей"
    },
    {
        image: "/assets/image/prime/party_limit.jpg",
        title: "Больше участников в группе",
        description: "Лимит участников в группе увеличен на 2"
    },
    {
        image: "/assets/image/prime/friends_limit.jpg",
        title: "Больше друзей",
        description: "Лимит друзей увеличен на 20 игроков"
    },
    {
        image: "/assets/image/prime/personal_exp.jpg",
        title: "Бонус к опыту",
        description: "Получайте на 50% больше опыта"
    },
    {
        image: "/assets/image/prime/minidot.jpg",
        title: "Уникальная персонализация",
        description: "Вы будете получать по 3 уникальные персонализации каждый месяц"
    },
    {
        image: "/assets/image/prime/private_games.jpg",
        title: "Приватные игры",
        description: <>Создание 7 приватных игр в день командой <code>/game create</code></>
    },
    {
        image: "/assets/image/prime/trails.jpg",
        title: "Уникальные следы",
        description: "Вы сможете устанавливать уникальные следы в лобби"
    },
    {
        image: "/assets/image/prime/name_icon.jpg",
        title: "Значок после ника",
        description: <>Значок и его цвет вы можете выбрать командой <code>/primeicon</code></>
    },
    {
        image: "/assets/image/prime/guild_anim.gif",
        title: "Анимированная аватарка гильдии",
        description: "Лидер гильдии с Prime сможет установить GIF аватарку гильдии"
    },
    {
        image: "/assets/image/prime/guild_members.jpg",
        title: "Больше членов гильдии",
        description: "У гильдии с лидером Prime увеличен лимит участников на 20 человек"
    },
    {
        image: "/assets/image/prime/guild_exp.jpg",
        title: "Бонус к опыту гильдии",
        description: "Гильдия с лидером Prime получает на 50% больше опыта"
    },
]

const FeatureCardHorizontal = ({ image, title, description }) => {
    return <div className="col-12">
        <div className="card mb-4 p-0">
            <div className="row g-0">
                <div className="col-lg-4 pe-lg-3">
                    <img src={image} alt={title} className="img-fluid rounded" />
                </div>
                <div className="col-lg-8">
                    <div className="card-body py-3 ps-lg-2">
                        <h5 className="card-title">{title}</h5>
                        <p className="card-text">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

const FeatureCard = ({ image, title, description }) => {
    return <div className="col-12 col-sm-6 col-lg-4">
        <div className="card mb-4 p-0">
            <img src={image} alt={title} className="img-fluid rounded-top" />
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="card-text">{description}</p>
            </div>
        </div>
    </div>
}

const PrimeFeaturesCard = () => {
    return <div className="card">
        <div className="card-header">
            <h4>Возможности Prime</h4>
        </div>
        <div className="card-body">
            <div className="row">
                {features.map((feature, i) => {
                    if (i % 4 === 0)
                        return <FeatureCardHorizontal key={i} {...feature} />
                    return <FeatureCard key={i} {...feature} />
                })}
            </div>
        </div>
    </div>
}

const SubInactiveInfo = () => {
    return <div className="mb-4">
        Статус: <span className="badge bg-secondary">подписка не активна</span>
    </div>
}

const SubActiveInfo = ({ profile }) => {
    const dateFrom = new Date(profile.prime_from)
    const dateTo = new Date(profile.prime_to)
    const daysLeft = Math.floor((dateTo.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + 1

    return <div className="mb-3">
        Статус: <span className="badge bg-success">подписка активна</span>
        <br />
        Начало: {dateFrom.toLocaleString()}
        <br />
        Окончание: через {ruPluralize(daysLeft, ["день", "дня", "дней"], true)} - {dateTo.toLocaleString()}.
    </div>
}

const PurchaseOption = ({ title, price, active, profit, onClick }) => {
    return <div className="col-sm-6 col-lg-4 mb-4">
        <div className="card border h-100">
            <div className="card-body p-2 h-100 d-flex flex-column justify-content-between">
                <div>
                    <h5 className="border-bottom pb-3 text-center">{title}</h5>
                    <div className="text-center mb-2"><span className="display-5">{price}</span> вим.</div>
                    {profit && <div className="text-center"><div className="bg-success-subtle text-success badge mb-3">на {profit}% выгоднее</div></div>}
                </div>
                <button className="btn btn-primary w-100" onClick={onClick}>
                    {active ? 'Продлить' : 'Купить'}
                </button>
            </div>
        </div>
    </div>
}

const PrimeCardBody = ({ profile, prices }) => {
    const navigate = useNavigate()
    const { app, fetchAuth } = useApp()
    const [selectedPlan, setSelectedPlan] = useState(plans[0])
    const [showConfirmBuy, setShowConfirmBuy] = useState(false)
    const [loading, setLoading] = useState(false)

    const selectPlan = (plan) => {
        setSelectedPlan(plan)
        setShowConfirmBuy(true)
    }

    const buyClick = () => {
        if (loading)
            return
        setLoading(true)

        fetchApi('/server/minigames/prime/purchase', {
            method: 'POST',
            body: { days: selectedPlan.days },
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно купили Prime на ' + selectedPlan.title)
                    EventBus.emit(EVENT_MINIGAMES_PROFILE_UPDATED, body.response)
                    fetchAuth()
                } else if (body.response.type === "insufficient_funds") {
                    Notifications.error('У вас недостаточно вимеров')
                    fetchAuth()
                } else {
                    Notifications.error('Произошла ошибка')
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <>
        {!profile.prime_active && <SubInactiveInfo profile={profile} />}
        {profile.prime_active && <SubActiveInfo profile={profile} />}

        Вы можете продлить подписку в любое время, чтобы не потерять доступ к возможностям и сохранить счетчик активных дней.

        <div className="row mt-4">
            {plans.map(plan => {
                return <PurchaseOption
                    key={plan.days}
                    title={plan.title}
                    price={prices.prices?.[plan.id]}
                    active={profile.prime_active}
                    profit={plan.profit}
                    onClick={() => selectPlan(plan)}
                />
            })}
        </div>

        <p>Подписка активируется сразу после покупки и действует в течение выбранного периода времени.</p>
        <div>Подписка не продлевается автоматически, поэтому не забудьте продлить ее вовремя.</div>

        {app.user.cash + app.user.cash_bonuses < selectedPlan.price ?
            <ConfirmModal show={showConfirmBuy} close={() => setShowConfirmBuy(false)}
                confirmText={"Пополнить счет"}
                onConfirm={() => navigate("/payments")}
                title="Недостаточно вимеров"
            >
                <p>У вас недостаточно вимеров для покупки Prime на {selectedPlan.title}.</p>
                Ваш баланс <b className="text-success">{ruPluralizeVimers(app.user.cash + app.user.cash_bonuses)}</b>
            </ConfirmModal>
            :
            <ConfirmModal show={showConfirmBuy} close={() => setShowConfirmBuy(false)}
                confirmText={profile.prime_active ? 'Продлить' : 'Купить'}
                onConfirm={buyClick}
                title={"Подтверждение"}
            >
                <p>
                    Вы действительно хотите {profile.prime_active ? 'продлить' : 'купить'} подписку Prime на {selectedPlan.title} за <b className="text-success">{ruPluralizeVimers(selectedPlan.price)}</b>?
                </p>
                Ваш баланс <b className="text-success">{ruPluralizeVimers(app.user.cash + app.user.cash_bonuses)}</b>
            </ConfirmModal>
        }
    </>
}

const MinigamesPrimePage = () => {
    const profile = useMinigamesProfile()
    const prices = useDonatePrices()

    return <>
        <div className='row mb-4'>
            <div className='col'>
                <div className="card">
                    <div className="card-header">
                        <h4 className="mb-0">Подписка Prime</h4>
                        <span>Дополнительные возможности на MiniGames и не только</span>
                    </div>
                    <div className='card-body'>
                        {profile.loading && <div className='text-center'><Spinner variant='secondary' /></div>}
                        {profile.error && <div className='text-center text-danger'>При загрузке произошла ошибка</div>}
                        {profile.profile && <PrimeCardBody profile={profile.profile} prices={prices} />}
                    </div>
                </div>
            </div>
        </div>

        <div className="row mb-4">
            <div className="col">
                <PrimeFeaturesCard />
            </div>
        </div>
    </>
}

export default MinigamesPrimePage

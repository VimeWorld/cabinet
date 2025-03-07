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

const plans = [
    { title: '1 месяц', days: 30, price: Math.floor(244) },
    { title: '6 месяцев', days: 180, price: Math.floor(1049), profit: 30 },
    { title: '12 месяцев', days: 365, price: Math.floor(1539), profit: 50 },
]

const SubInactiveInfo = () => {
    return <div className="mb-4">
        Статус: <span className="badge bg-secondary">подписка не активна</span>
    </div>
}

const SubActiveInfo = ({ profile }) => {
    const dateFrom = new Date(profile.hd_sub_from)
    const dateTo = new Date(profile.hd_sub_to)
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

const HdSubCardBody = ({ profile }) => {
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

        fetchApi('/server/minigames/hd_sub/purchase', {
            method: 'POST',
            body: { days: selectedPlan.days },
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно купили HD подписку на ' + selectedPlan.title)
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
        {!profile.hd_sub_active && <SubInactiveInfo profile={profile} />}
        {profile.hd_sub_active && <SubActiveInfo profile={profile} />}

        Вы можете продлить подписку в любое время, чтобы не потерять доступ к HD скинам и плащам, а также сохранить счетчик активных дней.

        <div className="row mt-4">
            {plans.map(plan => {
                return <PurchaseOption
                    key={plan.days}
                    title={plan.title}
                    price={plan.price}
                    active={profile.hd_sub_active}
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
                <p>У вас недостаточно вимеров для покупки HD подписки на {selectedPlan.title}.</p>
                Ваш баланс <b className="text-success">{ruPluralizeVimers(app.user.cash + app.user.cash_bonuses)}</b>
            </ConfirmModal>
            :
            <ConfirmModal show={showConfirmBuy} close={() => setShowConfirmBuy(false)}
                confirmText={profile.hd_sub_active ? 'Продлить' : 'Купить'}
                onConfirm={buyClick}
                title={"Подтверждение"}
            >
                <p>
                    Вы действительно хотите {profile.hd_sub_active ? 'продлить' : 'купить'} HD подписку на {selectedPlan.title} за <b className="text-success">{ruPluralizeVimers(selectedPlan.price)}</b>?
                </p>
                Ваш баланс <b className="text-success">{ruPluralizeVimers(app.user.cash + app.user.cash_bonuses)}</b>
            </ConfirmModal>
        }
    </>
}

const MinigamesHdSubPage = () => {
    const profile = useMinigamesProfile()

    return <>
        <div className='row mb-4'>
            <div className='col'>
                <div className="card">
                    <div className="card-header">
                        <h4 className="mb-0">HD подписка</h4>
                        <span>Возможность устанавливать HD скины и плащи на всех серверах</span>
                    </div>
                    <div className='card-body'>
                        {profile.loading && <div className='text-center'><Spinner variant='secondary' /></div>}
                        {profile.error && <div className='text-center text-danger'>При загрузке произошла ошибка</div>}
                        {profile.profile && <HdSubCardBody profile={profile.profile} />}
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default MinigamesHdSubPage

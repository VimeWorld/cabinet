import { useEffect } from 'react'
import { Spinner } from 'react-bootstrap'
import useLoadPages from '../hook/useLoadPages'
import { fetchApi } from '../lib/api'
import { EventBus, EVENT_UPDATE_PAYMENTS } from '../lib/eventbus'

const paymentDescription = (p) => {
    if (p.alias.startsWith('up_'))
        return 'Пополнение через Unitpay'
    switch (p.alias) {
        case "unban":
            return p.data ? <>Снятие бана на сервере: <b>{p.data.server}</b></> : 'Снятие бана'
        case "transfer":
            if (p.amount < 0)
                return <>Перевод игроку <b>{p.data}</b></>
            else
                return <>Перевод от игрока <b>{p.data}</b></>
        case "serv":
            return <>Покупка услуги <b>{p.data.name}</b></>
        case "blocks":
            return <>Покупка блоков на сервере <b>{p.data.server}</b></>
        case "perm":
            return <>Покупка привилегий на сервере <b>{p.data.server}</b></>
        case "coins":
            return <>Обмен на коины (<b>{p.data}</b> шт.)</>
        case "aff":
            return <>Награда за друга (<b>{p.data}</b> шт.)</>
        case "color":
            return <>Изменение цвета ника на <b>{p.data.color}</b></>
        case "civ_item":
            if (p.data.name && p.data.server)
                return <>Покупка предмета <b className="text-warning">{p.data.name}</b> на <b>CivCraft {p.data.server}</b></>
            if (p.data.name)
                return <>Покупка предмета <b className="text-warning">{p.data.name}</b> на <b>CivCraft</b></>
            return <>Покупка предмета на <b>CivCraft</b></>
        case "prison_item":
            if (p.data.name)
                return <>Покупка предмета <b className="text-warning">{p.data.name}</b> на <b>Prison</b></>
            return <>Покупка предмета на <b>Prison</b></>
        case "sky_item":
            if (p.data.name)
                return <>Покупка предмета <b className="text-warning">{p.data.name}</b> на <b>SkyBlock</b></>
            return <>Покупка предмета на <b>SkyBlock</b></>
        case "mod_item":
            return <>{p.data.name} на сервере <b>{p.data.server}</b></>
        case "hold":
            if (p.data.alias == 'trade' || p.data.alias == 'trade_shop')
                return 'Заморозка вимеров на время сделки'
            return 'Замороженные вимеры (активная транзакция)'
        case "trade":
            return <>
                {'Торговля с игроком '}
                <b>{p.data.recipient || p.data.sender}</b>
                {p.data.desc ? ' - ' + p.data.desc : ''}
            </>
        case "trade_shop":
            return <>
                {p.amount > 0 ? 'Продажа игроку ' : 'Покупка у игрока '}
                <b>{p.data.seller || p.data.buyer}</b>
                {p.data.desc ? ' - ' + p.data.desc : ''}
            </>
        case "interkassa": return 'Пополнение через Интеркассу'
        case "enot": return 'Пополнение через Enot.io'
        case "liqpay": return 'Пополнение через LiqPay'
        case "fondy": return 'Пополнение через Fondy'
        case "fondy_check": return 'Пополнение через Fondy (Проходит ручную проверку)'
        case "vote": return 'Голосование за сервер'
        case "promo-code": return 'Активация промо-кода'
        case "admin": return 'Администрация VimeWorld'
        case "cloak": return 'Покупка плаща'
    }
    return 'Неизвестная операция ' + p.alias
}

export const PaymentHistoryCard = () => {
    const pages = useLoadPages(id => fetchApi('/payment/history?count=20&id=' + id))

    useEffect(() => {
        if (pages.id != 0 || !pages.items)
            return
        return EventBus.on(EVENT_UPDATE_PAYMENTS, () => pages.load())
    }, [pages.id, pages.items])

    return <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
            <div className="mb-0">
                <h4 className="mb-0">История переводов</h4>
                <span>Здесь отображаются все ваши операции с вимерами</span>
            </div>
            {pages.loading && <div>
                <Spinner variant="secondary" />
            </div>}
        </div>

        <div className="card-table table-responsive">
            <table className="table table-payments">
                <thead className="bg-tertiary">
                    <tr>
                        <th scope="col" className="border-bottom-0">Дата</th>
                        <th scope="col" className="border-bottom-0">Сумма</th>
                        <th scope="col" style={{ minWidth: 300 }} className="border-bottom-0">Информация</th>
                    </tr>
                </thead>
                <tbody>
                    {pages.loading && !pages.items && [1, 2, 3].map(e => {
                        return <tr key={e}>
                            <td className="placeholder-glow" colSpan="3">
                                <span className="placeholder bg-secondary col-1"></span>
                                <span className="placeholder bg-secondary col-10 ms-2"></span>
                            </td>
                        </tr>
                    })}

                    {pages.error && !pages.loading && <tr><td className="text-center text-danger" colSpan="4">
                        <p>При загрузке произошла ошибка</p>
                        <button className="btn btn-outline-secondary" onClick={() => pages.load()}>Попробовать снова</button>
                    </td></tr>}

                    {pages.items?.length == 0 && <tr><td className="text-center text-body-secondary" colSpan="4">
                        Пусто...
                    </td></tr>}

                    {pages.items?.map(p => {
                        const amount = p.amount > 0
                            ? <b className="text-success">+{p.amount}</b>
                            : <b className="text-danger">{p.amount}</b>
                        return <tr key={p.id}>
                            <td className="fit">{new Date(Date.parse(p.date)).toLocaleString()}</td>
                            <td className="fit">{amount}</td>
                            <td className="description">{paymentDescription(p)}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>

        {pages.hasPages &&
            <div className="card-body">
                {pages.Pagination}
            </div>}
    </div>
}

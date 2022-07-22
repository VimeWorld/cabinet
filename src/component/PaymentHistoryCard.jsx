import { useEffect, useState } from "react"
import { fetchApi } from "../lib/api"
import { IdPagination } from "./Pagination"

const paymentDescription = (p) => {
    if (p.alias.startsWith('up_'))
        return 'Пополнение через Unitpay'
    switch (p.alias) {
        case "unban":
            return p.data ? <>Покупка разбана на сервере: <b>{p.data.server}</b></> : 'Покупка разбана'
        case "transfer":
            if (p.amount < 0)
                return <>Перевод игроку <b>{p.data}</b></>
            else
                return <>Перевод от игрока <b>{p.data}</b></>
        case "serv":
            return <>Покупка услуги <b>{p.data.name}</b></>
        case "shop":
        case "block_shop":
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
    const [position, setPosition] = useState(0)
    const [data, setData] = useState(null)

    useEffect(() => {
        fetchApi('/cp/payment/history?count=20&id=' + position)
            .then(response => {
                if (!response.ok)
                    throw new Error('Invalid response')
                return response.json()
            }).then(body => {
                setData(body.response)
            }).catch(error => {
                setData(false)
            })
    }, [position])

    return <div className="card" id="promo">
        <div className="card-header">
            <h4 className="mb-0">История переводов</h4>
            <span>Здесь отображаются все ваши операции с вимерами</span>
        </div>
        <div className="table-responsive">
            <table className="card-table table table-payments">
                <thead className="table-light">
                    <tr>
                        <th scope="col" className="border-bottom-0">#</th>
                        <th scope="col" className="border-bottom-0">Дата</th>
                        <th scope="col" className="border-bottom-0">Сумма</th>
                        <th scope="col" className="border-bottom-0">Информация</th>
                    </tr>
                </thead>
                <tbody>
                    {data == null && <tr><td className="placeholder-glow" colSpan={4}>
                        <span className="placeholder bg-secondary col-1"></span>
                        <span className="placeholder bg-secondary col-10 ms-2"></span>
                    </td></tr>}
                    {data === false && <tr><td className="text-center text-danger" colSpan={4}>
                        При загрузке возникла ошибка
                    </td></tr>}
                    {data?.payments.length == 0 && <tr><td className="text-center text-muted" colSpan={4}>
                        Пусто...
                    </td></tr>}

                    {data?.payments.length > 0 && data.payments.map(p => {
                        const amount = p.amount > 0
                            ? <b className="text-success">+{p.amount}</b>
                            : <b className="text-danger">{p.amount}</b>
                        return <tr key={p.id}>
                            <td className="fit align-middle text-muted">{p.id}</td>
                            <td className="fit align-middle">{new Date(Date.parse(p.date)).toLocaleString()}</td>
                            <td className="fit align-middle">{amount}</td>
                            <td className="description">{paymentDescription(p)}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
        <div className="card-body">
            {data && <IdPagination prev={data.prev_pages} next={data.next_pages} hasMore={data.has_more} onChange={setPosition} />}
        </div>
    </div>
}

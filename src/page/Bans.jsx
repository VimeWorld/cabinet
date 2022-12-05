import { useEffect, useState } from "react"
import { OverlayTrigger, Spinner, Tab, Tabs, Tooltip } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import { ConfirmModal } from "../component/ConfirmModal"
import useApp from "../hook/useApp"
import { useTitle } from "../hook/useTitle"
import { fetchApi } from "../lib/api"
import { ruPluralizeVimers } from "../lib/i18n"
import Notifications from "../lib/notifications"

const ServerBansCard = ({ name, url }) => {
    const [loading, setLoading] = useState(true)
    const [bans, setBans] = useState(null)
    const [error, setError] = useState(false)
    const [showConfirmUnban, setShowConfirmUnban] = useState(false)
    const { app, fetchAuth } = useApp()
    const navigate = useNavigate()

    const loadBanlist = () => {
        setLoading(true)
        setError(false)
        setBans(null)
        fetchApi(url)
            .then(r => r.json())
            .then(body => {
                if (body.success)
                    setBans(body.response)
                else
                    setError(true)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }

    useEffect(() => loadBanlist(), [])

    const unban = () => {
        if (!bans?.unban.possible)
            return

        fetchApi(url, {
            method: 'DELETE'
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Все баны на ' + name + ' успешно сняты')
                    loadBanlist()
                    fetchAuth()
                } else if (body.response.type == 'not_possible') {
                    Notifications.error('Вы не можете купить разбан')
                } else if (body.response.type == 'insufficient_funds') {
                    Notifications.error('У вас недостаточно вимеров')
                } else {
                    Notifications.error('Ошибка сервера: ' + body.response.title)
                }
            })
            .catch(() => Notifications.error("Ошибка подключения к серверу"))
    }

    return <>
        {bans?.unban.possible && <div className="card-body pt-0">
            <div>
                <span className="text-danger">У вас есть активные баны. </span>
                Вы можете их снять за <b className="text-success">{ruPluralizeVimers(bans.unban.price)}</b>.
                Однако учтите, что после каждого снятия бана стоимость повышается.
                Соблюдайте <a href="https://vime.one/rules">правила</a>, чтобы это больше не повторялось!
            </div>

            <div className="text-end mt-3">
                <button className="btn btn-primary" onClick={() => setShowConfirmUnban(true)}>Снять бан</button>

                {bans.unban.price <= app.user.cash ?
                    <ConfirmModal show={showConfirmUnban} close={() => setShowConfirmUnban(false)}
                        confirmText={"Снять бан"}
                        onConfirm={unban}
                        title={"Подтверждение"}
                    >
                        Вы действительно хотите купить снятие бана за <b className="text-success">{ruPluralizeVimers(bans.unban.price)}</b>?<br />
                        Ваш баланс <b className="text-success">{ruPluralizeVimers(app.user.cash)}</b>
                    </ConfirmModal>
                    :
                    <ConfirmModal show={showConfirmUnban} close={() => setShowConfirmUnban(false)}
                        confirmText={"Пополнить счет"}
                        onConfirm={() => navigate("/payments")}
                        title="Недостаточно вимеров"
                    >
                        У вас недостаточно вимеров для снятия бана.<br />
                        Ваш баланс <b className="text-success">{ruPluralizeVimers(app.user.cash)}</b><br />
                        Стоимость снятия бана <b className="text-success">{ruPluralizeVimers(bans.unban.price)}</b>
                    </ConfirmModal>
                }
            </div>
        </div>}

        <div className="card-table table-responsive">
            <table className="table table-payments">
                <thead className="bg-tertiary">
                    <tr>
                        <th scope="col" className="border-bottom-0">Выдан</th>
                        <th scope="col" className="border-bottom-0">До</th>
                        <th scope="col" className="border-bottom-0">Модератор</th>
                        <th scope="col" className="border-bottom-0">Статус</th>
                        <th scope="col" className="border-bottom-0">Причина</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && !bans && <tr><td className="placeholder-glow" colSpan="5">
                        <span className="placeholder bg-secondary col-1"></span>
                        <span className="placeholder bg-secondary col-10 ms-2"></span>
                    </td></tr>}
                    {error && !loading && <tr><td className="text-center text-danger" colSpan="5">
                        При загрузке произошла ошибка
                    </td></tr>}

                    {bans?.bans.length == 0 && <tr><td className="text-center text-muted" colSpan="5">
                        У вас не было ни одного бана, святой вы человек...
                    </td></tr>}

                    {bans?.bans.map(b => {
                        const toTs = Date.parse(b.to)
                        const to = toTs == 0 ? 'Вечный бан' : new Date(toTs).toLocaleString()
                        let status
                        switch (b.status) {
                            case "expired":
                                status = <span className="badge text-bg-success">Не активен</span>
                                break
                            case "active":
                                status = <span className="badge text-bg-danger">Активный</span>
                                break
                            case "active_no_unban":
                                status =
                                    <OverlayTrigger overlay={<Tooltip>
                                        Без возможности снять бан
                                    </Tooltip>}>
                                        <span className="badge text-bg-danger">Активный *</span>
                                    </OverlayTrigger>
                                break
                            case "unban_moder":
                                status = <span className="badge text-bg-success">Снят модером</span>
                                break
                            case "unban_bought":
                                status = <span className="badge text-bg-primary">Снят за вимеры</span>
                                break
                            default:
                                status = <span className="badge text-bg-secondary">???</span>
                        }
                        return <tr key={b.id}>
                            <td className="fit">{new Date(Date.parse(b.from)).toLocaleString()}</td>
                            <td className="fit">{to}</td>
                            <td className="fit">{b.moder}</td>
                            <td className="fit">{status}</td>
                            <td className="fit">{b.reason}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    </>
}

const BansPage = () => {
    useTitle('Баны')
    return <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
            <div className="mb-0">
                <h4 className="mb-0">Баны</h4>
                <span>Отображается вся история ваших банов</span>
            </div>
        </div>
        <Tabs
            id="ban-server-tabs"
            className="card-body gap-3"
            variant="pills"
            mountOnEnter={true}
            fill
        >
            <Tab eventKey="mg" title="MiniGames" tabClassName="border">
                <ServerBansCard name="MiniGames" url="/server/minigames/bans" />
            </Tab>
            <Tab eventKey="mods" title="Модовые" tabClassName="border">
                <ServerBansCard name="Модовых" url="/server/mods/bans" />
            </Tab>
            <Tab eventKey="civ" title="CivCraft" tabClassName="border">
                <ServerBansCard name="CivCraft" url="/server/civcraft/bans" />
            </Tab>
        </Tabs>
    </div>
}

export default BansPage

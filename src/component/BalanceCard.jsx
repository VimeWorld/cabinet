import { Link } from "react-router-dom"
import useApp from "../hook/useApp"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { ruPluralize, ruPluralizeVimers } from "../lib/i18n"

export const BalanceCard = ({ pay }) => {
    const { app } = useApp()

    return <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
            <div className="mb-0">
                <h4 className="mb-0">Баланс</h4>
                <span>Ваш текущий баланс</span>
            </div>
            {pay &&
                <div>
                    <Link to="/payments" className="btn btn-outline-success">Пополнить</Link>
                </div>
            }
        </div>
        <div className="card-body">
            <h4 className="text-success text-center">
                {app.user.cash.toFixed(2) + ' ' + ruPluralizeVimers(Math.ceil(app.user.cash), false)}
            </h4>
            <h4 className="text-center" style={{ "color": "#faa700" }}>
                {app.user.cash_bonuses.toFixed(2) + ' ' + ruPluralize(Math.ceil(app.user.cash_bonuses), ['бонусный вимер', 'бонусных вимера', 'бонусных вимеров'], false)}<OverlayTrigger overlay={<Tooltip>
                        Бонусные вимеры нельзя передавать, а также покупать за них
                        определенные внутриигровые предметы. В остальном они такие же вимеры.
                        Вы можете получить их за участие в различных событиях сервера.
                    </Tooltip>}>
                        <i className="bi bi-info-circle ms-2 text-primary"></i>
                    </OverlayTrigger>
            </h4>
        </div>
    </div>
}

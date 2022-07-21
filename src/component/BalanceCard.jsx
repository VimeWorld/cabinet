import useApp from "../hook/useApp"
import { ruPluralize } from "../lib/i18n"

export const BalanceCard = ({ pay }) => {
    const { app } = useApp()

    return <div className="card">
        <div className="card-header d-lg-flex justify-content-between align-items-center">
            <div className="mb-3 mb-lg-0">
                <h4 className="mb-0">Баланс</h4>
                <span>Ваш текущий баланс</span>
            </div>
            {pay &&
                <div>
                    <button className="btn btn-outline-success">Пополнить</button>
                </div>
            }
        </div>
        <div className="card-body">
            <h4 className="text-success text-center">
                {app.user.cash.toFixed(2) + ' ' + ruPluralize(parseInt(app.user.cash), ['вимер', 'вимера', 'вимеров'])}
            </h4>
        </div>
    </div>
}

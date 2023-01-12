import { Link } from 'react-router-dom'
import useApp from '../hook/useApp'
import { ruPluralizeVimers } from '../lib/i18n'

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
        </div>
    </div>
}

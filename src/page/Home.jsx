import { useState } from "react"
import { BalanceCard } from "../component/BalanceCard"
import { PromoCard } from "../component/PromoCard"
import { SkinCard } from "../component/SkinCard"
import useApp from "../hook/useApp"

const PersonalInfoCard = () => {
    const { app } = useApp()
    const [emailHidden, setEmailHidden] = useState(true)

    let regTime = 'xx.xx.2012'
    const regUnix = Date.parse(app.user.reg_time)
    if (regUnix)
        regTime = new Date(regUnix).toLocaleDateString()

    let email = app.user.email
    if (emailHidden)
        email = email.replace(/^(.)(.*)(.@.*)$/,
            (_, a, b, c) => a + b.replace(/./g, '*') + c
        )

    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Ваши данные</h4>
            <span>Данные аккаунта</span>
        </div>
        <div className="card-body">
            <dl className="row mb-0">
                <dt className="col-sm-4">Ник</dt>
                <dd className="col-sm-8 user-select-all">{app.user.username}</dd>

                <dt className="col-sm-4">Email</dt>
                <dd className="col-sm-8" role="button" onClick={() => setEmailHidden(!emailHidden)}>{email}</dd>

                <dt className="col-sm-4">Регистрация</dt>
                <dd className="col-sm-8">{regTime}</dd>
            </dl>
        </div>
    </div>
}

export const HomePage = () => {
    return <>
        <div className="row mb-4">
            <div className="col">
                <PersonalInfoCard />
            </div>

            <div className="col">
                <BalanceCard pay />
            </div>
        </div>
        <div className="row mb-4">
            <div className="col">
                <SkinCard />
            </div>
        </div>
        <div className="row mb-4">
            <div className="col">
                <PromoCard />
            </div>
        </div>
    </>
}

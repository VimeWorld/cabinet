import { useState, useEffect } from "react"
import { BalanceCard } from "../component/BalanceCard"
import { PromoCard } from "../component/PromoCard"
import { fetchApi } from "../lib/api"
import { AdditionalUsernamesCard } from "../component/AdditionalUsernamesCard"
import SkinCard from "../component/skin/SkinCard"
import useApp from "../hook/useApp"
import { useTitle } from "../hook/useTitle"
import { AlfaBankBanner } from "./Payments"

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
            <span>Информация об аккаунте</span>
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

const HomePage = () => {
    const { app } = useApp()
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
    useTitle(app.user.username)
    return <>
        <div className="mb-4 gy-4">
            <AlfaBankBanner alfaLink={alfaLink} />
        </div>
        <div className="row mb-4 gy-4">
            <div className="col-lg-6 col-12">
                <PersonalInfoCard />
                <div className="mt-4">
                    <BalanceCard pay />
                </div>
            </div>

            <div className="col-lg-6 col-12">
                <SkinCard />
            </div>
        </div>
        <div className="row mb-4 gy-4">
            <div className="col-lg-6 col-12">
                <PromoCard />
            </div>
            <div className="col-lg-6 col-12">
                <AdditionalUsernamesCard />
            </div>
        </div>
    </>
}

export default HomePage

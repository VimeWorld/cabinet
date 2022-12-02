import { useEffect, useMemo, useState } from "react"
import { Spinner } from "react-bootstrap"
import { useSearchParams } from "react-router-dom"
import OuterPage from "../component/OuterPage"
import useApp from "../hook/useApp"
import { useTitle } from "../hook/useTitle"
import { fetchApi } from "../lib/api"
import Notifications from "../lib/notifications"

const loadApproves = () => {
    return JSON.parse(localStorage.getItem('oauth_consent') || '{}')
}
const saveApproves = (save) => {
    localStorage.setItem('oauth_consent', JSON.stringify(save))
}

const saveApprove = (client_id, scope) => {
    const key = client_id + "$$$" + scope
    let save = loadApproves()
    if (save.approved && save.approved.includes(key))
        return
    if (save.approved)
        save.approved.push(key)
    else
        save.approved = [key]
    saveApproves(save)
}

const isApproved = (client_id, scope) => {
    const key = client_id + "$$$" + scope
    let save = loadApproves()
    return save.approved && save.approved.includes(key)
}

const ConsentScreen = ({ data }) => {
    const { app } = useApp()
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams()

    const scope = useMemo(() => {
        const scope = (searchParams.get('scope') || '').replaceAll(",", " ").trim()
        const scopeParsed = scope == '' ? [] : scope.split(' ')
        scopeParsed.unshift('userinfo')
        return scopeParsed
    }, [searchParams])

    let denyUrl = searchParams.get("redirect_uri") + "?error=access_denied"
    if (searchParams.has('state'))
        denyUrl += '&state=' + encodeURIComponent(searchParams.get('state'))

    const approve = () => {
        if (loading) return
        setLoading(true)
        saveApprove(searchParams.get('client_id'), searchParams.get('scope'))

        fetchApi('/oauth/approve', {
            method: 'POST',
            body: Object.fromEntries(searchParams)
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    window.location.href = body.response.redirect
                    return
                }

                switch (body.response.type) {
                    case 'bad_request':
                        Notifications.error("Некорректный запрос на авторизацию")
                        break
                    default:
                        Notifications.error(body.response.title)
                }
                setLoading(false)
            })
            .catch(() => {
                Notifications.error('Невозможно подключиться к серверу')
                setLoading(false)
            })
    }

    useEffect(() => {
        if (isApproved(searchParams.get('client_id'), searchParams.get('scope')))
            approve()
    }, [searchParams])

    return <>
        <div className="mb-4">
            <h4 className="fw-normal text-center mb-0">{data.client.name}</h4>
            {data.client.url && <div className="text-center">{data.client.url}</div>}
        </div>

        <p>Это приложение запрашивает доступ к следующей информации:</p>

        <ul className="mb-4">
            {scope.map(s => {
                if (s == 'userinfo')
                    return <li key={s}><b>Ваш ник</b>: {app.user.username}</li>
                if (s == 'api_id')
                    return <li key={s}>Ваш ID на MiniGames</li>
                if (s == 'site_id')
                    return <li key={s}>Ваш ID на проекте</li>

                return <li key={s}>{s}</li>
            })}
        </ul>

        <button className="btn btn-lg btn-primary w-100 mb-3" onClick={approve} disabled={loading}>
            {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
            {loading ? ' Загрузка...' : 'Разрешить'}
        </button>
        <a href={denyUrl} className="btn btn-lg btn-outline-secondary w-100">Отмена</a>
    </>
}

const OauthAuthorizePage = () => {
    useTitle('Запрос доступа')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchParams] = useSearchParams()

    useEffect(() => {
        setLoading(true)
        setError(false)
        setData(null)
        fetchApi('/oauth/check?' + searchParams)
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    setData(body.response)
                } else if (body.response.type == 'bad_request') {
                    setError('Некорректный запрос на авторизацию')
                } else {
                    setError(body.response.title)
                }
            })
            .catch(() => setError('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }, [searchParams])

    return <OuterPage>
        {loading && <div className="text-center"><Spinner size="lg" variant="secondary" /></div>}

        {!loading && error && <div className="text-danger text-center">{error}</div>}
        {!loading && data && <ConsentScreen data={data} />}
    </OuterPage>
}

export default OauthAuthorizePage

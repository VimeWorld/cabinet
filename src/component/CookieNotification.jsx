import { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import Cookies from 'js-cookie'

const CookieNotification = () => {
    const [show, setShow] = useState(false)

    useEffect(() => {
        // Проверяем, было ли уже принято соглашение о cookie
        const cookieConsent = Cookies.get('cookie_consent')
        if (!cookieConsent) {
            setShow(true)
        }
    }, [])

    const acceptCookies = () => {
        Cookies.set('cookie_consent', 'accepted', { expires: 365 }) // Сохраняем на год
        setShow(false)
    }

    if (!show) {
        return null
    }

    return (
        <div className="position-fixed bottom-0 start-0 w-100 bg-dark text-white p-3" style={{ zIndex: 1050 }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <p className="mb-0 small">
                            Мы используем файлы cookie для улучшения работы сайта и персонализации контента. 
                            Продолжая использовать сайт, вы соглашаетесь с использованием файлов cookie.
                        </p>
                    </div>
                    <div className="col-md-4 text-md-end mt-2 mt-md-0">
                        <Button 
                            variant="primary" 
                            size="sm"
                            onClick={acceptCookies}
                        >
                            Принять
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CookieNotification 
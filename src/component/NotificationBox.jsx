import { useEffect, useState } from 'react'
import { CloseButton, Toast, ToastContainer } from 'react-bootstrap'
import { EventBus, EVENT_NOTIFICATIONS_CHANGED } from '../lib/eventbus'
import Notifications from '../lib/notifications'

const NotificationComponent = ({ notify }) => {
    // Стейт нужен для рабочей анимации. Если создать тост сразу видимым, то не будет анимации появления
    const [show, setShow] = useState(false)
    useEffect(() => {
        setShow(true)
    }, [])

    const onClose = () => {
        if (!show)
            return
        setShow(false)
        // Ждем завершение анимации
        setTimeout(() => {
            Notifications.remove(notify)
        }, 1000)
    }

    let color = notify.type
    if (color === 'error') color = 'danger'
    color = 'text-bg-' + color

    return <Toast
        show={show}
        className={"mb-3 border-0 " + color}
        data-bs-theme="dark"
        onClose={onClose}
        delay={notify.ttl}
        autohide
    >
        <div className="d-flex">
            <Toast.Body>{notify.message}</Toast.Body>
            <CloseButton
                aria-label="Close"
                onClick={onClose}
                data-dismiss="toast"
                className='me-2 m-auto'
            />
        </div>
    </Toast>
}

const NotificationBox = () => {
    let [list, setList] = useState([])

    useEffect(() => {
        return EventBus.on(EVENT_NOTIFICATIONS_CHANGED, data => {
            setList([...data])
        })
    }, [setList])

    return (
        <ToastContainer className='p-3' containerPosition='fixed' position='top-end'>
            {list.map(n => <NotificationComponent key={n.id} notify={n} />)}
        </ToastContainer>
    )
}

export default NotificationBox

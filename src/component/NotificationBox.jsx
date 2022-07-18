import { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import Notifications, { subscribeNotificationChange, unsubscribeNotificationChange } from '../lib/notifications';

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

    let bg = notify.type
    if (bg === 'error') bg = 'danger'

    return <Toast show={show} bg={bg} onClose={onClose} delay={notify.ttl} autohide onClick={onClose}>
        <Toast.Body>{notify.message}</Toast.Body>
    </Toast>
}

const NotificationBox = () => {
    let [list, setList] = useState([])

    useEffect(() => {
        let handler = data => setList([...data])
        subscribeNotificationChange(handler)
        return () => unsubscribeNotificationChange(handler)
    }, [setList])

    return (
        <ToastContainer className='p-4' containerPosition='fixed' position='top-end'>
            {list.map(n => <NotificationComponent key={n.id} notify={n} />)}
        </ToastContainer>
    )
}

export default NotificationBox

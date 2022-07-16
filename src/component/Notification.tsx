import classNames from 'classnames';
import { useEffect, useState, useRef } from 'react';
import { Toast, ToastBody, ToastContainer } from 'react-bootstrap';

let list: any[] = []

let idCounter = 0
let genNextId = () => {
    idCounter++
    return "" + idCounter
}

let hooks: any[] = [];
let callHooks = () => {
    hooks.forEach(h => h(list))
}

let defaultNotification: NotificationOptions = {
    ttl: 5000,
    type: 'info',
};

interface NotificationOptions {
    ttl?: number
    type?: 'info' | 'success' | 'error'
}

interface Notification extends NotificationOptions {
    id: string
    message: string
}

export const Notifications = {
    add(message: string, options: NotificationOptions = {}): Notification {
        let notify = {
            id: genNextId(),
            message,
            ...defaultNotification,
            ...options,
        };
        list.push(notify)
        callHooks()
        return notify
    },
    error(message: string, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'error',
            ...options,
        })
    },
    success(message: string, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'success',
            ...options,
        })
    },
    remove(notify: Notification) {
        let len = list.length
        list = list.filter(n => n.id !== notify.id)
        if (list.length !== len)
            callHooks()
    },
}

let NotificationComponent = ({ notify }: { notify: Notification }) => {
    const [show, setShow] = useState(false)
    useEffect(() => {
        setShow(true)
    }, [])

    let bg: string = notify.type!
    if (bg === 'error')
        bg = 'danger'

    const onClose = () => {
        setShow(false)
        Notifications.remove(notify)
    }

    return <Toast show={show} bg={bg} onClose={onClose} delay={notify.ttl} autohide>
        <Toast.Body>{notify.message}</Toast.Body>
    </Toast>
}

export const NotificationBox = () => {
    let [list, setList] = useState<Notification[]>([])

    useEffect(() => {
        let handler = (data: Notification[]) => {
            setList([...data])
        }
        hooks.push(handler)
        return () => {
            hooks = hooks.filter(elem => {
                return elem !== handler
            })
        }
    }, [setList])

    return (
        <ToastContainer containerPosition='fixed' position='top-end'>
            {list.map(n => <NotificationComponent key={n.id} notify={n} />)}
        </ToastContainer>
    )
}

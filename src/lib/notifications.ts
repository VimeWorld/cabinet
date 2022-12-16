import { EventBus, EVENT_NOTIFICATIONS_CHANGED } from "./eventbus"

let list: any[] = []

let idCounter = 0
const genNextId = () => {
    idCounter++
    return "" + idCounter
}

const defaultOptions: NotificationOptions = {
    ttl: 5000,
    type: 'info',
}

type Message = JSX.Element | string

interface NotificationOptions {
    ttl?: number
    type?: 'info' | 'success' | 'error' | 'warning' | 'primary'
}

interface Notification extends NotificationOptions {
    id: string
    message: Message
}

const Notifications = {
    add(message: Message, options: NotificationOptions = {}): Notification {
        const notify = {
            id: genNextId(),
            message,
            ...defaultOptions,
            ...options,
        }
        list.push(notify)
        EventBus.emit(EVENT_NOTIFICATIONS_CHANGED, list)
        return notify
    },
    error(message: Message, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'error',
            ...options,
        })
    },
    success(message: Message, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'success',
            ...options,
        })
    },
    info(message: Message, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'info',
            ...options,
        })
    },
    warning(message: Message, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'warning',
            ...options,
        })
    },
    remove(notify: Notification) {
        const len = list.length
        list = list.filter(n => n.id !== notify.id)
        if (list.length !== len)
            EventBus.emit(EVENT_NOTIFICATIONS_CHANGED, list)
    },
}

export default Notifications

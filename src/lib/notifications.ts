import { EventBus, EVENT_NOTIFICATIONS_CHANGED } from "./eventbus"

let list: any[] = []

let idCounter = 0
let genNextId = () => {
    idCounter++
    return "" + idCounter
}

let defaultOptions: NotificationOptions = {
    ttl: 5000,
    type: 'info',
};

interface NotificationOptions {
    ttl?: number
    type?: 'info' | 'success' | 'error' | 'warning' | 'primary'
}

interface Notification extends NotificationOptions {
    id: string
    message: string
}

const Notifications = {
    add(message: string, options: NotificationOptions = {}): Notification {
        let notify = {
            id: genNextId(),
            message,
            ...defaultOptions,
            ...options,
        };
        list.push(notify)
        EventBus.emit(EVENT_NOTIFICATIONS_CHANGED, list)
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
    info(message: string, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'info',
            ...options,
        })
    },
    warning(message: string, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'warning',
            ...options,
        })
    },
    remove(notify: Notification) {
        let len = list.length
        list = list.filter(n => n.id !== notify.id)
        if (list.length !== len)
            EventBus.emit(EVENT_NOTIFICATIONS_CHANGED, list)
    },
}

export default Notifications

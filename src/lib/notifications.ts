let list: any[] = []

let idCounter = 0
let genNextId = () => {
    idCounter++
    return "" + idCounter
}

let listeners: any[] = [];
let notifyListeners = () => {
    listeners.forEach(h => h(list))
}

const subscribeNotificationChange = (handler: (arg0: Notification[]) => void) => {
    listeners.push(handler)
}

const unsubscribeNotificationChange = (handler: (arg0: Notification[]) => void) => {
    listeners = listeners.filter(elem => {
        return elem !== handler
    })
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
        notifyListeners()
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
            notifyListeners()
    },
}

export default Notifications
export { subscribeNotificationChange, unsubscribeNotificationChange }

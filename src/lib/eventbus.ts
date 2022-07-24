type Handler = (data?: any) => void
type EventType = string | symbol

const _events: {
    [key: EventType]: Handler[];
} = {}

export const EventBus = {
    on(event: EventType, handler: Handler) {
        if (_events[event])
            _events[event].push(handler)
        else
            _events[event] = [handler]
        return () => this.off(event, handler)
    },

    off(event: EventType, handler: Handler) {
        let list = _events[event]
        if (list) {
            list = list.filter(h => h != handler)
            if (list.length)
                _events[event] = list
            else
                delete _events[event]
        }
    },

    emit(event: EventType, data?: any) {
        _events[event]?.forEach(handler => handler(data))
    }
}

export const EVENT_UPDATE_PAYMENTS = Symbol('payments.update')
export const EVENT_NOTIFICATIONS_CHANGED = Symbol('notifications.changed')

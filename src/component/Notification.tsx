import classNames from 'classnames';
import { useEffect, useState, useRef } from 'react';

let list: any[] = [];

let idCounter = 0;
let genNextId = () => {
    idCounter++;
    return "" + idCounter;
};

let hooks: any[] = [];
let callHooks = () => {
    hooks.forEach(h => h(list));
};

let defaultNotification: NotificationOptions = {
    ttl: 5000,
    type: 'info',
};

interface NotificationOptions {
    ttl?: number;
    type?: 'info' | 'success' | 'error';
}

interface Notification extends NotificationOptions {
    id: string;
    message: string;
}

export const Notifications = {
    add(message: string, options: NotificationOptions = {}): Notification {
        let notify = {
            id: genNextId(),
            message,
            ...defaultNotification,
            ...options,
        };
        list.push(notify);
        callHooks();
        return notify;
    },
    error(message: string, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'error',
            ...options,
        });
    },
    success(message: string, options: NotificationOptions = {}): Notification {
        return this.add(message, {
            type: 'success',
            ...options,
        });
    },
    remove(notify: Notification) {
        let len = list.length;
        list = list.filter(n => n.id !== notify.id);
        if (list.length !== len)
            callHooks();
    },
};

let NotificationComponent = ({ notify }: { notify: Notification }) => {
    let ref = useRef(null);

    let color = classNames({
        'bg-info': notify.type === 'info',
        'bg-danger': notify.type === 'error',
        'bg-success': notify.type === 'success',
    });

    return (
        <div ref={ref} className={"toast align-items-center text-white border-0 " + color} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
                <div className="toast-body">
                    {notify.message}
                </div>
                <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    );
};

export const NotificationBox = () => {
    let [list, setList] = useState<Notification[]>([]);

    useEffect(() => {
        let handler = (data: Notification[]) => {
            setList([...data]);
        };
        hooks.push(handler);
        return () => {
            hooks = hooks.filter(elem => {
                return elem !== handler;
            });
        };
    }, []);

    return (
        <div className="toast-container position-fixed top-0 end-0 p-3">
            {list.map(n => <NotificationComponent key={n.id} notify={n} />)}
        </div>
    )
}

let cachedToken = localStorage['at']

interface ApiRequestInit extends Omit<RequestInit, 'headers'> {
    headers?: Record<string, string>;
}

export const fetchApi = async (path: string, options: ApiRequestInit = {}) => {
    if (cachedToken) {
        if (options.headers) {
            options.headers['Authorization'] = 'Bearer ' + cachedToken
        } else {
            options.headers = {
                'Authorization': 'Bearer ' + cachedToken,
            };
        }
    }

    const url = import.meta.env.VITE_API_ENDPOINT + path
    return fetch(url, options)
}

export const setToken = (token?: string) => {
    cachedToken = token
    if (token)
        localStorage.setItem('at', token)
    else
        localStorage.removeItem('at')
}

export const getToken = (): string => {
    return cachedToken
}

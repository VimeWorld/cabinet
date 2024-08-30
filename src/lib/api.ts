import Cookies from 'js-cookie';

let cachedToken = localStorage.getItem('at') || Cookies.get('vw-auth-token') || ''

interface ApiRequestInit extends Omit<RequestInit, 'headers'> {
    headers?: Record<string, string>;
}

function setHeader(options: ApiRequestInit, name: string, value: string) {
    options.headers = options.headers || {}
    options.headers[name] = value
}

// https://stackoverflow.com/a/8511350/6620659
function isObject(val: unknown): boolean {
    return typeof val === 'object' &&
        !Array.isArray(val) &&
        val !== null
}

export const fetchApi = async (path: string, options: ApiRequestInit = {}) => {
    if (cachedToken)
        setHeader(options, 'Authorization', 'Bearer ' + cachedToken)

    if (isObject(options.body) && !(options.body instanceof FormData)) {
        options.body = JSON.stringify(options.body)
        setHeader(options, 'Content-Type', 'application/json')
    }

    setHeader(options, 'Accept', 'application/json')

    const url = import.meta.env.VITE_API_ENDPOINT + path
    return fetch(url, options)
}

export const setToken = (token?: string) => {
    cachedToken = token || ''
    if (token)
        localStorage.setItem('at', token)
    else
        localStorage.removeItem('at')
}

export const getToken = (): string => {
    return cachedToken
}

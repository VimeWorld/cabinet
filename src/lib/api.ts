import { v4 as uuidv4, validate as isValidUuid } from 'uuid';

let cachedToken = localStorage.getItem('at') || ''
let tuuid = (() => {
    let uuid = localStorage.getItem('tuuid') || ''
    if (isValidUuid(uuid))
        return uuid
    uuid = uuidv4()
    localStorage.setItem('tuuid', uuid)
    return uuid
})()

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
    cachedToken = token || ''
    console.log('setToken', token)
    if (token)
        localStorage.setItem('at', token)
    else
        localStorage.removeItem('at')
}

export const getToken = (): string => {
    console.log('getToken', cachedToken)
    return cachedToken
}

export const getTuuid = (): string => {
    return tuuid
}

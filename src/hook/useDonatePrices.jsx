import { useCallback, useEffect, useState } from "react"
import { fetchApi } from "../lib/api"

const useDonatePrices = () => {
    const [prices, setPrices] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const load = useCallback(() => {
            setLoading(true)
            setError(false)
            setPrices(null)
            fetchApi('/user/prices')
                .then(r => r.json())
                .then(body => {
                    if (body.success)
                        setPrices(body.response)
                    else
                        setError(true)
                })
                .catch(() => setError(true))
                .finally(() => setLoading(false))
        }, [])
    
    useEffect(load, [])
    
    return {
        prices,
        loading,
        error,
        load,
        setPrices,
    }
}

export default useDonatePrices
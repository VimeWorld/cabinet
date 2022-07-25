import { useEffect, useState } from "react"
import { IdPagination } from "../component/Pagination"

const hasPages = (pagination: any) => {
    return pagination && (pagination.prev.length > 0 || pagination.next.length > 0)
}

const useLoadPages = (
    request: (id: number) => Promise<Response>
) => {
    const [id, setId] = useState(0)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const load = () => {
        if (loading) return
        setLoading(true)
        request(id).then(response => {
            if (!response.ok)
                throw new Error('Invalid response')
            return response.json()
        }).then(body => {
            //setTimeout(() => {
            setError(null)
            setData(body.response)
            //}, 1000)
        }).catch(e => {
            //setTimeout(() => {
            setError(e)
            setData(null)
            //}, 1000)
        }).finally(() =>
            //setTimeout(() => {
            setLoading(false)
            //}, 1000)
        )
    }

    useEffect(load, [id])

    return {
        id,
        setId,
        loading,
        error,
        load,

        items: data?.items,
        hasPages: hasPages(data?.pagination),
        Pagination: <IdPagination
            pagination={data?.pagination}
            onChange={setId}
            disabled={loading}
        />
    }
}

export default useLoadPages

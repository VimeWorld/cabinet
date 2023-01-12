import { Spinner } from "react-bootstrap"

const maxPages = 5 // sync with server

export const IdPagination = ({ pagination, onChange, loading }) => {
    if (!pagination)
        return <></>

    let { prev, next, has_more } = pagination

    if (prev.length === maxPages && prev[maxPages - 1] !== 0)
        prev = [...prev, 0]

    if (next.length > 0 && has_more)
        next = [...next, -1]

    let itemClassName = 'page-item'
    if (loading)
        itemClassName += ' disabled'
    let ulClassName = 'pagination mb-0 justify-content-center'
    if (loading)
        ulClassName += ' opacity-75'

    return <ul className={ulClassName}>
        {prev.map((page, idx) => {
            let name = idx + 1
            if (page === 0)
                name = <i className="bi bi-chevron-bar-left" />
            else if (idx === 0)
                name = <i className="bi bi-chevron-left" />
            return <li key={page} className={itemClassName}>
                <button className="page-link" onClick={() => onChange(page)} disabled={loading}>{name}</button>
            </li>
        }).reverse()}

        <li className="page-item" aria-current="page">
            <button className="page-link active" disabled>
                {loading ?
                    <Spinner as="span" size="sm" /> :
                    <i className="bi bi-three-dots" />}
            </button>
        </li>

        {next.map((page, idx) => {
            let name = idx + 1
            if (page === -1 || (!has_more && idx === next.length - 1))
                name = <i className="bi bi-chevron-bar-right" />
            else if (idx === 0)
                name = <i className="bi bi-chevron-right" />
            return <li key={page} className={itemClassName}>
                <button className="page-link" onClick={() => onChange(page)} disabled={loading}>{name}</button>
            </li>
        })}
    </ul>
}

export const IdPagination = ({ prev, next, hasMore, onChange, disabled }) => {
    if (prev.length == 5 && prev[4] != 0)
        prev = [...prev, 0]

    if (next.length > 0 && hasMore)
        next = [...next, -1]

    let itemClassName = 'page-item'
    if (disabled)
        itemClassName += ' disabled'

    return <ul className="pagination justify-content-center">
        {prev.map((page, idx) => {
            let name = idx + 1
            if (page == 0)
                name = <i className="bi bi-chevron-bar-left" />
            else if (idx == 0)
                name = <i className="bi bi-chevron-left" />
            return <li key={page} className={itemClassName}>
                <button className="page-link" onClick={() => onChange(page)} disabled={disabled}>{name}</button>
            </li>
        }).reverse()}

        <li className="page-item" aria-current="page">
            <button className="page-link active" disabled>...</button>
        </li>

        {next.map((page, idx) => {
            let name = idx + 1
            if (page == -1 || (!hasMore && idx == next.length - 1))
                name = <i className="bi bi-chevron-bar-right" />
            else if (idx == 0)
                name = <i className="bi bi-chevron-right" />
            return <li key={page} className={itemClassName}>
                <button className="page-link" onClick={() => onChange(page)} disabled={disabled}>{name}</button>
            </li>
        })}
    </ul>
}

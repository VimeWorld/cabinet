export const IdPagination = ({ prev, next, hasMore, onChange }) => {
    if (prev.length == 5 && prev[4] != 0)
        prev = [...prev, 0]

    if (next.length > 0 && hasMore)
        next = [...next, -1]

    return <ul className="pagination justify-content-center">
        {prev.map((page, idx) => {
            let name = idx + 1
            if (page == 0)
                name = <i className="bi-chevron-bar-left" />
            else if (idx == 0)
                name = <i className="bi-chevron-left" />
            return <li key={page} className="page-item">
                <button className="page-link" onClick={() => onChange(page)}>{name}</button>
            </li>
        }).reverse()}

        <li className="page-item">
            <button className="page-link active" disabled>...</button>
        </li>

        {next.map((page, idx) => {
            let name = idx + 1
            if (page == -1 || (!hasMore && idx == next.length - 1))
                name = <i className="bi-chevron-bar-right" />
            else if (idx == 0)
                name = <i className="bi-chevron-right" />
            return <li key={page} className="page-item">
                <button className="page-link" onClick={() => onChange(page)}>{name}</button>
            </li>
        })}
    </ul>
}

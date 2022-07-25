import { useState } from "react"
import { Spinner } from "react-bootstrap"
import useLoadPages from "../hook/useLoadPages"
import { fetchApi } from "../lib/api"

export const PromoCard = () => {
    const [promo, setPromo] = useState('')

    const pages = useLoadPages(id => fetchApi('/cp/promo/history?count=10&id=' + id))

    return <div className="card" id="promo">
        <div className="card-header d-flex justify-content-between align-items-center">
            <div className="mb-0">
                <h4 className="mb-0">Промо-код</h4>
                <span>Если у вас есть промо-код, активируйте его и получите награду</span>
            </div>
            {pages.loading && <div>
                <Spinner animation="border" variant="secondary" />
            </div>}
        </div>

        <div className="card-body">
            <div className="d-flex">
                <input
                    className="form-control"
                    type="text"
                    value={promo}
                    onChange={e => setPromo(e.target.value)}
                    placeholder="XXX-XXXXXX-XX-XXXX"
                />
                <button className="btn btn-primary ms-3">Активировать</button>
            </div>
        </div>

        <div className="card-table table-responsive">
            <table className="table">
                <thead className="table-light">
                    <tr>
                        <th scope="col" className="border-bottom-0">Код</th>
                        <th scope="col" className="border-bottom-0">Дата</th>
                        <th scope="col" style={{ minWidth: 300 }} className="border-bottom-0">Описание</th>
                    </tr>
                </thead>
                <tbody>
                    {pages.loading && !pages.items && <tr><td className="placeholder-glow" colSpan="3">
                        <span className="placeholder bg-secondary col-1"></span>
                        <span className="placeholder bg-secondary col-10 ms-2"></span>
                    </td></tr>}

                    {pages.error && <tr><td className="text-center text-danger" colSpan="3">
                        При загрузке возникла ошибка
                    </td></tr>}

                    {pages.items?.length == 0 && <tr><td className="text-center text-muted" colSpan="3">
                        Вы еще не активировали ни одного кода...
                    </td></tr>}

                    {pages.items?.map(p => {
                        return <tr key={p.id}>
                            <td className="fit text-muted">{p.code}</td>
                            <td className="fit">{new Date(Date.parse(p.date)).toLocaleString()}</td>
                            <td>{p.info}</td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>

        {pages.hasPages &&
            <div className="card-body">
                {pages.Pagination}
            </div>}
    </div>
}

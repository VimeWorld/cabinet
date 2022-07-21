import { useState } from "react"

export const PromoCard = () => {
    const [promo, setPromo] = useState('')

    // TODO history, backend

    return <div className="card" id="promo">
        <div className="card-header">
            <h4 className="mb-0">Промо-код</h4>
            <span>Если у вас есть промо-код, активируйте его и получите награду</span>
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
    </div>
}

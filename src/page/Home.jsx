import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap"
import classNames from "classnames"
import { BalanceCard } from "../component/BalanceCard"
import { PromoCard } from "../component/PromoCard"
import { fetchApi } from "../lib/api"
import { AdditionalUsernamesCard } from "../component/AdditionalUsernamesCard"
import SkinCard from "../component/skin/SkinCard"
import useApp from "../hook/useApp"
import { useTitle } from "../hook/useTitle"
import { AlfaBankBanner } from "./Payments"

const PersonalInfoCard = () => {
    const { app } = useApp()
    const [emailHidden, setEmailHidden] = useState(true)

    let regTime = 'xx.xx.2012'
    const regUnix = Date.parse(app.user.reg_time)
    if (regUnix)
        regTime = new Date(regUnix).toLocaleDateString()

    let email = app.user.email
    if (emailHidden)
        email = email.replace(/^(.)(.*)(.@.*)$/,
            (_, a, b, c) => a + b.replace(/./g, '*') + c
        )

    return <div className="card">
        <div className="card-header">
            <h4 className="mb-0">Ваши данные</h4>
            <span>Информация об аккаунте</span>
        </div>
        <div className="card-body">
            <dl className="row mb-0">
                <dt className="col-sm-4">Ник</dt>
                <dd className="col-sm-8 user-select-all">{app.user.username}</dd>

                <dt className="col-sm-4">Регистрация</dt>
                <dd className="col-sm-8">{regTime}</dd>
            </dl>
        </div>
    </div>
}

const HomePage = () => {
    const { app } = useApp()
    const [searchParams] = useSearchParams()
    const [alfaLink, setAlfaLink] = useState(undefined)
    const [coinFlipGame, setCoinFlipGame] = useState(null)
    const [showCoinFlipModal, setShowCoinFlipModal] = useState(false)
    
    useEffect(() => {
        fetchApi('/user/alfa_link', {
            method: 'GET'
        }).then(r => r.json()).then(body => {
            if (body.success) {
                setAlfaLink(body.response.link);
            }
        });
    }, []);

    useEffect(() => {
        const coinFlipId = searchParams.get('coin_flip_id')
        if (coinFlipId) {
            fetchApi(`/server/minigames/coinflip_game?id=${coinFlipId}`, {
                method: 'GET'
            }).then(r => r.json()).then(body => {
                if (body.success && body.response) {
                    setCoinFlipGame(body.response)
                    setShowCoinFlipModal(true)
                }
            }).catch(err => {
                console.error('Error fetching coin flip game:', err)
            })
        }
    }, [searchParams]);

    const getCurrencyName = (currency) => {
        const mapping = {
            'COIN': 'Коины',
            'VIMER': 'Вимеры'
        }
        return mapping[currency] || currency
    }

    useTitle(app.user.username)
    return <>
        <div className="row mb-4 gy-4">
            <div className="col-lg-6 col-12">
                <PersonalInfoCard />
                <div className="mt-4">
                    <BalanceCard pay />
                </div>
            </div>

            <div className="col-lg-6 col-12">
                <SkinCard />
            </div>
        </div>
        <div className="row mb-4 gy-4">
            <div className="col-lg-6 col-12">
                <PromoCard />
            </div>
            <div className="col-lg-6 col-12">
                <AdditionalUsernamesCard />
            </div>
        </div>

        <Modal show={showCoinFlipModal} onHide={() => setShowCoinFlipModal(false)} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Информация об игре CoinFlip №{searchParams.get('coin_flip_id') || ''}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {coinFlipGame ? (
                    <>
                        <div className="row mb-4">
                            <div className="col-6 text-center">
                                <div 
                                    className={`d-inline-block p-3 ${coinFlipGame.owner_win ? 'border border-success border-3 rounded' : ''}`}
                                    style={{ position: 'relative', minWidth: '150px' }}
                                >
                                    {coinFlipGame.owner_win && (
                                        <div className="badge bg-success mb-2" style={{ fontSize: '0.75rem', display: 'block' }}>
                                            Победитель
                                        </div>
                                    )}
                                    <img 
                                        src={`https://skin.vimeworld.com/head/${coinFlipGame.owner_username || 'Steve'}.png`}
                                        alt={coinFlipGame.owner_username || 'Owner'}
                                        style={{ width: '64px', height: '64px', imageRendering: 'pixelated' }}
                                        className="mb-2"
                                    />
                                    <div className="mt-2">
                                        <div className="fw-bold">{coinFlipGame.owner_username || 'N/A'}</div>
                                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>ID: {coinFlipGame.owner_id}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 text-center">
                                <div 
                                    className={`d-inline-block p-3 ${!coinFlipGame.owner_win && coinFlipGame.second_player_id ? 'border border-success border-3 rounded' : ''}`}
                                    style={{ position: 'relative', minWidth: '150px' }}
                                >
                                    {!coinFlipGame.owner_win && coinFlipGame.second_player_id && (
                                        <div className="badge bg-success mb-2" style={{ fontSize: '0.75rem', display: 'block' }}>
                                            Победитель
                                        </div>
                                    )}
                                    {coinFlipGame.second_player_id ? (
                                        <>
                                            <img 
                                                src={`https://skin.vimeworld.com/head/${coinFlipGame.second_player_username || 'Steve'}.png`}
                                                alt={coinFlipGame.second_player_username || 'Second Player'}
                                                style={{ width: '64px', height: '64px', imageRendering: 'pixelated' }}
                                                className="mb-2"
                                            />
                                            <div className="mt-2">
                                                <div className="fw-bold">{coinFlipGame.second_player_username || 'N/A'}</div>
                                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>ID: {coinFlipGame.second_player_id}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-muted">Ожидание игрока...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <hr />
                        <dl className="row mb-0">
                            <dt className="col-sm-4">Валюта</dt>
                            <dd className="col-sm-8">{getCurrencyName(coinFlipGame.currency)}</dd>

                            <dt className="col-sm-4">Сумма</dt>
                            <dd className="col-sm-8">{coinFlipGame.amount}</dd>

                            <dt className="col-sm-4">Время</dt>
                            <dd className="col-sm-8">
                                {coinFlipGame.time ? new Date(coinFlipGame.time * 1000).toLocaleString() : 'N/A'}
                            </dd>

                            <dt className="col-sm-4">
                                WinnerIndex
                                <OverlayTrigger overlay={
                                    <Tooltip>
                                        Это значение = 0 если победил владелец ставки, и 1, если победил игрок который ее принял.
                                    </Tooltip>
                                }>
                                    <i className="bi bi-info-circle ms-1" style={{ cursor: 'help' }}></i>
                                </OverlayTrigger>
                            </dt>
                            <dd className="col-sm-8"><code className="user-select-all">{coinFlipGame.owner_win ? 0 : 1}</code></dd>

                            <dt className="col-sm-4">Salt</dt>
                            <dd className="col-sm-8"><code className="user-select-all">{coinFlipGame.salt}</code></dd>

                            <dt className="col-sm-4">Hash</dt>
                            <dd className="col-sm-8"><code className="user-select-all">{coinFlipGame.hash}</code></dd>
                        </dl>
                        <hr />
                        <div className="mt-3">
                            <h6 className="mb-3">Проверка честности выбора победителя</h6>
                            <p className="text-muted small mb-2">
                                Для проверки честности создайте строку <code>winnerIndex:salt</code>, вычислите SHA256 от неё и сравните результат (в base64) с полем Hash. Поле Hash должно совпадать с тем значением, которое вы могли увидеть и скопировать до начала игры.
                            </p>
                            <pre className={classNames("p-3 rounded", {
                                "bg-light text-dark": app.theme === 'light',
                                "bg-dark text-light": app.theme === 'dark'
                            })} style={{ fontSize: '0.85rem', overflowX: 'auto' }}>
                                <code>{`// Пример кода для проверки честности на JavaScript
const winnerIndex = ${coinFlipGame.owner_win ? 0 : 1};
const salt = "${coinFlipGame.salt}";
const expectedHash = "${coinFlipGame.hash}";

// Создаем строку winnerIndex:salt
const data = winnerIndex + ":" + salt;

// Вычисляем SHA256
const encoder = new TextEncoder();
const dataBuffer = encoder.encode(data);
const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

// Конвертируем в base64
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hashBase64 = btoa(String.fromCharCode(...hashArray));

console.log("Вычисленный hash:", hashBase64);
console.log("Ожидаемый hash:", expectedHash);
console.log("Хеши совпадают:", hashBase64 === expectedHash);`}</code>
                            </pre>
                        </div>
                    </>
                ) : (
                    <p>Загрузка...</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => setShowCoinFlipModal(false)}>Закрыть</button>
            </Modal.Footer>
        </Modal>
    </>
}

export default HomePage

import { useState, useCallback, useEffect } from "react";
import { Spinner, Button } from "react-bootstrap";
import { useTitle } from "../hook/useTitle";
import { fetchApi } from "../lib/api";
import Notifications from "../lib/notifications";
import useMinigamesProfile from "../hook/userMinigamesProfile";
import useDonatePrices from "../hook/useDonatePrices";
import useApp from "../hook/useApp";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../component/ConfirmModal";
import { ruPluralizeVimers } from "../lib/i18n";
import { EVENT_MINIGAMES_PROFILE_UPDATED, EventBus } from "../lib/eventbus";
import './MinigamesExclusives.css';

const ShimmerPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/shimmer.gif" 
            alt="Шиммер эффект" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const RainbowPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/rainbow.gif" 
            alt="Радужный эффект" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const ExclusiveProductCard = ({ title, description, price, PreviewComponent, onBuy, onToggle, disabled, isBought, isActive }) => {
    const showPrice = !isBought;
    const buttonText = isBought ? (isActive ? 'Выключить' : 'Включить') : 'Купить';
    const buttonVariant = isBought ? (isActive ? 'danger' : 'success') : 'primary';

    return (
        <div className="col-md-6 mb-4">
            <div className="card h-100">
                <div className="card-header">
                    <h4 className="mb-0">{title}</h4>
                    {isBought && (
                        <span className="badge bg-success ms-2">Куплено</span>
                    )}
                    {isActive && (
                        <span className="badge bg-info ms-2">Активно</span>
                    )}
                </div>
                <div className="card-body d-flex flex-column">
                    <div className="mb-3 text-center">
                        <PreviewComponent />
                    </div>
                    <p className="text-center mb-3">{description}</p>
                    {showPrice && (
                        <div className="text-center mb-3">
                            <span className="display-6 text-success">{price ? ruPluralizeVimers(price) : '—'}</span>
                        </div>
                    )}
                    <Button 
                        className={`btn btn-${buttonVariant} w-100 mt-auto`}
                        onClick={isBought ? onToggle : onBuy}
                        disabled={disabled || (!isBought && !price)}
                    >
                        {buttonText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const MinigamesExclusivesPage = () => {
    useTitle('Эксклюзивы MiniGames');
    const profile = useMinigamesProfile();
    const prices = useDonatePrices();
    const { app, fetchAuth } = useApp();
    const navigate = useNavigate();
    
    const [userServices, setUserServices] = useState(null);
    const [loadingServices, setLoadingServices] = useState(false);
    const [showConfirmShimmer, setShowConfirmShimmer] = useState(false);
    const [showConfirmRainbow, setShowConfirmRainbow] = useState(false);
    const [loadingShimmer, setLoadingShimmer] = useState(false);
    const [loadingRainbow, setLoadingRainbow] = useState(false);

    const shimmerPrice = prices.prices?.shimmer;
    const rainbowPrice = prices.prices?.rainbow;


    const shimmerBought = userServices?.shimmer_buyed || false;
    const shimmerActive = userServices?.shimmer_active || false;
    const rainbowBought = userServices?.rainbow_buyed || false;
    const rainbowActive = userServices?.rainbow_active || false;

    const loadUserServices = useCallback(() => {
        setLoadingServices(true);
        fetchApi('/server/minigames/user_services')
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    setUserServices(body.response);
                }
            })
            .catch(() => {})
            .finally(() => setLoadingServices(false));
    }, []);

    useEffect(() => {
        loadUserServices();
    }, [loadUserServices]);

    useEffect(() => {
        return EventBus.on(EVENT_MINIGAMES_PROFILE_UPDATED, () => {
            loadUserServices();
        });
    }, [loadUserServices]);

    const buyShimmer = () => {
        if (loadingShimmer) return;
        setLoadingShimmer(true);

        fetchApi('/server/minigames/buy_shimmer', {
            method: 'POST',
        })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно купили Шиммер');
                    setUserServices(body.response);
                    fetchAuth();
                } else if (body.response?.type === "insufficient_funds") {
                    Notifications.error('У вас недостаточно вимеров');
                    fetchAuth();
                } else {
                    Notifications.error('Произошла ошибка');
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                setLoadingShimmer(false);
                setShowConfirmShimmer(false);
            });
    };

    const buyRainbow = () => {
        if (loadingRainbow) return;
        setLoadingRainbow(true);

        fetchApi('/server/minigames/buy_rainbow', {
            method: 'POST',
        })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно купили Цветной ник');
                    setUserServices(body.response);
                    fetchAuth();
                } else if (body.response?.type === "insufficient_funds") {
                    Notifications.error('У вас недостаточно вимеров');
                    fetchAuth();
                } else {
                    Notifications.error('Произошла ошибка');
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                setLoadingRainbow(false);
                setShowConfirmRainbow(false);
            });
    };

    const toggleShimmer = () => {
        if (loadingShimmer) return;
        setLoadingShimmer(true);

        fetchApi('/server/minigames/toggle_shimmer', {
            method: 'POST',
        })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    const newActive = body.response.shimmer_active;
                    setUserServices(body.response);
                    Notifications.success(newActive ? 'Шиммер включен' : 'Шиммер выключен');
                } else {
                    Notifications.error('Произошла ошибка');
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                setLoadingShimmer(false);
            });
    };

    const toggleRainbow = () => {
        if (loadingRainbow) return;
        setLoadingRainbow(true);

        fetchApi('/server/minigames/toggle_rainbow', {
            method: 'POST',
        })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    const newActive = body.response.rainbow_active;
                    setUserServices(body.response);
                    Notifications.success(newActive ? 'Цветной ник включен' : 'Цветной ник выключен');
                } else {
                    Notifications.error('Произошла ошибка');
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                setLoadingRainbow(false);
            });
    };

    if (!profile.profile) {
        return (
            <div className='card'>
                <div className="card-header">
                    <h4 className="mb-0">Эксклюзивы MiniGames</h4>
                    <span>Эксклюзивные возможности для игроков</span>
                </div>
                <div className='card-body'>
                    {profile.loading && <div className='text-center'><Spinner variant='secondary' /></div>}
                    {profile.error && <div className='text-center text-danger'>При загрузке произошла ошибка</div>}
                </div>
            </div>
        );
    }

    const totalBalance = app.user.cash + app.user.cash_bonuses;

    return (
        <>
            <div className='card'>
                <div className="card-header">
                    <h4 className="mb-0">Эксклюзивы MiniGames</h4>
                    <span>Эксклюзивные возможности для игроков</span>
                </div>
                <div className='card-body'>
                    {(prices.loading || loadingServices) ? (
                        <div className='text-center'><Spinner variant='secondary' /></div>
                    ) : (
                        <div className="row">
                            <ExclusiveProductCard
                                title="Шиммер"
                                description="Блестящий ник"
                                price={shimmerPrice}
                                PreviewComponent={ShimmerPreview}
                                onBuy={() => setShowConfirmShimmer(true)}
                                onToggle={toggleShimmer}
                                disabled={loadingShimmer}
                                isBought={shimmerBought}
                                isActive={shimmerActive}
                            />
                            <ExclusiveProductCard
                                title="Цветной ник"
                                description="Ник переливающийся цветами"
                                price={rainbowPrice}
                                PreviewComponent={RainbowPreview}
                                onBuy={() => setShowConfirmRainbow(true)}
                                onToggle={toggleRainbow}
                                disabled={loadingRainbow}
                                isBought={rainbowBought}
                                isActive={rainbowActive}
                            />
                        </div>
                    )}
                </div>
            </div>

            {!shimmerBought && shimmerPrice && (totalBalance < shimmerPrice ? (
                <ConfirmModal 
                    show={showConfirmShimmer} 
                    close={() => setShowConfirmShimmer(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки Шиммер.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmShimmer} 
                    close={() => setShowConfirmShimmer(false)}
                    confirmText="Купить"
                    onConfirm={buyShimmer}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить Шиммер за <b className="text-success">{ruPluralizeVimers(shimmerPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!rainbowBought && rainbowPrice && (totalBalance < rainbowPrice ? (
                <ConfirmModal 
                    show={showConfirmRainbow} 
                    close={() => setShowConfirmRainbow(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки Цветной ник.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmRainbow} 
                    close={() => setShowConfirmRainbow(false)}
                    confirmText="Купить"
                    onConfirm={buyRainbow}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить Цветной ник за <b className="text-success">{ruPluralizeVimers(rainbowPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}
        </>
    );
};

export default MinigamesExclusivesPage;

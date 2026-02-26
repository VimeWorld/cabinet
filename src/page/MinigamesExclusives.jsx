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

const ShakingPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/shaking.gif" 
            alt="Трясущийся эффект" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const WavingPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/waving.gif" 
            alt="Волновой эффект" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const AberrationPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/aberration.gif" 
            alt="Эффект с помехами" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const FlipPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/flip.gif" 
            alt="Переворачивающиеся буквы" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const HeartsPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/hearts.gif" 
            alt="Ник с сердечками" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const GradientPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/gradient.gif" 
            alt="Ник с градиентом" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const ClownsPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/clowns.gif" 
            alt="Ник клоуны" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const EzPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/ez.gif" 
            alt="Ник с EZ" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const TntPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/tnt.gif" 
            alt="Ник с TNT" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const GrassPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/grass.gif" 
            alt="Ник с травой" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const BlockPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/block.gif" 
            alt="Ник с блоком" 
            style={{ maxWidth: '400px', width: '100%', height: 'auto' }}
        />
    );
};

const AfkPreview = () => {
    return (
        <img 
            src="/assets/image/exclusives/afk.gif" 
            alt="Ник с AFK" 
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
    const [showConfirmShaking, setShowConfirmShaking] = useState(false);
    const [showConfirmWaving, setShowConfirmWaving] = useState(false);
    const [showConfirmAberration, setShowConfirmAberration] = useState(false);
    const [showConfirmFlip, setShowConfirmFlip] = useState(false);
    const [showConfirmHearts, setShowConfirmHearts] = useState(false);
    const [showConfirmGradient, setShowConfirmGradient] = useState(false);
    const [showConfirmClowns, setShowConfirmClowns] = useState(false);
    const [showConfirmEz, setShowConfirmEz] = useState(false);
    const [showConfirmTnt, setShowConfirmTnt] = useState(false);
    const [showConfirmGrass, setShowConfirmGrass] = useState(false);
    const [showConfirmBlock, setShowConfirmBlock] = useState(false);
    const [showConfirmAfk, setShowConfirmAfk] = useState(false);
    const [loadingShimmer, setLoadingShimmer] = useState(false);
    const [loadingRainbow, setLoadingRainbow] = useState(false);
    const [loadingShaking, setLoadingShaking] = useState(false);
    const [loadingWaving, setLoadingWaving] = useState(false);
    const [loadingAberration, setLoadingAberration] = useState(false);
    const [loadingFlip, setLoadingFlip] = useState(false);
    const [loadingHearts, setLoadingHearts] = useState(false);
    const [loadingGradient, setLoadingGradient] = useState(false);
    const [loadingClowns, setLoadingClowns] = useState(false);
    const [loadingEz, setLoadingEz] = useState(false);
    const [loadingTnt, setLoadingTnt] = useState(false);
    const [loadingGrass, setLoadingGrass] = useState(false);
    const [loadingBlock, setLoadingBlock] = useState(false);
    const [loadingAfk, setLoadingAfk] = useState(false);

    const shimmerPrice = prices.prices?.shimmer;
    const rainbowPrice = prices.prices?.rainbow;
    const shakingPrice = prices.prices?.shaking;
    const wavingPrice = prices.prices?.waving;
    const aberrationPrice = prices.prices?.aberration;
    const flipPrice = prices.prices?.flip;
    const heartsPrice = prices.prices?.hearts;
    const gradientPrice = prices.prices?.gradient;
    const clownsPrice = prices.prices?.clowns;
    const ezPrice = prices.prices?.ez;
    const tntPrice = prices.prices?.tnt;
    const grassPrice = prices.prices?.grass;
    const blockPrice = prices.prices?.block;
    const afkPrice = prices.prices?.afk;


    const shimmerBought = userServices?.shimmer_buyed || false;
    const shimmerActive = userServices?.shimmer_active || false;
    const rainbowBought = userServices?.rainbow_buyed || false;
    const rainbowActive = userServices?.rainbow_active || false;
    const shakingBought = userServices?.shaking_buyed || false;
    const shakingActive = userServices?.shaking_active || false;
    const wavingBought = userServices?.waving_buyed || false;
    const wavingActive = userServices?.waving_active || false;
    const aberrationBought = userServices?.aberration_buyed || false;
    const aberrationActive = userServices?.aberration_active || false;
    const flipBought = userServices?.flip_buyed || false;
    const flipActive = userServices?.flip_active || false;
    const heartsBought = userServices?.hearts_buyed || false;
    const heartsActive = userServices?.hearts_active || false;
    const gradientBought = userServices?.gradient_buyed || false;
    const gradientActive = userServices?.gradient_active || false;
    const clownsBought = userServices?.clowns_buyed || false;
    const clownsActive = userServices?.clowns_active || false;
    const ezBought = userServices?.ez_buyed || false;
    const ezActive = userServices?.ez_active || false;
    const tntBought = userServices?.tnt_buyed || false;
    const tntActive = userServices?.tnt_active || false;
    const grassBought = userServices?.grass_buyed || false;
    const grassActive = userServices?.grass_active || false;
    const blockBought = userServices?.block_buyed || false;
    const blockActive = userServices?.block_active || false;
    const afkBought = userServices?.afk_buyed || false;
    const afkActive = userServices?.afk_active || false;

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

    const buyService = (service, {
        loading,
        setLoading,
        setShowConfirm,
        successMessage,
    }) => {
        if (loading) return;
        setLoading(true);

        fetchApi('/server/minigames/buy_service', {
            method: 'POST',
            body: { service },
        })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success(successMessage);
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
                setLoading(false);
                setShowConfirm(false);
            });
    };

    const toggleService = (service, {
        loading,
        setLoading,
        enabledMessage,
        disabledMessage,
    }) => {
        if (loading) return;
        setLoading(true);

        fetchApi('/server/minigames/toggle_service', {
            method: 'POST',
            body: { service },
        })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    const newActive = body.response?.[`${service}_active`];
                    setUserServices(body.response);
                    Notifications.success(newActive ? enabledMessage : disabledMessage);
                } else {
                    Notifications.error('Произошла ошибка');
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                setLoading(false);
            });
    };

    const buyShimmer = () => buyService('shimmer', {
        loading: loadingShimmer,
        setLoading: setLoadingShimmer,
        setShowConfirm: setShowConfirmShimmer,
        successMessage: 'Вы успешно купили Шиммер',
    });

    const buyRainbow = () => buyService('rainbow', {
        loading: loadingRainbow,
        setLoading: setLoadingRainbow,
        setShowConfirm: setShowConfirmRainbow,
        successMessage: 'Вы успешно купили Цветной ник',
    });

    const buyShaking = () => buyService('shaking', {
        loading: loadingShaking,
        setLoading: setLoadingShaking,
        setShowConfirm: setShowConfirmShaking,
        successMessage: 'Вы успешно купили трясущийся ник',
    });

    const buyWaving = () => buyService('waving', {
        loading: loadingWaving,
        setLoading: setLoadingWaving,
        setShowConfirm: setShowConfirmWaving,
        successMessage: 'Вы успешно купили волновой ник',
    });

    const buyAberration = () => buyService('aberration', {
        loading: loadingAberration,
        setLoading: setLoadingAberration,
        setShowConfirm: setShowConfirmAberration,
        successMessage: 'Вы успешно купили ник с помехами',
    });

    const buyFlip = () => buyService('flip', {
        loading: loadingFlip,
        setLoading: setLoadingFlip,
        setShowConfirm: setShowConfirmFlip,
        successMessage: 'Вы успешно купили ник с переворачивающимися буквами',
    });

    const buyHearts = () => buyService('hearts', {
        loading: loadingHearts,
        setLoading: setLoadingHearts,
        setShowConfirm: setShowConfirmHearts,
        successMessage: 'Вы успешно купили ник с сердечками',
    });

    const buyGradient = () => buyService('gradient', {
        loading: loadingGradient,
        setLoading: setLoadingGradient,
        setShowConfirm: setShowConfirmGradient,
        successMessage: 'Вы успешно купили ник с градиентом',
    });

    const buyClowns = () => buyService('clowns', {
        loading: loadingClowns,
        setLoading: setLoadingClowns,
        setShowConfirm: setShowConfirmClowns,
        successMessage: 'Вы успешно купили ник клоуны',
    });

    const buyEz = () => buyService('ez', {
        loading: loadingEz,
        setLoading: setLoadingEz,
        setShowConfirm: setShowConfirmEz,
        successMessage: 'Вы успешно купили ник с EZ',
    });

    const buyTnt = () => buyService('tnt', {
        loading: loadingTnt,
        setLoading: setLoadingTnt,
        setShowConfirm: setShowConfirmTnt,
        successMessage: 'Вы успешно купили ник с TNT',
    });

    const buyGrass = () => buyService('grass', {
        loading: loadingGrass,
        setLoading: setLoadingGrass,
        setShowConfirm: setShowConfirmGrass,
        successMessage: 'Вы успешно купили ник с травой',
    });

    const buyBlock = () => buyService('block', {
        loading: loadingBlock,
        setLoading: setLoadingBlock,
        setShowConfirm: setShowConfirmBlock,
        successMessage: 'Вы успешно купили ник с блоком',
    });

    const buyAfk = () => buyService('afk', {
        loading: loadingAfk,
        setLoading: setLoadingAfk,
        setShowConfirm: setShowConfirmAfk,
        successMessage: 'Вы успешно купили ник с AFK',
    });

    const toggleShimmer = () => toggleService('shimmer', {
        loading: loadingShimmer,
        setLoading: setLoadingShimmer,
        enabledMessage: 'Шиммер включен',
        disabledMessage: 'Шиммер выключен',
    });

    const toggleRainbow = () => toggleService('rainbow', {
        loading: loadingRainbow,
        setLoading: setLoadingRainbow,
        enabledMessage: 'Цветной ник включен',
        disabledMessage: 'Цветной ник выключен',
    });

    const toggleShaking = () => toggleService('shaking', {
        loading: loadingShaking,
        setLoading: setLoadingShaking,
        enabledMessage: 'Трясущийся ник включен',
        disabledMessage: 'Трясущийся ник выключен',
    });

    const toggleWaving = () => toggleService('waving', {
        loading: loadingWaving,
        setLoading: setLoadingWaving,
        enabledMessage: 'Волновой ник включен',
        disabledMessage: 'Волновой ник выключен',
    });

    const toggleAberration = () => toggleService('aberration', {
        loading: loadingAberration,
        setLoading: setLoadingAberration,
        enabledMessage: 'Ник с помехами включен',
        disabledMessage: 'Ник с помехами выключен',
    });

    const toggleFlip = () => toggleService('flip', {
        loading: loadingFlip,
        setLoading: setLoadingFlip,
        enabledMessage: 'Ник с переворачивающимися буквами включен',
        disabledMessage: 'Ник с переворачивающимися буквами выключен',
    });

    const toggleHearts = () => toggleService('hearts', {
        loading: loadingHearts,
        setLoading: setLoadingHearts,
        enabledMessage: 'Ник с сердечками включен',
        disabledMessage: 'Ник с сердечками выключен',
    });

    const toggleGradient = () => toggleService('gradient', {
        loading: loadingGradient,
        setLoading: setLoadingGradient,
        enabledMessage: 'Ник с градиентом включен',
        disabledMessage: 'Ник с градиентом выключен',
    });

    const toggleClowns = () => toggleService('clowns', {
        loading: loadingClowns,
        setLoading: setLoadingClowns,
        enabledMessage: 'Ник клоуны включен',
        disabledMessage: 'Ник клоуны выключен',
    });

    const toggleEz = () => toggleService('ez', {
        loading: loadingEz,
        setLoading: setLoadingEz,
        enabledMessage: 'Ник с EZ включен',
        disabledMessage: 'Ник с EZ выключен',
    });

    const toggleTnt = () => toggleService('tnt', {
        loading: loadingTnt,
        setLoading: setLoadingTnt,
        enabledMessage: 'Ник с TNT включен',
        disabledMessage: 'Ник с TNT выключен',
    });

    const toggleGrass = () => toggleService('grass', {
        loading: loadingGrass,
        setLoading: setLoadingGrass,
        enabledMessage: 'Ник с травой включен',
        disabledMessage: 'Ник с травой выключен',
    });

    const toggleBlock = () => toggleService('block', {
        loading: loadingBlock,
        setLoading: setLoadingBlock,
        enabledMessage: 'Ник с блоком включен',
        disabledMessage: 'Ник с блоком выключен',
    });

    const toggleAfk = () => toggleService('afk', {
        loading: loadingAfk,
        setLoading: setLoadingAfk,
        enabledMessage: 'Ник с AFK включен',
        disabledMessage: 'Ник с AFK выключен',
    });

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
                    <span>Эксклюзивные возможности для игроков. Покупается навсегда. Каждую возможность можно включать и выключать по кнопке. Также эффекты ника можно сочетать между собой</span>
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
                            <ExclusiveProductCard
                                title="Трясущийся ник"
                                description="Ник с эффектом тряски"
                                price={shakingPrice}
                                PreviewComponent={ShakingPreview}
                                onBuy={() => setShowConfirmShaking(true)}
                                onToggle={toggleShaking}
                                disabled={loadingShaking}
                                isBought={shakingBought}
                                isActive={shakingActive}
                            />
                            <ExclusiveProductCard
                                title="Волновой ник"
                                description="Ник с эффектом волны"
                                price={wavingPrice}
                                PreviewComponent={WavingPreview}
                                onBuy={() => setShowConfirmWaving(true)}
                                onToggle={toggleWaving}
                                disabled={loadingWaving}
                                isBought={wavingBought}
                                isActive={wavingActive}
                            />
                            <ExclusiveProductCard
                                title="Ник с помехами"
                                description="Ник с эффектом помех и искажений"
                                price={aberrationPrice}
                                PreviewComponent={AberrationPreview}
                                onBuy={() => setShowConfirmAberration(true)}
                                onToggle={toggleAberration}
                                disabled={loadingAberration}
                                isBought={aberrationBought}
                                isActive={aberrationActive}
                            />
                            <ExclusiveProductCard
                                title="Переворачивающийся ник"
                                description="Ник с переворачивающимися буквами"
                                price={flipPrice}
                                PreviewComponent={FlipPreview}
                                onBuy={() => setShowConfirmFlip(true)}
                                onToggle={toggleFlip}
                                disabled={loadingFlip}
                                isBought={flipBought}
                                isActive={flipActive}
                            />
                            <ExclusiveProductCard
                                title="Ник с сердечками"
                                description="Ник с сердечками"
                                price={heartsPrice}
                                PreviewComponent={HeartsPreview}
                                onBuy={() => setShowConfirmHearts(true)}
                                onToggle={toggleHearts}
                                disabled={loadingHearts}
                                isBought={heartsBought}
                                isActive={heartsActive}
                            />
                            <ExclusiveProductCard
                                title="Ник с градиентом"
                                description="Ник с переливающимся градиентом"
                                price={gradientPrice}
                                PreviewComponent={GradientPreview}
                                onBuy={() => setShowConfirmGradient(true)}
                                onToggle={toggleGradient}
                                disabled={loadingGradient}
                                isBought={gradientBought}
                                isActive={gradientActive}
                            />
                            <ExclusiveProductCard
                                title="Клоуны"
                                description="Ник клоуны"
                                price={clownsPrice}
                                PreviewComponent={ClownsPreview}
                                onBuy={() => setShowConfirmClowns(true)}
                                onToggle={toggleClowns}
                                disabled={loadingClowns}
                                isBought={clownsBought}
                                isActive={clownsActive}
                            />
                            <ExclusiveProductCard
                                title="Ник с EZ"
                                description="Ник с EZ"
                                price={ezPrice}
                                PreviewComponent={EzPreview}
                                onBuy={() => setShowConfirmEz(true)}
                                onToggle={toggleEz}
                                disabled={loadingEz}
                                isBought={ezBought}
                                isActive={ezActive}
                            />
                            <ExclusiveProductCard
                                title="Ник с TNT"
                                description="Ник с TNT"
                                price={tntPrice}
                                PreviewComponent={TntPreview}
                                onBuy={() => setShowConfirmTnt(true)}
                                onToggle={toggleTnt}
                                disabled={loadingTnt}
                                isBought={tntBought}
                                isActive={tntActive}
                            />
                            <ExclusiveProductCard
                                title="Ник с травой"
                                description="Ник с травой"
                                price={grassPrice}
                                PreviewComponent={GrassPreview}
                                onBuy={() => setShowConfirmGrass(true)}
                                onToggle={toggleGrass}
                                disabled={loadingGrass}
                                isBought={grassBought}
                                isActive={grassActive}
                            />
                            <ExclusiveProductCard
                                title="Ник с блоком"
                                description="Ник с блоком"
                                price={blockPrice}
                                PreviewComponent={BlockPreview}
                                onBuy={() => setShowConfirmBlock(true)}
                                onToggle={toggleBlock}
                                disabled={loadingBlock}
                                isBought={blockBought}
                                isActive={blockActive}
                            />
                            <ExclusiveProductCard
                                title="Ник с AFK"
                                description="Ник с AFK"
                                price={afkPrice}
                                PreviewComponent={AfkPreview}
                                onBuy={() => setShowConfirmAfk(true)}
                                onToggle={toggleAfk}
                                disabled={loadingAfk}
                                isBought={afkBought}
                                isActive={afkActive}
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

            {!shakingBought && shakingPrice && (totalBalance < shakingPrice ? (
                <ConfirmModal 
                    show={showConfirmShaking} 
                    close={() => setShowConfirmShaking(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки трясущегося ника.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmShaking} 
                    close={() => setShowConfirmShaking(false)}
                    confirmText="Купить"
                    onConfirm={buyShaking}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить трясущийся ник за <b className="text-success">{ruPluralizeVimers(shakingPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!wavingBought && wavingPrice && (totalBalance < wavingPrice ? (
                <ConfirmModal 
                    show={showConfirmWaving} 
                    close={() => setShowConfirmWaving(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки волнового ника.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmWaving} 
                    close={() => setShowConfirmWaving(false)}
                    confirmText="Купить"
                    onConfirm={buyWaving}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить волновой ник за <b className="text-success">{ruPluralizeVimers(wavingPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!aberrationBought && aberrationPrice && (totalBalance < aberrationPrice ? (
                <ConfirmModal 
                    show={showConfirmAberration} 
                    close={() => setShowConfirmAberration(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с помехами.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmAberration} 
                    close={() => setShowConfirmAberration(false)}
                    confirmText="Купить"
                    onConfirm={buyAberration}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с помехами за <b className="text-success">{ruPluralizeVimers(aberrationPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!flipBought && flipPrice && (totalBalance < flipPrice ? (
                <ConfirmModal 
                    show={showConfirmFlip} 
                    close={() => setShowConfirmFlip(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с переворачивающимися буквами.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmFlip} 
                    close={() => setShowConfirmFlip(false)}
                    confirmText="Купить"
                    onConfirm={buyFlip}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с переворачивающимися буквами за <b className="text-success">{ruPluralizeVimers(flipPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!heartsBought && heartsPrice && (totalBalance < heartsPrice ? (
                <ConfirmModal 
                    show={showConfirmHearts} 
                    close={() => setShowConfirmHearts(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с сердечками.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmHearts} 
                    close={() => setShowConfirmHearts(false)}
                    confirmText="Купить"
                    onConfirm={buyHearts}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с сердечками за <b className="text-success">{ruPluralizeVimers(heartsPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!gradientBought && gradientPrice && (totalBalance < gradientPrice ? (
                <ConfirmModal 
                    show={showConfirmGradient} 
                    close={() => setShowConfirmGradient(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с градиентом.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmGradient} 
                    close={() => setShowConfirmGradient(false)}
                    confirmText="Купить"
                    onConfirm={buyGradient}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с градиентом за <b className="text-success">{ruPluralizeVimers(gradientPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!clownsBought && clownsPrice && (totalBalance < clownsPrice ? (
                <ConfirmModal 
                    show={showConfirmClowns} 
                    close={() => setShowConfirmClowns(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника клоуны.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmClowns} 
                    close={() => setShowConfirmClowns(false)}
                    confirmText="Купить"
                    onConfirm={buyClowns}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник клоуны за <b className="text-success">{ruPluralizeVimers(clownsPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!ezBought && ezPrice && (totalBalance < ezPrice ? (
                <ConfirmModal 
                    show={showConfirmEz} 
                    close={() => setShowConfirmEz(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с EZ.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmEz} 
                    close={() => setShowConfirmEz(false)}
                    confirmText="Купить"
                    onConfirm={buyEz}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с EZ за <b className="text-success">{ruPluralizeVimers(ezPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!tntBought && tntPrice && (totalBalance < tntPrice ? (
                <ConfirmModal 
                    show={showConfirmTnt} 
                    close={() => setShowConfirmTnt(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с TNT.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmTnt} 
                    close={() => setShowConfirmTnt(false)}
                    confirmText="Купить"
                    onConfirm={buyTnt}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с TNT за <b className="text-success">{ruPluralizeVimers(tntPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!grassBought && grassPrice && (totalBalance < grassPrice ? (
                <ConfirmModal 
                    show={showConfirmGrass} 
                    close={() => setShowConfirmGrass(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с травой.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmGrass} 
                    close={() => setShowConfirmGrass(false)}
                    confirmText="Купить"
                    onConfirm={buyGrass}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с травой за <b className="text-success">{ruPluralizeVimers(grassPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!blockBought && blockPrice && (totalBalance < blockPrice ? (
                <ConfirmModal 
                    show={showConfirmBlock} 
                    close={() => setShowConfirmBlock(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с блоком.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmBlock} 
                    close={() => setShowConfirmBlock(false)}
                    confirmText="Купить"
                    onConfirm={buyBlock}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с блоком за <b className="text-success">{ruPluralizeVimers(blockPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}

            {!afkBought && afkPrice && (totalBalance < afkPrice ? (
                <ConfirmModal 
                    show={showConfirmAfk} 
                    close={() => setShowConfirmAfk(false)}
                    confirmText="Пополнить счет"
                    onConfirm={() => navigate("/payments")}
                    title="Недостаточно вимеров"
                >
                    <p>У вас недостаточно вимеров для покупки ника с AFK.</p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ) : (
                <ConfirmModal 
                    show={showConfirmAfk} 
                    close={() => setShowConfirmAfk(false)}
                    confirmText="Купить"
                    onConfirm={buyAfk}
                    title="Подтверждение покупки"
                >
                    <p>
                        Вы действительно хотите купить ник с AFK за <b className="text-success">{ruPluralizeVimers(afkPrice)}</b>?
                    </p>
                    Ваш баланс <b className="text-success">{ruPluralizeVimers(totalBalance)}</b>
                </ConfirmModal>
            ))}
        </>
    );
};

export default MinigamesExclusivesPage;

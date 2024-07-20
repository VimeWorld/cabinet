import { useCallback, useEffect, useState } from "react"
import { Spinner } from "react-bootstrap"
import { useTitle } from "../hook/useTitle"
import { fetchApi } from "../lib/api"
import Notifications from "../lib/notifications"
import useMinigamesProfile from "../hook/userMinigamesProfile"
import { ColorPicker } from 'primereact/colorpicker';

const ColorChange = ({ profile, count, initialColors, colorsFinished }) => {
    const [colorLoadFinished, setColorLoadFinished] = useState(false);
    // Инициализация состояния с учетом переданных начальных цветов
    const [colorConfigs, setColorConfigs] = useState(
        Array(count).fill().map((_, index) => ({
            color: initialColors[index] || '#ffffff',
            enabled: index < initialColors.length
        }))
    );

    const handleColorChange = (color, index) => {
        const newConfigs = [...colorConfigs];
        newConfigs[index] = { ...newConfigs[index], color: '#' + color };
        setColorConfigs(newConfigs);
    };

    const toggleColorPicker = (index) => {
        const newConfigs = [...colorConfigs];
        newConfigs[index] = { 
            ...newConfigs[index], 
            enabled: !newConfigs[index].enabled,
            color: !newConfigs[index].enabled ? '#ffffff' : null 
        };
        setColorConfigs(newConfigs);
    };

    useEffect(() => {
        if (!colorLoadFinished) {
            setColorConfigs(
                Array(count).fill().map((_, index) => ({
                    color: initialColors[index] || '#ffffff',
                    enabled: index < initialColors.length
                }))
            );
            setColorLoadFinished(colorsFinished);
        }
    }, [count, initialColors, colorsFinished]);

    const [usernameStyle, setUsernameStyle] = useState({});
    useEffect(() => {
        let colors = colorConfigs.filter(config => config.enabled).map(config => config.color);
        let style = {};
        if (colors.length > 1) {
            style['background'] = 'linear-gradient(to right, ' + colors.join(',') + ') text'
            style['-webkit-background-clip'] = 'text';
            style['background-clip'] = 'text';
            style['color'] = 'transparent';
        } else {
            style['color'] = colors[0];
        }
        style['font-size'] = '30px';
        setUsernameStyle(style);
    }, [colorConfigs]);

    const onChangeClick = () => {
        fetchApi('/server/minigames/set_name_color', {
            method: 'POST',
            body: { colors: colorConfigs.filter(config => config.enabled).map(config => config.color.substring(1)).join(',') },
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно обновили цвет')
                } else {
                    setError("Произошла ошибка");
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                window.location.reload(false);
            })
    };

    const onResetClick = () => {
        fetchApi('/server/minigames/reset_name_color', {
            method: 'POST',
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно сбросили цвет')
                } else {
                    setError("Произошла ошибка");
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                window.location.reload(false);
            })
    };

    return (
        <div className='card'>
            <div className="card-header">
                <h4 className="mb-0">Цвет ника на MiniGames</h4>
                <span>Позволяет изменить цвет никнейма на сервере</span>
            </div>
            <div className='card-body'>
                <div className="row gy-4">
                    <div className="col-lg-6 col-12">
                        {colorConfigs.map((config, index) => (
                            <div key={index}>
                                <button onClick={() => toggleColorPicker(index)}>
                                    {config.enabled ? 'Выключить' : 'Включить'}
                                </button>
                                {config.enabled && (
                                    <ColorPicker
                                        format="hex"
                                        value={config.color}
                                        onChange={(e) => handleColorChange(e.value, index)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="col-lg-6 col-12">
                        <h5 className="mb-3">Ваш никнейм</h5>
                        <span style={usernameStyle}>{profile.username}</span>
                        <div className="text-end">
                            <button className="btn btn-primary" onClick={ onChangeClick }>
                                Изменить цвет
                            </button>
                        </div>
                        <h5 className="mb-3">Сброс цветов</h5>
                        <p>Для того, чтобы сбросить настройки цветов к изначальным (своему рангу) нажмите кнопку ниже</p>
                        <div className="text-end">
                            <button className="btn btn-primary" onClick={ onResetClick }>
                                Сбросить цвет
                            </button>
                        </div>
                        <h5 className="mb-3">Информация по рангам</h5>
                        <p>Разным рангам доступно разное количество цветов:</p>
                        <th width="120px" style={{ color: "#30FF87" }}>Thane</th> - 1 цвет (без градиента)
                        <th width="120px" style={{ color: "#FFA51E" }}>Elite</th> - 2 цвета (градиент)
                        <th width="120px" style={{ color: "#2688ED" }}>Eternal</th> - 4 цвета (градиент)
                        <div className='text-center text-danger'>Не пытайтесь поставить полностью чёрный или полностью белый цвет. Они запрещены, и при попытке их поставить ничего не произойдёт.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const MinigamesColorPage = () => {
    useTitle('Цвет ника на MiniGames')
    const profile = useMinigamesProfile()
    const [userColors, setUserColors] = useState(["#ffffff"])
    const [colorsFinished, setColorsFinished] = useState(false)

    const ranksInfo = {
        "thane": {
            "allowedColors": 1,
        },
        "elite": {
            "allowedColors": 2,
        },
        "eternal": {
            "allowedColors": 4,
        }
    };

    const load = useCallback(() => {
        fetchApi('/server/minigames/get_name_color')
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    if (body.response) {
                        setUserColors(body.response.split(",").map(e => "#" + e));
                    } else {
                        setUserColors(["#ffffff"]);
                    }
                }
                setColorsFinished(true);
            });
    }, [])

    useEffect(load, [])

    if (!profile.profile)
        return <div className='card'>
            <div className="card-header">
                <h4 className="mb-0">Цвет ника на MiniGames</h4>
                <span>Позволяет изменить цвет никнейма на сервере</span>
            </div>
            <div className='card-body'>
                {profile.loading && <div className='text-center'><Spinner variant='secondary' /></div>}
                {profile.error && <div className='text-center text-danger'>При загрузке произошла ошибка</div>}
            </div>
        </div>

    let mgProfile = profile.profile;
    let rankInfo = ranksInfo[mgProfile.rank_donate];

    if (!rankInfo)
        return <div className='card'>
                    <div className="card-header">
                        <h4 className="mb-0">Цвет ника на MiniGames</h4>
                        <span>Позволяет изменить цвет никнейма на сервере</span>
                    </div>
                    <div className='card-body'>
                        <div className='text-center text-danger'>Изменять цвет никнейма можно только начиная с группы <b style={{ color: "#30FF87" }}>Thane</b></div>
                        <div className="text-center"><a href="/minigames/donate">Изменить статус</a></div>
                    </div>
                </div>

    return <>
        <div className='row mb-4'>
            <div className='col'>
                <ColorChange profile={mgProfile} count={rankInfo['allowedColors']} initialColors={userColors} colorsFinished={colorsFinished} />
            </div>
        </div>
    </>
}

export default MinigamesColorPage
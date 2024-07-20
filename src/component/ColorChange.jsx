import { useEffect, useState } from "react";
import { Button, Form } from 'react-bootstrap';
import Notifications from "../lib/notifications";
import { fetchApi } from "../lib/api";
import { getRank } from '../lib/vimeworld';
import { gradientStyles } from "../lib/gradient";

const DefaultColor = "#eeeeee";

const ColorChange = ({ profile, count, initialColors, colorsFinished }) => {
    const [colorConfigs, setColorConfigs] = useState([]);

    useEffect(() => {
        if (colorsFinished) {
            const configs = Array.from({ length: count }, (_, index) => ({
                color: initialColors[index] || DefaultColor,
                enabled: index < initialColors.length
            }));
            setColorConfigs(configs);
        }
    }, [count, initialColors, colorsFinished]);

    const handleColorChange = (color, index) => {
        setColorConfigs(prevConfigs =>
            prevConfigs.map((config, i) => i === index ? { ...config, color } : config)
        );
    };

    const toggleColorPicker = (index) => {
        setColorConfigs(prevConfigs =>
            prevConfigs.map((config, i) =>
                i === index
                    ? { ...config, enabled: !config.enabled, color: !config.enabled ? DefaultColor : config.color }
                    : config
            )
        );
    };

    const addColorPicker = () => {
        setColorConfigs(prevConfigs => {
            const enabledCount = prevConfigs.filter(config => config.enabled).length;
            if (enabledCount < count) {
                return [...prevConfigs, { color: DefaultColor, enabled: true }];
            }
            return prevConfigs;
        });
    };

    const removeColorPicker = (index) => {
        setColorConfigs(prevConfigs => {
            const updatedConfigs = prevConfigs.filter((_, i) => i !== index);
            const enabledConfigs = updatedConfigs.filter(config => config.enabled);
            const allowedEnabledCount = Math.min(count, enabledConfigs.length);
            return updatedConfigs.map((config, i) => ({
                ...config,
                enabled: i < allowedEnabledCount
            }));
        });
    };

    const [usernameStyle, setUsernameStyle] = useState({});
    useEffect(() => {
        const colors = colorConfigs.filter(config => config.enabled).map(config => config.color);
        let style = gradientStyles(colors);
        style.fontSize = '32px';
        setUsernameStyle(style);
    }, [colorConfigs]);

    const onChangeClick = () => {
        const colors = colorConfigs.filter(config => config.enabled).map(config => config.color.substring(1)).join(',');
        fetchApi('/server/minigames/set_name_color', {
            method: 'POST',
            body: { colors },
        })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно обновили цвет');
                } else {
                    Notifications.error('Произошла ошибка');
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                window.location.reload(false);
            });
    };

    const onResetClick = () => {
        fetchApi('/server/minigames/reset_name_color', {
            method: 'POST',
        })
            .then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Вы успешно сбросили цвет');
                } else {
                    Notifications.error('Произошла ошибка');
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => {
                window.location.reload(false);
            });
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
                        {colorConfigs.map((config, index) => config.enabled && (
                            <div className="row mb-3" key={index}>
                                <div className="col-6">
                                    <Button
                                        variant="danger"
                                        className="fw-bold me-2"
                                        onClick={() => removeColorPicker(index)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                                <div className="col-6">
                                    <Form.Control
                                        type="color"
                                        value={config.color}
                                        onChange={(e) => handleColorChange(e.target.value, index)}
                                        className="w-100"
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex">
                                {colorConfigs.filter(config => config.enabled).length < count && (
                                    <Button variant="success" onClick={addColorPicker}>
                                        Добавить цвет
                                    </Button>
                                )}
                            </div>
                            <div className="d-flex">
                                <Button className="btn btn-primary" onClick={onChangeClick}>
                                    Изменить цвет
                                </Button>
                            </div>
                        </div>
                        <hr className="mt-5 mb-5" />
                        <div className="text-center">
                            <h5 className="mt-3 mb-3">Сброс цветов</h5>
                            <p>Для того, чтобы сбросить настройки цветов к изначальным (своему рангу) нажмите кнопку ниже</p>
                            <div className="mb-3">
                                <Button className="btn btn-primary" onClick={onResetClick}>
                                    Сбросить цвет
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-12 text-center">
                        <h5 className="mb-2">Ваш никнейм</h5>
                        <span style={usernameStyle}>{profile.username}</span>
                        <h5 className="mt-4 mb-1">Информация по рангам</h5>
                        <p>Разным рангам доступно разное количество цветов:</p>
                        <div className="text-center">
                            <p><span className="fw-bold" style={{ "color": getRank("thane").color }}>Thane</span> - 1 цвет <i>(без градиента)</i></p>
                            <p><span className="fw-bold" style={{ "color": getRank("elite").color }}>Elite</span> - 2 цвета <i>(градиент)</i></p>
                            <p><span className="fw-bold" style={{ "color": getRank("eternal").color }}>Eternal</span> - 4 цвета <i>(градиент)</i></p>
                        </div>
                        <div className="text-center text-danger" style={{ "font-size": "13px" }}>Не пытайтесь поставить полностью чёрный или полностью белый цвет. Они запрещены, и при попытке их поставить ничего не произойдёт.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorChange;

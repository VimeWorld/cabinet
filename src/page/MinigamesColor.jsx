import { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useTitle } from "../hook/useTitle";
import { fetchApi } from "../lib/api";
import Notifications from "../lib/notifications";
import useMinigamesProfile from "../hook/userMinigamesProfile";
import ColorChange from '../component/ColorChange';

const MinigamesColorPage = () => {
    useTitle('Цвет ника на MiniGames');
    const profile = useMinigamesProfile();
    const [userColors, setUserColors] = useState([ColorChange.DefaultColor]);
    const [colorsFinished, setColorsFinished] = useState(false);

    const ranksInfo = {
        "thane": {
            "allowedColors": 1,
        },
        "elite": {
            "allowedColors": 2,
        },
        "eternal": {
            "allowedColors": 4,
        },
        "celestial": {
            "allowedColors": 5,
        },
        "absolute": {
            "allowedColors": 6,
        },
        "imperial": {
            "allowedColors": 6,
        },
        "ultimate": {
            "allowedColors": 6,
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
                        setUserColors([ColorChange.DefaultColor]);
                    }
                }
                setColorsFinished(true);
            });
    }, []);

    useEffect(load, [load]);

    if (!profile.profile) {
        return (
            <div className='card'>
                <div className="card-header">
                    <h4 className="mb-0">Цвет ника на MiniGames</h4>
                    <span>Позволяет изменить цвет никнейма на сервере</span>
                </div>
                <div className='card-body'>
                    {profile.loading && <div className='text-center'><Spinner variant='secondary' /></div>}
                    {profile.error && <div className='text-center text-danger'>При загрузке произошла ошибка</div>}
                </div>
            </div>
        );
    }

    let mgProfile = profile.profile;
    let rankInfo = ranksInfo[mgProfile.rank_donate];

    if (!rankInfo) {
        return (
            <div className='card'>
                <div className="card-header">
                    <h4 className="mb-0">Цвет ника на MiniGames</h4>
                    <span>Позволяет изменить цвет никнейма на сервере</span>
                </div>
                <div className='card-body'>
                    <div className='text-center text-danger'>Изменять цвет никнейма можно только начиная с группы <b style={{ color: "#30FF87" }}>Thane</b></div>
                    <div className="text-center"><a href="/minigames/donate">Изменить статус</a></div>
                </div>
            </div>
        );
    }

    return (
        <div className='row mb-4'>
            <div className='col'>
                <ColorChange profile={mgProfile} count={rankInfo.allowedColors} initialColors={userColors} colorsFinished={colorsFinished} />
            </div>
        </div>
    );
};

export default MinigamesColorPage;

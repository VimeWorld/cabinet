import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import OuterPage from '../component/OuterPage';
import useApp from '../hooks/useApp';
import { fetchApi } from '../lib/api';

const CheckCode = ({ code, resetCode }) => {
  const { app } = useApp();
  const [discordData, setDiscordData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setDiscordData(null);
    fetchApi('/user/discord/link', {
      method: 'POST',
      body: { code }
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setDiscordData(body.response.discord);
        } else if (body.response.type == 'invalid_code') {
          setError('Некорректный код авторизации');
        } else {
          setError(body.response.title);
        }
      })
      .catch(() => setError('Невозможно подключиться к серверу'))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <>
      {loading && <Spinner variant="secondary" className="m-auto" />}
      {error && (
        <>
          <p className="text-danger text-center">{error}</p>
          <button className="btn btn-ln btn-primary w-100" onClick={resetCode}>
            Попробовать снова
          </button>
        </>
      )}
      {discordData && (
        <>
          <p className="text-center">Аккаунты успешно связаны</p>
          <div className="text-primary fw-bold text-center">{app.user.username}</div>
          <div className="text-center">
            <i className="bi bi-arrow-down-up" />
          </div>
          <div className="text-primary fw-bold text-center">
            {discordData.username}#{discordData.discriminator}
          </div>
        </>
      )}
    </>
  );
};

const RequestPage = () => {
  return (
    <>
      <p>Эта страница существует для привязки вашего аккаунта к серверу VimeWorld в Discord.</p>
      <p>
        Инвайт:{' '}
        <a href="https://discord.gg/vimeworld" target="_blank">
          https://discord.gg/vimeworld
        </a>
      </p>
      <p>Нам нужно определить кто вы такой в Discord, для этого нажмите на кнопку ниже:</p>

      <a
        className="btn btn-lg btn-primary w-100"
        href={
          'https://discordapp.com/api/oauth2/authorize?' +
          new URLSearchParams({
            client_id: '225666195188088842',
            approval_prompt: 'auto',
            response_type: 'code',
            redirect_uri: `https://cp.vimeworld.com/discord`,
            scope: 'identify'
          }).toString()
        }>
        Привязать
      </a>
    </>
  );
};

const DiscordLinkPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get('code');
  const resetCode = () => {
    setSearchParams('');
  };

  return (
    <OuterPage>
      <h5 className="mb-4 text-center">Привязка аккаунта Discord</h5>

      {code ? <CheckCode code={code} resetCode={resetCode} /> : <RequestPage />}
    </OuterPage>
  );
};

export default DiscordLinkPage;

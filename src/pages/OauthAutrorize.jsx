import { useEffect, useMemo, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import OuterPage from '../component/OuterPage';
import useApp from '../hooks/useApp';
import { useTitle } from '../hooks/useTitle';
import { fetchApi } from '../lib/api';
import Notifications from '../lib/notifications';

const loadApproves = () => {
  return JSON.parse(localStorage.getItem('oauth_consent') || '{}');
};
const saveApproves = (save) => {
  localStorage.setItem('oauth_consent', JSON.stringify(save));
};

const saveApprove = (userid, client_id, scope) => {
  const key = client_id + '$$$' + scope;
  const userstore = 'approved_' + userid;
  let save = loadApproves();
  if (save[userstore] && save[userstore].includes(key)) return;
  if (save[userstore]) save[userstore].push(key);
  else save[userstore] = [key];
  saveApproves(save);
};

const isApproved = (userid, client_id, scope) => {
  const key = client_id + '$$$' + scope;
  const userstore = 'approved_' + userid;
  let save = loadApproves();
  return save[userstore] && save[userstore].includes(key);
};

const ConsentScreen = ({ data }) => {
  const { app } = useApp();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const scope = useMemo(() => {
    const scope = (searchParams.get('scope') || '').replaceAll(',', ' ').trim();
    const scopeParsed = scope == '' ? [] : scope.split(' ');
    scopeParsed.unshift('userinfo');
    return scopeParsed;
  }, [searchParams]);

  let denyUrl = searchParams.get('redirect_uri') + '?error=access_denied';
  if (searchParams.has('state'))
    denyUrl += '&state=' + encodeURIComponent(searchParams.get('state'));
  let logo = (
    <i
      className="bi bi-motherboard"
      style={{ fontSize: '80px', lineHeight: '80px', color: 'rgb(122 193 250 / 50%)' }}
    />
  );
  if (data.client.logo)
    logo = <img width="80" height="80" className="rounded" src={data.client.logo} />;

  const approve = () => {
    if (loading) return;
    setLoading(true);
    saveApprove(app.user.id, searchParams.get('client_id'), searchParams.get('scope'));

    fetchApi('/oauth/approve', {
      method: 'POST',
      body: Object.fromEntries(searchParams)
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          if (body.response.oauth_error) {
            Notifications.error(body.response.oauth_error.error);
            return;
          }
          window.location.href = body.response.redirect;
          return;
        }

        switch (body.response.type) {
          case 'bad_request':
            Notifications.error('Некорректный запрос на авторизацию');
            break;
          default:
            Notifications.error(body.response.title);
        }
        setLoading(false);
      })
      .catch(() => {
        Notifications.error('Невозможно подключиться к серверу');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isApproved(app.user.id, searchParams.get('client_id'), searchParams.get('scope')))
      approve();
  }, [searchParams]);

  return (
    <>
      <div
        className="mb-3 d-flex justify-content-between align-items-center"
        style={{ height: 80 }}>
        <img
          width="80"
          height="80"
          src={`https://skin.vimeworld.com/helm/3d/${app.user.username}/80.png`}
        />
        <i className="bi bi-arrow-left-right fs-2 opacity-25" />
        {logo}
      </div>

      <div className="mb-4">
        <h4 className="fw-normal text-center mb-0">{data.client.name}</h4>
        {data.client.url && <div className="text-center">{data.client.url}</div>}
      </div>

      <p>Это приложение запрашивает доступ к следующей информации:</p>

      <ul className="mb-4">
        {scope.map((s) => {
          if (s == 'userinfo')
            return (
              <li key={s}>
                <b>Ваш ник</b>: {app.user.username}
              </li>
            );

          return <li key={s}>{s}</li>;
        })}
      </ul>

      <button className="btn btn-lg btn-primary w-100 mb-3" onClick={approve} disabled={loading}>
        {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
        {loading ? ' Загрузка...' : 'Разрешить'}
      </button>
      <a href={denyUrl} className="btn btn-lg btn-outline-secondary w-100">
        Отмена
      </a>
    </>
  );
};

const OauthAuthorizePage = () => {
  useTitle('Запрос доступа');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);
    fetchApi('/oauth/check?' + searchParams)
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          if (body.response.oauth_redirect) {
            window.location.href = body.response.oauth_redirect;
            return;
          }
          if (body.response.oauth_error) {
            let err = body.response.oauth_error;
            if (err.error == 'invalid_client') setError('Клиента с таким client_id не существует');
            else if (err.error == 'invalid_redirect_uri')
              setError('Некорректный адрес редиректа для этого клиента');
            else setError('Ошибка oauth: ' + JSON.stringify(err));
            return;
          }

          setData(body.response);
        } else if (body.response.type == 'bad_request') {
          setError('Некорректный запрос на авторизацию');
        } else {
          setError(body.response.title);
        }
      })
      .catch(() => setError('Невозможно подключиться к серверу'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <OuterPage>
      {loading && (
        <div className="text-center">
          <Spinner size="lg" variant="secondary" />
        </div>
      )}

      {!loading && error && <div className="text-danger text-center">{error}</div>}
      {!loading && data && <ConsentScreen data={data} />}
    </OuterPage>
  );
};

export default OauthAuthorizePage;

import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import OuterPage from '../component/OuterPage';
import useApp from '../hooks/useApp';
import { useTitle } from '../hooks/useTitle';
import { fetchApi } from '../lib/api';
import { ruPluralizeVimers } from '../lib/i18n';
import Notifications from '../lib/notifications';

const rowHeight = 30;

const Vimers = ({ amount }) => {
  const { app } = useApp();
  if (!amount) amount = app.user.cash;
  return <b className="text-success">{ruPluralizeVimers(amount)}</b>;
};

const User = ({ username }) => {
  return (
    <div className="d-flex justify-content-end align-items-center">
      <img
        src={'https://skin.vimeworld.com/helm/3d/' + username + '/' + rowHeight + '.png'}
        alt={username}
        height={rowHeight}
        width={rowHeight}
      />
      <b className="text-info ms-2">{username}</b>
    </div>
  );
};

const Row = ({ name, children }) => {
  return (
    <div
      className="mb-3 d-flex justify-content-between border-bottom"
      style={{ minHeight: rowHeight }}>
      <div className="me-2">{name}</div>
      {children}
    </div>
  );
};

const TransactionConfirmPage = () => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPayment(null);
    fetchApi('/payment/transaction?id=' + id)
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setPayment(body.response);
        } else if (body.response.type == 'invalid_transaction') {
          setError('Транзакция не найдена');
        } else {
          setError(body.response.title);
        }
      })
      .catch(() => setError('Невозможно подключиться к серверу'))
      .finally(() => setLoading(false));
  }, [id]);

  const confirm = () => {
    if (confirmLoading || success) return;
    setConfirmLoading(true);
    fetchApi('/payment/transaction/confirm', {
      method: 'POST',
      body: {
        id: parseInt(id)
      }
    })
      .then((r) => r.json())
      .then((body) => {
        if (body.success) {
          setSuccess(true);
        } else if (body.response.type == 'invalid_transaction') {
          Notifications.error('Транзакция не найдена');
        } else {
          Notifications.error(body.response.title);
        }
      })
      .catch(() => Notifications.error('Невозможно подключиться к серверу. Попробуйте позже.'))
      .finally(() => setConfirmLoading(false));
  };

  let heading = 'транзации';
  let text;
  switch (payment?.alias) {
    case 'trade':
      heading = 'перевода';
      text = (
        <>
          <Row name="Цель">
            <User username={payment.data.recipient} />
          </Row>
          <Row name="Сумма">
            <Vimers amount={payment.amount} />
          </Row>
          {payment.data.desc && <Row name="Описание">{payment.data.desc}</Row>}
        </>
      );
      break;
    case 'trade_shop':
      heading = 'покупки';
      text = (
        <>
          <Row name="Продавец">
            <User username={payment.data.seller} />
          </Row>
          <Row name="Цена">
            <Vimers amount={payment.amount} />
          </Row>
          <Row name="Предмет">{payment.data.desc}</Row>
        </>
      );
      break;
    default:
      text = <div className="text-danger text-center">Неизвестная операция</div>;
  }

  useTitle('Подтверждение ' + heading);

  let content;
  if (loading)
    content = (
      <div className="text-center">
        <Spinner size="lg" variant="secondary" />
      </div>
    );
  else if (error) content = <div className="text-danger text-center">{error}</div>;
  else if (success)
    content = (
      <>
        <h5 className="text-center">Спасибо</h5>
        <div>Транзакция подтвержена. Теперь вы можете вернуться в игру.</div>
      </>
    );
  else if (payment)
    content = (
      <>
        {text}

        <div className="mt-4">
          Ваш баланс: <Vimers />
        </div>

        <button
          className="btn btn-lg btn-primary w-100 mt-4"
          onClick={confirm}
          disabled={confirmLoading}>
          {confirmLoading && (
            <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />
          )}
          {confirmLoading ? ' Загрузка...' : 'Подтвердить'}
        </button>
      </>
    );

  return (
    <OuterPage>
      <h4 className="mb-4 text-center">Подтверждение {heading}</h4>

      {content}

      <div className="text-center mt-4">
        <Link to="/" className="me-2">
          Главная
        </Link>
        <Link to="/payments">История платежей</Link>
      </div>
    </OuterPage>
  );
};

export default TransactionConfirmPage;

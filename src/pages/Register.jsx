import { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Notifications from '../lib/notifications';
import { fetchApi } from '../lib/api';
import useInvisibleRecaptcha from '../hooks/useInvisibleRecaptcha';
import OuterPage from '../component/OuterPage';
import { useTitle } from '../hooks/useTitle';

const RegisterSuccessPage = () => {
  return (
    <OuterPage>
      <h4 className="mb-4 text-center">Спасибо за регистрацию!</h4>

      <p>
        Теперь вы можете <Link to="/login">войти</Link> в свой аккаунт.
      </p>
      <Link to="/login" className="btn btn-lg btn-primary w-100">
        Вход
      </Link>
    </OuterPage>
  );
};

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      login: '',
      password: '',
      password_confirm: '',
      email: ''
    }
  });

  useTitle('Регистрация');
  const [checkedLogin, setCheckedLogin] = useState({
    login: '',
    error: ''
  });
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { recaptchaComponent, getRecaptchaValue } = useInvisibleRecaptcha();

  if (registered) {
    return <RegisterSuccessPage />;
  }

  const submit = async (data) => {
    if (loading) return;

    if (checkedLogin.login == data.login && checkedLogin.error) {
      setError('login', { type: 'custom', message: checkedLogin.error }, { shouldFocus: true });
      return;
    }
    setLoading(true);

    try {
      const recaptchaValue = await getRecaptchaValue();
      const response = await fetchApi('/register', {
        method: 'POST',
        body: {
          username: data.login,
          password: data.password,
          email: data.email,
          recaptcha_response: recaptchaValue
        }
      });
      const body = await response.json();
      if (response.ok) {
        setRegistered(true);
      } else {
        switch (body.response.type) {
          case 'username_exists':
            setError(
              'login',
              { type: 'custom', message: 'Игрок с таким логином уже зарегистрирован' },
              { shouldFocus: true }
            );
            setCheckedLogin({ login, error: 'Игрок с таким логином уже зарегистрирован' });
            break;
          case 'invalid_username':
            setError(
              'login',
              { type: 'custom', message: 'Недопустимый логин' },
              { shouldFocus: true }
            );
            break;
          case 'invalid_password':
            setError(
              'password',
              { type: 'custom', message: 'Недопустимый пароль' },
              { shouldFocus: true }
            );
            break;
          case 'invalid_email':
            setError(
              'email',
              { type: 'custom', message: 'Недопустимый Email' },
              { shouldFocus: true }
            );
            break;
          case 'captcha':
            Notifications.error('Ошибка Recaptcha. Обновите страницу и попробуйте еще раз.');
            break;
          default:
            Notifications.error(body.response.title);
        }
      }
    } catch (e) {
      Notifications.error('Невозможно подключиться к серверу');
    }
    setLoading(false);
  };

  const onLoginBlur = async () => {
    const login = watch('login');
    if (!!errors.login || !login) return;
    if (checkedLogin.login == login && !checkedLogin.error) return;

    let error = '';
    try {
      const response = await fetchApi(
        '/user?' +
          new URLSearchParams({
            register: '1',
            name: login
          }).toString()
      );
      if (response.ok) {
        const body = await response.json();
        if (body.response.exists) error = 'Игрок с таким логином уже зарегистрирован';
        else if (!body.response.available) error = 'Этот логин недоступен для регистрации';
      } else {
        error = 'Ошибка сервера, невозможно проверить доступность логина';
      }
    } catch {
      error = 'Сетевая ошибка, невозможно проверить доступность логина';
    }
    if (error) setError('login', { type: 'custom', message: error });
    setCheckedLogin({ login, error });
  };

  return (
    <OuterPage>
      <Form onSubmit={handleSubmit(submit)}>
        <h4 className="mb-4 text-center">Регистрация аккаунта</h4>

        <Form.Group className="mb-3" controlId="login">
          <Form.Label>Логин</Form.Label>
          <Form.Control
            {...register('login', {
              required: 'Логин не может быть пустым',
              minLength: {
                value: 3,
                message: 'Логин должен быть не менее 3 символов'
              },
              maxLength: {
                value: 16,
                message: 'Логина должен быть не более 16 символов'
              },
              pattern: {
                value: /^[0-9a-zA-Z_]{3,16}$/,
                message: 'Логин может содержать только англ. буквы, цифры и _'
              }
            })}
            isInvalid={!!errors.login}
            isValid={
              checkedLogin.login && !checkedLogin.error && checkedLogin.login == watch('login')
            }
            onBlur={onLoginBlur}
          />
          {errors.login && (
            <Form.Control.Feedback type="invalid">{errors.login.message}</Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Пароль</Form.Label>
          <Form.Control
            type="password"
            {...register('password', {
              required: 'Пароль не может быть пустым',
              minLength: {
                value: 6,
                message: 'Минимальная длина пароля 6 символов'
              },
              maxLength: {
                value: 50,
                message: 'Максимальная длина пароля 50 символов'
              },
              deps: ['password_confirm']
            })}
            isInvalid={!!errors.password}
          />
          {errors.password && (
            <Form.Control.Feedback type="invalid">{errors.password.message}</Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="password_confirm">
          <Form.Label>Повтор пароля</Form.Label>
          <Form.Control
            type="password"
            {...register('password_confirm', {
              validate: (val) => {
                if (watch('password') != val) return 'Пароли должны совпадать';
              }
            })}
            isInvalid={!!errors.password_confirm}
          />
          {errors.password_confirm && (
            <Form.Control.Feedback type="invalid">
              {errors.password_confirm.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            {...register('email', {
              required: 'Email не может быть пустым',
              validate: (val) => {
                if (!/^[0-9a-zA-Z_\-.@]+$/.test(val)) return 'Email содержит недопустимые символы';
                if (
                  !/^[0-9a-zA-Z_\-.]{1,64}@[0-9a-zA-Z_\-]{1,90}\.[0-9a-zA-Z_\-.]{2,90}$/.test(val)
                )
                  return 'Введен некорректный Email';
              }
            })}
            isInvalid={!!errors.email}
          />
          {errors.email && (
            <Form.Control.Feedback type="invalid">{errors.email.message}</Form.Control.Feedback>
          )}
        </Form.Group>

        {recaptchaComponent}

        <p className="text-center text-muted text-small">
          <small>
            Нажатием кнопки Регистрация, вы соглашаетесь с{' '}
            <a className="link-secondary" href="https://vime.one/terms">
              Пользовательским соглашением
            </a>
            ,{' '}
            <a className="link-secondary" href="https://vime.one/rules">
              Правилами сервера
            </a>{' '}
            и признаете, что применяется наша{' '}
            <a className="link-secondary" href="https://vime.one/privacy">
              Политика конфиденциальности
            </a>
            .
          </small>
        </p>

        <button className="btn btn-lg btn-primary w-100 mt-2 mb-4" type="submit" disabled={loading}>
          {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
          {loading ? ' Загрузка...' : 'Регистрация'}
        </button>

        <p className="text-center">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </Form>
    </OuterPage>
  );
};

export default RegisterPage;

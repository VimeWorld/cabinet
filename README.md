# Личный кабинет VimeWorld

Это интерфейс для управления своим аккаунтом на VimeWorld. Доступен по адресу [https://cp.vimeworld.com](https://cp.vimeworld.com).

Работает на основе приватного API, для которого нет документации, однако все методы и параметры можно посмотреть в коде этого репозитория.

## Установка

```sh
# Клонирование репозитория
$ git clone https://github.com/VimeWorld/cabinet.git

# Заходим в папку проекта
$ cd cabinet

# Устанавливаем зависимости
$ npm install
```

Для запуска тестового сервера используйте команду `npm run dev`.

По умолчанию кабинет подключается к настоящему рабочему API `https://cp.vimeworld.com/api/`, так что вы можете использовать свой логин и пароль для входа и всех остальных действий.

## Участие в разработке

Для репорта багов используйте [Issues](https://github.com/VimeWorld/cabinet/issues), а для своих изменений открывайте [Pull Requests](https://github.com/VimeWorld/cabinet/pulls).

## License

[MIT](LICENSE) © VimeWorld.com

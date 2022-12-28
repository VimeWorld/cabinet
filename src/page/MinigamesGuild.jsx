import { Editor } from '@tinymce/tinymce-react'
import { useEffect, useRef, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { ConfirmModal } from '../component/ConfirmModal'
import useApp from '../hook/useApp'
import { useTitle } from '../hook/useTitle'
import { fetchApi } from '../lib/api'
import Notifications from '../lib/notifications'
import infoCss from './MinigamesGuildInfo.css?raw'

const InfoCard = ({ guild }) => {
    const { app } = useApp()
    const editorRef = useRef(null)
    const [loading, setLoading] = useState(false)

    const save = () => {
        if (!editorRef.current || loading) return
        const content = editorRef.current.getContent()

        if (content.length > 50 * 1024) {
            Notifications.error('Описание слишком длинное')
            return
        }

        const plainText = editorRef.current.getContent({ format: 'text' })
        if (plainText.length > 3000) {
            Notifications.error('Описание слишком длинное')
            return
        }

        setLoading(true)
        fetchApi('/server/minigames/guild/info', {
            method: 'POST',
            body: { info: content },
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Описание успешно сохранено')
                    if (editorRef.current)
                        editorRef.current.setContent(guild.web_info = body.response.web_info)
                } else {
                    switch (body.response.type) {
                        case 'too_long':
                            Notifications.error('Описание слишком длинное')
                            break
                        case 'not_guild_owner':
                            Notifications.error('Вы не являетесь лидером гильдии')
                            break
                        default:
                            Notifications.error(body.response.title)
                    }
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    let textColor = app.theme === 'dark' ? '#ccc' : '#555'
    let bgColor = app.theme === 'dark' ? '#212529' : '#fff'
    let innerCss = infoCss + `
    body{
        color: ${textColor};
        background-color: ${bgColor};
    }
    `

    return <div className='card'>
        <div className="card-header">
            <h4 className="mb-0">Описание гильдии <span className='text-info'>{guild.name}</span></h4>
            <span>Описание вашей гильдии на сайте</span>
        </div>
        <Editor
            onInit={(_, editor) => {
                editor.getContainer().style.border = 'none'
                editorRef.current = editor
            }}
            tinymceScriptSrc={'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.3.1/tinymce.min.js'}
            initialValue={guild.web_info}
            init={{
                menubar: false,
                statusbar: false,
                autoresize_bottom_margin: 0,
                max_height: 500,
                paste_data_images: false,
                link_assume_external_targets: 'https',
                language: 'ru',
                language_url: 'https://cdn.jsdelivr.net/npm/tinymce-i18n@22.12.4/langs6/ru.js',
                plugins: [
                    'autolink', 'lists', 'link', 'image', 'searchreplace', 'code', 'help', 'autoresize'
                ],
                toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor bullist numlist | image | alignleft aligncenter alignright |' +
                    'removeformat code help',
                valid_styles: {
                    'span': 'color,text-align',
                    'p': 'color,text-align',
                    'div': 'color,text-align',
                },
                content_style: innerCss,
                placeholder: 'Информация о гильдии, например Discord или группа в ВК',
                skin: app.theme === 'dark' ? 'oxide-dark' : 'oxide',
                content_css: app.theme === 'dark' ? 'dark' : '',
            }}
        />
        <div className='card-body text-end'>
            <button className="btn btn-primary" onClick={save} disabled={loading}>
                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                {loading ? ' Загрузка...' : 'Сохранить'}
            </button>
        </div>
    </div>
}

const AvatarCard = ({ guild }) => {
    const file = useRef()
    const [loading, setLoading] = useState(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)

    const deleteAvatar = () => {
        if (loading) return

        setLoading(true)
        fetchApi('/server/minigames/guild/avatar', {
            method: 'DELETE',
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Аватар успешно удален')
                    guild.avatar = ""
                } else {
                    switch (body.response.type) {
                        case 'not_guild_owner':
                            Notifications.error('Вы не являетесь лидером гильдии')
                            break
                        default:
                            Notifications.error(body.response.title)
                    }
                }
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    const setAvatar = (e) => {
        e.preventDefault()
        if (loading) return
        const avatar = file.current.files[0]

        const maxSizeKb = 100
        if (avatar.size >= maxSizeKb * 1024) {
            Notifications.error(`Максимальный размер аватара ${maxSizeKb}кб`)
            return
        }

        setLoading(true)
        const formData = new FormData()
        formData.append('file', avatar)
        fetchApi('/server/minigames/guild/avatar', {
            method: 'POST',
            body: formData,
        }).then(r => r.json())
            .then(body => {
                if (body.success) {
                    Notifications.success('Аватар успешно изменен')
                    guild.avatar = body.response.avatar
                } else {
                    switch (body.response.type) {
                        case 'not_guild_owner':
                            Notifications.error('Вы не являетесь лидером гильдии')
                            break
                        case "too_large":
                            Notifications.error(`Максимальный размер аватара ${maxSizeKb}кб`)
                            break
                        case "invalid_dimension":
                            Notifications.error('Размеры аватара должны быть 140x140')
                            break
                        case "not_an_image":
                            Notifications.error('Файл аватара должен быть .png или .jpg изображением')
                            break
                        default:
                            Notifications.error(body.response.title)
                    }
                }
                file.current.value = null
            })
            .catch(() => Notifications.error('Невозможно подключиться к серверу'))
            .finally(() => setLoading(false))
    }

    return <div className='card'>
        <div className="card-header">
            <h4 className="mb-0">Аватар гильдии <span className='text-info'>{guild.name}</span></h4>
            <span>Отображается в игре и на сайте</span>
        </div>
        <div className='card-body'>
            <form onSubmit={setAvatar}>
                <div className='d-block d-sm-flex d-md-block d-lg-flex'>
                    <div className='flex-shrink-1 d-flex align-items-center justify-content-center flex-column'>
                        <img src={guild.avatar || 'https://vimeworld.com/images/guild.png'} width="140" height="140" className="rounded" />
                    </div>
                    <div className='flex-grow-1 ms-sm-4 ms-md-0 ms-lg-4 d-flex align-items-center justify-content-center flex-column'>
                        <div className='flex-grow-1 w-100 py-3'>
                            <label htmlFor='avatar_file' className='mb-1'>Аватар должен быть 140х140 в формате <code>.png</code> или <code>.jpg</code></label>
                            <input ref={file} className="form-control" type="file" id="avatar_file" required accept=".jpeg,.jpg,.png" />
                        </div>
                        <div className='flex-shrink-1 text-end w-100'>
                            {guild.avatar && <>
                                <button className="btn btn-outline-danger me-3" type="button" onClick={() => setShowConfirmDelete(true)} disabled={loading}>
                                    {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                                    {loading ? ' Загрузка...' : 'Удалить аватар'}
                                </button>
                                <ConfirmModal show={showConfirmDelete} close={() => setShowConfirmDelete(false)}
                                    confirmText="Удалить"
                                    confirmClass='btn-danger'
                                    onConfirm={deleteAvatar}
                                    title="Удаление аватара"
                                >
                                    Вы действительно хотите удалить аватар?<br />
                                    Это действие нельзя отменить.
                                </ConfirmModal>
                            </>}
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                {loading && <Spinner className="align-baseline" as="span" size="sm" aria-hidden="true" />}
                                {loading ? ' Загрузка...' : 'Сохранить'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
}

const MinigamesGuildPage = () => {
    const [loading, setLoading] = useState(true)
    const [guild, setGuild] = useState(null)
    const [error, setError] = useState(false)
    useTitle('Управление гильдией ' + (guild?.name || ''))

    useEffect(() => {
        setLoading(true)
        setError(false)
        setGuild(null)
        fetchApi('/server/minigames/guild')
            .then(r => r.json())
            .then(body => {
                if (body.success)
                    setGuild(body.response)
                else
                    setError(true)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    if (!guild)
        return <div className='card'>
            <div className="card-header">
                <h4 className="mb-0">Управление гильдией</h4>
                <span>Здесь можно изменить аватарку и описание гильдии</span>
            </div>
            <div className='card-body'>
                {loading && <div className='text-center'><Spinner variant='secondary' /></div>}
                {error && <div className='text-center text-danger'>При загрузке произошла ошибка</div>}
                {!loading && !error && <div className='text-center text-body-secondary'>Эта страница доступна только лидеру гильдии</div>}
            </div>
        </div>

    return <>
        <div className='row mb-4'>
            <div className='col'>
                <AvatarCard guild={guild} />
            </div>
        </div>
        <div className="row mb-4">
            <div className="col">
                <InfoCard guild={guild} />
            </div>
        </div>
    </>
}

export default MinigamesGuildPage

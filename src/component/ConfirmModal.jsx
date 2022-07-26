import { Modal } from "react-bootstrap"

export const ConfirmModal = ({
    show, close, onCancel, onConfirm,
    title, children, confirmText, confirmClass = 'btn-primary'
}) => {
    return <Modal show={show} onHide={close}>
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {children}
        </Modal.Body>
        <Modal.Footer>
            <button className="btn btn-secondary" onClick={() => {
                onCancel?.()
                close()
            }}>Отмена</button>

            <button className={"btn " + confirmClass} onClick={() => {
                onConfirm?.()
                close()
            }}>{confirmText}</button>
        </Modal.Footer>
    </Modal>
}

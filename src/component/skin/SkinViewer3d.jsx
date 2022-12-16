import { useEffect, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import ReactSkinview3d from "react-skinview3d"
import { IdleAnimation } from "skinview3d"
import useApp from "../../hook/useApp"

import steve from './steve.png'

function getWidth(element) {
    let styles = getComputedStyle(element)
    let width = element.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)
    return width
}

const Fallback = ({ height }) => {
    const { app } = useApp()
    const anticache = app.skinModified ? '?_=' + app.skinModified : ''
    const width = Math.round((height - 15) / 2)
    height = width * 2

    return <div className="text-center mb-3">
        <img
            height={height}
            width={width}
            src={`https://skin.vimeworld.com/body/${app.user.username}.png${anticache}`}
            alt={app.user.username}
        />
    </div>
}

const SkinViewer3d = ({ skin, cape, parent, height }) => {
    const [svWidth, setSvWidth] = useState(100)
    const [skinData, setSkinData] = useState(null)

    useEffect(() => {
        const handleResize = () => {
            setSvWidth(getWidth(parent.current))
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        // https://stackoverflow.com/a/50463054/6620659
        fetch(skin)
            // response.ok по сути ломает следующий метод с ошибкой
            // Failed to execute 'readAsDataURL' on 'FileReader': parameter 1 is not of type 'Blob'
            // но нам это подходит, при ошибке просто ставим скин стива
            .then(response => response.ok && response.blob())
            .then(blob => {
                const reader = new FileReader()
                reader.onload = function () {
                    // `this.result` contains a base64 data URI
                    setSkinData(this.result)
                }
                reader.readAsDataURL(blob)
            })
            .catch(() => setSkinData(steve))
    }, [skin])

    return <ErrorBoundary
        fallback={<Fallback height={height} />}
        onError={error => {
            console.error('3d Skin Viewer', error)
        }}
    >
        <ReactSkinview3d
            skinUrl={skinData}
            capeUrl={cape}
            height={height}
            width={svWidth}
            onReady={({ viewer }) => {
                viewer.animation = new IdleAnimation()
                viewer.animation.speed = 1.2
                viewer.controls.enableZoom = false
                viewer.zoom = 0.95
                viewer.playerObject.rotation.set(0, -0.4, 0)
            }}
        />
    </ErrorBoundary>
}

export default SkinViewer3d

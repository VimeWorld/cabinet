import { useEffect, useState } from "react"
import ReactSkinview3d from "react-skinview3d"
import { IdleAnimation } from "skinview3d"

import steve from './steve.png'

function getWidth(element) {
    let styles = getComputedStyle(element)
    let width = element.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)
    return width
}

const SkinViewer3d = ({ skin, cape, parent, height }) => {
    const [svWidth, setSvWidth] = useState(100)
    const [skinData, setSkinData] = useState(null)

    useEffect(() => {
        const handleResize = e => {
            setSvWidth(getWidth(parent.current))
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        // https://stackoverflow.com/a/50463054/6620659
        fetch(skin)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader()
                reader.onload = function () {
                    // `this.result` contains a base64 data URI
                    setSkinData(this.result)
                }
                reader.readAsDataURL(blob)
            })
            .catch(e => setSkinData(steve))
    }, [skin])

    return <ReactSkinview3d
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
}

export default SkinViewer3d

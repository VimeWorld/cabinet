import { useEffect, useState } from "react"
import ReactSkinview3d from "react-skinview3d"
import { IdleAnimation } from "skinview3d"

function getWidth(element) {
    let styles = getComputedStyle(element)
    let width = element.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)
    return width
}

const SkinViewer3d = ({ skin, cape, parent, height }) => {
    const [svWidth, setSvWidth] = useState(100)

    useEffect(() => {
        const handleResize = e => {
            setSvWidth(getWidth(parent.current))
        }
        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    return <ReactSkinview3d
        skinUrl={skin}
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

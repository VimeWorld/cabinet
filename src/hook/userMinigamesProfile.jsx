import { useCallback, useEffect, useState } from "react"
import { fetchApi } from "../lib/api"
import useApp from "./useApp"
import { EVENT_MINIGAMES_PROFILE_UPDATED, EventBus } from "../lib/eventbus"

const useMinigamesProfile = () => {
    const { app } = useApp()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        return EventBus.on(EVENT_MINIGAMES_PROFILE_UPDATED, update => setProfile(update))
    }, [])

    const load = useCallback(() => {
        setLoading(true)
        setError(false)
        setProfile(null)
        fetchApi('/server/minigames/profile')
            .then(r => r.json())
            .then(body => {
                if (body.success)
                    setProfile(body.response)
                else if (body.error && body.response.type === 'no_profile_exists')
                    setProfile({
                        id: -1,
                        donated: 0,
                        exp: 0,
                        coins: 8000,
                        last_seen: "1970-01-01T03:00:00+03:00",
                        rank: "",
                        rank_donate: "",
                        rank_donate_expire: "1970-01-01T03:00:00+03:00",
                        rank_full: "",
                        username: app.user.username,
                        online: 0,
                        prime_active: false,
                        prime_from: "1970-01-01T03:00:00+03:00",
                        prime_to: "1970-01-01T03:00:00+03:00",
                        hd_sub_active: false,
                        hd_sub_from: "1970-01-01T03:00:00+03:00",
                        hd_sub_to: "1970-01-01T03:00:00+03:00",
                        cape_status: 0,
                    })
                else
                    setError(true)
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    useEffect(load, [])

    return {
        profile,
        loading,
        error,
        load,
        setProfile,
    }
}

export default useMinigamesProfile

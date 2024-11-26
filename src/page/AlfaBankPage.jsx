import { useEffect } from "react";
import { useTitle } from "../hook/useTitle";
import { fetchApi } from "../lib/api";

const AlfaBankPage = () => {
    useEffect(() => {
        fetchApi('/user/alfa_link', {
            method: 'GET'
        }).then(r => r.json()).then(body => {
            if (body.success) {
                window.location.assign(body.response.link);
            }
        });
    }, []);
    useTitle('Альфа-Банк')
    return <>
    </>
}

export default AlfaBankPage

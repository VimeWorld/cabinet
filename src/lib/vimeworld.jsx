const ranks = {
    player: {
        name: "Игрок",
        prefix: "",
        color: "",
        gradient: []
    },
    vip: {
        name: "VIP",
        prefix: "V",
        color: "#3dff80",
        gradient: [
            "#3dff80"
        ]
    },
    premium: {
        name: "Premium",
        prefix: "P",
        color: "#3decff",
        gradient: [
            "#3decff"
        ]
    },
    holy: {
        name: "Holy",
        prefix: "H",
        color: "#fff8a9",
        gradient: [
            "#fff8a9",
            "#ffa317"
        ]
    },
    immortal: {
        name: "Immortal",
        prefix: "I",
        color: "#ff70d1",
        gradient: [
            "#ff70d1",
            "#ff5d6d"
        ]
    },
    divine: {
        name: "Divine",
        prefix: "Divine",
        color: "#b451ff",
        gradient: [
            "#b451ff",
            "#84b5ff"
        ]
    },
    thane: {
        name: "Thane",
        prefix: "Thane",
        color: "#30ff87",
        gradient: [
            "#30ff87",
            "#1cffe4",
            "#3594ff"
        ]
    },
    elite: {
        name: "Elite",
        prefix: "Elite",
        color: "#ffa51e",
        gradient: [
            "#ffa51e",
            "#ff5619",
            "#ff314a"
        ]
    },
    eternal: {
        name: "Eternal",
        prefix: "Eternal",
        color: "#2688ed",
        gradient: [
            "#2688ed",
            "#8b00d7",
            "#ff4161"
        ]
    },
    vime: {
        name: "Vime",
        prefix: "Vime",
        color: "#2599d4",
        gradient: [
            "#2599d4",
            "#1d7cab"
        ]
    },
    builder: {
        name: "Билдер",
        prefix: "Билдер",
        color: "#67ff54",
        gradient: [
            "#67ff54",
            "#16bd00"
        ]
    },
    srbuilder: {
        name: "Проверенный билдер",
        prefix: "Пр. билдер",
        color: "#57c22d",
        gradient: [
            "#57c22d"
        ]
    },
    maplead: {
        name: "Главный билдер",
        prefix: "Гл. билдер",
        color: "#55961a",
        gradient: [
            "#55961a",
            "#3f6e13"
        ]
    },
    youtube: {
        name: "Media",
        prefix: "Media",
        color: "#bf2dff",
        gradient: [
            "#bf2dff",
            "#f33fd7"
        ]
    },
    dev: {
        name: "Разработчик",
        prefix: "Dev",
        color: "#d61753",
        gradient: [
            "#d61753"
        ]
    },
    organizer: {
        name: "Организатор",
        prefix: "Организатор",
        color: "0d83ae",
        gradient: [
            "#0d83ae",
            "#00c0eb"
        ]
    },
    helper: {
        name: "Хелпер",
        prefix: "Хелпер",
        color: "#76a6ff",
        gradient: [
            "#76a6ff"
        ]
    },
    moder: {
        name: "Модератор",
        prefix: "Модер",
        color: "#4e62eb",
        gradient: [
            "#4e62eb"
        ]
    },
    warden: {
        name: "Проверенный модератор",
        prefix: "Пр. Модер",
        color: "#3c36de",
        gradient: [
            "#3c36de"
        ]
    },
    chief: {
        name: "Админ",
        prefix: "Админ",
        color: "#ff5e43",
        gradient: [
            "#ff5e43",
            "#db2100"
        ]
    },
    admin: {
        name: "Главный админ",
        prefix: "Гл. админ",
        color: "#ff2030",
        gradient: [
            "#ff2030",
            "#d40048",
            "#c1006b"
        ]
    }
};

export const getRank = (key) => {
    return ranks[key] || ranks["player"];
};

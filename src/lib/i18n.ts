// https://github.com/megatolya/plural-ru/blob/196f9bd5517fc5621a7503d4bcffdf922e2f03b5/index.js#L52
function ruGetNounPluralForm(a: number) {
    a = Math.abs(a)
    if (a % 10 === 1 && a % 100 !== 11) {
        return 0
    } else if (a % 10 >= 2 && a % 10 <= 4 && (a % 100 < 10 || a % 100 >= 20)) {
        return 1
    } else {
        return 2
    }
}

export function ruPluralize(count: number, words: string[], useNumber = true) {
    const form = words[ruGetNounPluralForm(count)]
    if (useNumber)
        return count + ' ' + form
    return form
}

export function ruPluralizeVimers(count: number, useNumber = true) {
    return ruPluralize(count, ['вимер', 'вимера', 'вимеров'], useNumber)
}

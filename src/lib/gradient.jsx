export const gradientStyles = (colors) => {
    let style = {};
    if (colors.length > 1) {
        style.backgroundImage = `linear-gradient(to right, ${colors.join(',')})`;
        style.WebkitBackgroundClip = 'text';
        style.backgroundClip = 'text';
        style.color = 'transparent';
    } else if (colors.length === 1) {
        style.color = colors[0];
    }
    return style;
}

export default function timeformat(date: Date, options?: { showTimeOfDay?: boolean }) {
    const shortHandDay = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
    const shortHandMonth = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];
    return `${shortHandDay[date.getDay()]} ${date.getDate()}. ${shortHandMonth[date.getMonth()]}. ${date.getFullYear()}${options?.showTimeOfDay ? ` ${date.getHours()}:${date.getMinutes()}` : ""}`;
}

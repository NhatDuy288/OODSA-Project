export function timeAgo(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "";

    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);

    if (sec < 15) return "Vừa xong";
    if (sec < 60) return `${sec} giây trước`;

    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} phút trước`;

    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour} giờ trước`;

    const day = Math.floor(hour / 24);
    if (day < 7) return `${day} ngày trước`;

    return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

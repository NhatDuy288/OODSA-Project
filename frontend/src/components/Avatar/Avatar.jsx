// Avatar.jsx
import { useEffect, useState } from "react";
import styles from "./Avatar.module.css";
import default_avatar from "../../assets/default_avatar.jpg";
import { AuthService } from "../../services/auth.service";

const resolveAvatarUrl = (avatar) => {
    if (!avatar) return "";
    if (typeof avatar !== "string") return "";
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("data:image")) return avatar;

    const base = import.meta.env.VITE_API_URL_IMG || "";
    if (!base) return avatar;

    const needSlash = !base.endsWith("/") && !avatar.startsWith("/");
    const noDoubleSlash = base.endsWith("/") && avatar.startsWith("/");
    if (noDoubleSlash) return base + avatar.slice(1);
    return base + (needSlash ? "/" : "") + avatar;
};

function Avatar({
                    src,
                    alt = "avatar",
                    onClick,
                    variant = "other",
                    size = 40,
                    className,
                    imgClassName,
                    title,
                    style,
                    imgStyle,
                }) {
    const [user, setUser] = useState(variant === "me" ? AuthService.getUser() : null);

    useEffect(() => {
        if (variant !== "me") return;

        const handler = () => setUser(AuthService.getUser());
        window.addEventListener("user_updated", handler);
        return () => window.removeEventListener("user_updated", handler);
    }, [variant]);

    const rawSrc =
        variant === "me"
            ? (src || user?.avatar || user?.avatarUrl || "")
            : (src || "");

    const imgSrc = resolveAvatarUrl(rawSrc) || default_avatar;

    const sizeValue = typeof size === "number" ? `${size}px` : size;

    const wrapperClass = [
        styles.wrapper,
        onClick ? styles.clickable : "",
        className || "",
    ]
        .filter(Boolean)
        .join(" ");

    const imageClass = [styles.img, imgClassName || ""].filter(Boolean).join(" ");

    const handleClick = () => onClick?.();

    return (
        <div
            className={wrapperClass}
            style={{ ...style, "--avatar-size": sizeValue }}
            onClick={onClick ? handleClick : undefined}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            title={title}
            onKeyDown={(e) => {
                if (!onClick) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <img
                src={imgSrc}
                alt={alt}
                className={imageClass}
                style={imgStyle}
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.src = default_avatar;
                }}
            />
        </div>
    );
}

export default Avatar;

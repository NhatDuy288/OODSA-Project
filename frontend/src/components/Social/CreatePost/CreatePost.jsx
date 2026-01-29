import { useMemo, useState } from "react";
import styles from "./CreatePost.module.css";
import Avatar from "../../Avatar/Avatar";
import { useSocial } from "../../../contexts/SocialContext";

function firstName(fullName) {
    if (!fullName) return "";
    const parts = String(fullName).trim().split(/\s+/);
    return parts[parts.length - 1] || fullName;
}

export default function CreatePost() {
    const { me, createPost } = useSocial();
    const [text, setText] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const placeholder = useMemo(
        () => `Bạn đang nghĩ gì, ${firstName(me.fullName) || "bạn"}?`,
        [me.fullName]
    );

    const canPost =
        (text || "").trim().length > 0 || (imageUrl || "").trim().length > 0;

    const handleSubmit = () => {
        if (!canPost) return;
        createPost(text, imageUrl.trim());
        setText("");
        setImageUrl("");
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.row}>
                <Avatar src={me.avatar} size={42} />
                <textarea
                    className={styles.input}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    rows={2}
                />
            </div>

            <div className={styles.row2}>
                <input
                    className={styles.imageInput}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="(Tuỳ chọn) Link ảnh..."
                />

                <button className={styles.postBtn} disabled={!canPost} onClick={handleSubmit}>
                    Đăng
                </button>
            </div>
        </div>
    );
}

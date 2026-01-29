import { useMemo, useState } from "react";
import styles from "./PostCard.module.css";
import Avatar from "../../Avatar/Avatar";
import { timeAgo } from "../../../utils/timeAgo";
import { useSocial } from "../../../contexts/SocialContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faComment, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export default function PostCard({ post, author, onOpenProfile }) {
    const { me, usersById, toggleLike, addComment } = useSocial();
    const [isOpenComments, setIsOpenComments] = useState(false);
    const [commentText, setCommentText] = useState("");

    const isLiked = useMemo(
        () => (post.likes || []).some((id) => String(id) === String(me.id)),
        [post.likes, me.id]
    );

    const likeCount = (post.likes || []).length;
    const commentCount = (post.comments || []).length;

    const handleLike = () => toggleLike(post.id);

    const handleAddComment = () => {
        const text = (commentText || "").trim();
        if (!text) return;
        addComment(post.id, text);
        setCommentText("");
        setIsOpenComments(true);
    };

    const goProfile = () => onOpenProfile?.(author?.id ?? post.userId);

    return (
        <article className={styles.card}>
            <header className={styles.header}>
                <button className={styles.authorBtn} onClick={goProfile}>
                    <Avatar src={author?.avatar} size={42} />
                    <div className={styles.authorMeta}>
                        <div className={styles.authorName}>{author?.fullName || ""}</div>
                        <div className={styles.time}>{timeAgo(post.createdAt)}</div>
                    </div>
                </button>
            </header>

            <div className={styles.content}>
                {post.content ? <p className={styles.text}>{post.content}</p> : null}
                {post.imageUrl ? (
                    <img className={styles.image} src={post.imageUrl} alt="post" loading="lazy" />
                ) : null}
            </div>

            <div className={styles.stats}>
                <div className={styles.statLeft}>
                    <span className={styles.likeDot} aria-hidden />
                    <span>{likeCount}</span>
                </div>
                <button
                    className={styles.statRight}
                    onClick={() => setIsOpenComments((p) => !p)}
                >
                    {commentCount} bình luận
                </button>
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.actionBtn} ${isLiked ? styles.actionActive : ""}`}
                    onClick={handleLike}
                >
                    <FontAwesomeIcon icon={faHeart} />
                    <span>Thích</span>
                </button>
                <button className={styles.actionBtn} onClick={() => setIsOpenComments(true)}>
                    <FontAwesomeIcon icon={faComment} />
                    <span>Bình luận</span>
                </button>
                <button className={styles.actionBtn} onClick={() => {}}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <span>Chia sẻ</span>
                </button>
            </div>

            {isOpenComments ? (
                <div className={styles.comments}>
                    <div className={styles.commentInputRow}>
                        <Avatar src={me.avatar} size={34} />
                        <input
                            className={styles.commentInput}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Viết bình luận..."
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddComment();
                            }}
                        />
                        <button className={styles.commentBtn} onClick={handleAddComment}>
                            Đăng
                        </button>
                    </div>

                    <div className={styles.commentList}>
                        {(post.comments || []).map((c) => {
                            const u = usersById[String(c.userId)];
                            return (
                                <div key={c.id} className={styles.commentItem}>
                                    <Avatar src={u?.avatar} size={30} />
                                    <div className={styles.commentBubble}>
                                        <button
                                            className={styles.commentAuthor}
                                            onClick={() => onOpenProfile?.(u?.id)}
                                        >
                                            {u?.fullName || ""}
                                        </button>
                                        <div className={styles.commentText}>{c.content}</div>
                                        <div className={styles.commentTime}>{timeAgo(c.createdAt)}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {commentCount === 0 ? (
                            <div className={styles.noComments}>Chưa có bình luận nào.</div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </article>
    );
}

import { useMemo, useState } from "react";
import styles from "./PostCard.module.css";
import Avatar from "../../Avatar/Avatar";
import { timeAgo } from "../../../utils/timeAgo";
import { useSocial } from "../../../contexts/SocialContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHeart,
    faComment,
    faPaperPlane,
    faThumbsUp,
    faFaceLaugh,
    faFaceSurprise,
    faFaceSadTear,
    faFaceAngry,
} from "@fortawesome/free-solid-svg-icons";

export default function PostCard({ post, author, onOpenProfile }) {
    const { me, usersById, react, toggleLike, addComment } = useSocial();
    const [isOpenComments, setIsOpenComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isOpenReactions, setIsOpenReactions] = useState(false);

    const myReactionType = post?.myReactionType || null;

    const reactionCounts = post?.reactionCounts || {};
    const commentCount = (post.comments || []).length;

    const reactionMeta = useMemo(
        () => [
            { type: "LIKE", label: "Thích", icon: faThumbsUp },
            { type: "LOVE", label: "Yêu thích", icon: faHeart },
            { type: "HAHA", label: "Haha", icon: faFaceLaugh },
            { type: "WOW", label: "Wow", icon: faFaceSurprise },
            { type: "SAD", label: "Buồn", icon: faFaceSadTear },
            { type: "ANGRY", label: "Phẫn nộ", icon: faFaceAngry },
        ],
        []
    );

    const totalReactions =
        typeof post?.totalReactions === "number"
            ? post.totalReactions
            : reactionMeta.reduce(
                (sum, r) => sum + (Number(reactionCounts?.[r.type]) || 0),
                0
            );

    const handleLike = () => toggleLike(post.id);

    const handleReact = (type) => {
        react(post.id, type);
        setIsOpenReactions(false);
    };

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
                    <div className={styles.reactionSummary}>
                        {reactionMeta.map((r) => {
                            const count = Number(reactionCounts?.[r.type]) || 0;
                            if (count <= 0) return null;
                            return (
                                <span key={r.type} className={styles.reactionPill} title={r.label}>
                                    <FontAwesomeIcon icon={r.icon} />
                                    <span>{count}</span>
                                </span>
                            );
                        })}
                        {totalReactions === 0 ? (
                            <span className={styles.reactionZero}>0</span>
                        ) : null}
                    </div>
                </div>
                <button
                    className={styles.statRight}
                    onClick={() => setIsOpenComments((p) => !p)}
                >
                    {commentCount} bình luận
                </button>
            </div>

            <div className={styles.actions}>
                <div
                    className={styles.reactionWrap}
                    onMouseLeave={() => setIsOpenReactions(false)}
                >
                    <button
                        className={`${styles.actionBtn} ${myReactionType ? styles.actionActive : ""}`}
                        onClick={handleLike}
                        onMouseEnter={() => setIsOpenReactions(true)}
                    >
                        <FontAwesomeIcon
                            icon={
                                myReactionType === "LIKE"
                                    ? faThumbsUp
                                    : myReactionType === "LOVE"
                                        ? faHeart
                                        : myReactionType === "HAHA"
                                            ? faFaceLaugh
                                            : myReactionType === "WOW"
                                                ? faFaceSurprise
                                                : myReactionType === "SAD"
                                                    ? faFaceSadTear
                                                    : myReactionType === "ANGRY"
                                                        ? faFaceAngry
                                                        : faThumbsUp
                            }
                        />
                        <span>
                            {myReactionType === "LOVE"
                                ? "Yêu thích"
                                : myReactionType === "HAHA"
                                    ? "Haha"
                                    : myReactionType === "WOW"
                                        ? "Wow"
                                        : myReactionType === "SAD"
                                            ? "Buồn"
                                            : myReactionType === "ANGRY"
                                                ? "Phẫn nộ"
                                                : "Thích"}
                        </span>
                    </button>

                    {isOpenReactions ? (
                        <div className={styles.reactionPicker}>
                            {reactionMeta.map((r) => (
                                <button
                                    key={r.type}
                                    className={`${styles.reactionPickBtn} ${
                                        myReactionType === r.type ? styles.reactionPickActive : ""
                                    }`}
                                    onClick={() => handleReact(r.type)}
                                    title={r.label}
                                >
                                    <FontAwesomeIcon icon={r.icon} />
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>
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

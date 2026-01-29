import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Profile.module.css";
import Avatar from "../../../components/Avatar/Avatar";
import PostCard from "../../../components/Social/Post/PostCard";
import { useSocial } from "../../../contexts/SocialContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLocationDot,
    faGraduationCap,
    faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { me, usersById, posts } = useSocial();

    const user = id ? usersById[String(id)] : me;

    const userPosts = useMemo(
        () => posts.filter((p) => String(p.userId) === String(user?.id)),
        [posts, user?.id]
    );

    const friends = (user?.friends || [])
        .map((fid) => usersById[String(fid)])
        .filter(Boolean)
        .slice(0, 8);

    if (!user) {
        return (
            <div className={styles.notFound}>
                Không tìm thấy hồ sơ.
                <button className={styles.back} onClick={() => navigate("/feed")}>
                    Về bảng tin
                </button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.cover}>
                <img src={user.coverUrl} alt="cover" />
            </div>

            <div className={styles.headerCard}>
                <div className={styles.headerTop}>
                    <div className={styles.avatarWrap}>
                        <Avatar src={user.avatar} size={120} />
                    </div>
                    <div className={styles.headerInfo}>
                        <div className={styles.nameRow}>
                            <h1 className={styles.name}>{user.fullName}</h1>
                            {String(user.id) === String(me.id) ? (
                                <button className={styles.primaryBtn} onClick={() => {}}>
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <button className={styles.primaryBtn} onClick={() => {}}>
                                    Kết bạn
                                </button>
                            )}
                        </div>
                        <div className={styles.bio}>{user.bio || ""}</div>

                        <div className={styles.quickInfo}>
                            {user.location ? (
                                <div className={styles.quickItem}>
                                    <FontAwesomeIcon icon={faLocationDot} />
                                    <span>{user.location}</span>
                                </div>
                            ) : null}
                            {user.education ? (
                                <div className={styles.quickItem}>
                                    <FontAwesomeIcon icon={faGraduationCap} />
                                    <span>{user.education}</span>
                                </div>
                            ) : null}
                            <div className={styles.quickItem}>
                                <FontAwesomeIcon icon={faUserGroup} />
                                <span>{(user.friends || []).length} bạn bè</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.body}>
                <aside className={styles.left}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Giới thiệu</div>
                        <div className={styles.aboutLine}>
                            {user.bio || "Chưa có giới thiệu."}
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Bạn bè</div>
                        <div className={styles.friendsGrid}>
                            {friends.map((f) => (
                                <button
                                    key={f.id}
                                    className={styles.friendItem}
                                    onClick={() => navigate(`/profile/${f.id}`)}
                                >
                                    <Avatar src={f.avatar} size={44} />
                                    <span className={styles.friendName}>{f.fullName}</span>
                                </button>
                            ))}
                            {friends.length === 0 ? (
                                <div className={styles.empty}>Chưa có bạn bè.</div>
                            ) : null}
                        </div>
                    </div>
                </aside>

                <section className={styles.main}>
                    <div className={styles.sectionTitle}>Bài viết</div>
                    <div className={styles.posts}>
                        {userPosts.map((p) => (
                            <PostCard
                                key={p.id}
                                post={p}
                                author={user}
                                onOpenProfile={(pid) => {
                                    if (!pid) return;
                                    navigate(
                                        String(pid) === String(me.id) ? "/profile" : `/profile/${pid}`
                                    );
                                }}
                            />
                        ))}
                        {userPosts.length === 0 ? (
                            <div className={styles.emptyPosts}>Chưa có bài viết nào.</div>
                        ) : null}
                    </div>
                </section>
            </div>
        </div>
    );
}

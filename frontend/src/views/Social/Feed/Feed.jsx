import { useNavigate } from "react-router-dom";
import CreatePost from "../../../components/Social/CreatePost/CreatePost";
import PostCard from "../../../components/Social/Post/PostCard";
import { useSocial } from "../../../contexts/SocialContext";
import styles from "./Feed.module.css";

export default function Feed() {
    const navigate = useNavigate();
    const { posts, usersById, me } = useSocial();

    return (
        <div className={styles.wrapper}>
            <CreatePost />

            <div className={styles.list}>
                {posts.map((p) => (
                    <PostCard
                        key={p.id}
                        post={p}
                        author={usersById[String(p.userId)]}
                        onOpenProfile={(id) => {
                            if (!id) return;
                            navigate(
                                String(id) === String(me.id) ? "/profile" : `/profile/${id}`
                            );
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

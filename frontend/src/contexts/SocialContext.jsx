import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AuthService } from "../services/auth.service";
import WebSocketService from "../services/WebSocketService";
import { getPosts, createPost as createPostApi, addComment as addCommentApi, toggleReaction } from "../api/posts";
import { getUsersById } from "../api/users";

const SocialContext = createContext(null);

const guessMeId = (u) =>
    String(u?.id ?? u?.userId ?? u?._id ?? u?.username ?? u?.email ?? "me");

const guessMeName = (u) => u?.fullName || u?.name || u?.username || "Bạn";

function makeMeFromAuth() {
    const u = AuthService.getUser();
    return {
        id: guessMeId(u),
        fullName: guessMeName(u),
        avatar: u?.avatar || u?.avatarUrl || "",
        username: u?.username,
        coverUrl: u?.coverUrl || "",
        bio: u?.bio || "",
        location: u?.location || "",
        education: u?.education || "",
        friends: u?.friends || [],
    };
}

const getErrMsg = (e, fallback = "Có lỗi xảy ra") => {
    const data = e?.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (e?.message) return e.message;
    return fallback;
};

export function SocialProvider({ children }) {
    const me = useMemo(() => makeMeFromAuth(), []);

    const [users, setUsers] = useState([me]);
    const [posts, setPosts] = useState([]);
    const fetchedUserIds = useRef(new Set());

    const normalizeUser = (u) => {
        if (!u) return null;
        return {
            id: String(u.id ?? u.userId ?? u._id ?? u.username ?? u.email),
            username: u.username,
            fullName: u.fullName || u.name || u.username || "Người dùng",
            avatar: u.avatar || u.avatarUrl || "",
            coverUrl: u.coverUrl || "",
            bio: u.bio || "",
            location: u.location || "",
            education: u.education || "",
            friends: u.friends || [],
        };
    };

    const upsertUsers = (incoming = []) => {
        setUsers((prev) => {
            const map = new Map(prev.map((x) => [String(x.id), x]));
            incoming.forEach((u) => {
                const nu = normalizeUser(u);
                if (!nu?.id) return;
                map.set(String(nu.id), { ...map.get(String(nu.id)), ...nu });
            });
            return Array.from(map.values());
        });
    };

    const ensureUsersForPosts = async (postList) => {
        const ids = new Set();
        (postList || []).forEach((p) => {
            if (p?.userId != null) ids.add(String(p.userId));
            (p?.comments || []).forEach((c) => {
                if (c?.userId != null) ids.add(String(c.userId));
            });
            (p?.likes || []).forEach((uid) => {
                if (uid != null) ids.add(String(uid));
            });
        });

        const toFetch = Array.from(ids).filter(
            (id) => id && id !== String(me.id) && !fetchedUserIds.current.has(String(id))
        );

        if (toFetch.length === 0) return;

        await Promise.all(
            toFetch.map(async (id) => {
                try {
                    fetchedUserIds.current.add(String(id));
                    const u = await getUsersById(id);
                    upsertUsers([u]);
                } catch {
                    // ignore
                }
            })
        );
    };

    const upsertPost = (post, mode = "upsert") => {
        if (!post?.id) return;
        setPosts((prev) => {
            const pid = String(post.id);
            const exists = prev.some((p) => String(p.id) === pid);

            let next = prev.map((p) => {
                if (String(p.id) !== pid) return p;
                const merged = { ...p, ...post };

                // broadcast sẽ gửi myReactionType=null -> giữ lại của user
                if (post?.myReactionType == null && p?.myReactionType != null) {
                    merged.myReactionType = p.myReactionType;
                }
                return merged;
            });

            if (!exists) {
                next = mode === "prepend" ? [post, ...next] : [...next, post];
            }

            next.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            return next;
        });
    };

    useEffect(() => {
        (async () => {
            try {
                const list = await getPosts();
                setPosts(Array.isArray(list) ? list : []);
                await ensureUsersForPosts(list);
            } catch (e) {
                toast.error(getErrMsg(e, "Không tải được bảng tin"));
                setPosts([]);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleEvent = async (evt) => {
            if (!evt?.post?.id) return;
            if (evt.type === "POST_CREATED") upsertPost(evt.post, "prepend");
            else upsertPost(evt.post, "upsert");
            await ensureUsersForPosts([evt.post]);
        };

        const cleanup = WebSocketService.subscribe("/topic/posts", handleEvent, true);
        return () => typeof cleanup === "function" && cleanup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const usersById = useMemo(() => {
        const map = {};
        users.forEach((u) => (map[String(u.id)] = u));
        return map;
    }, [users]);

    const createPost = async (content) => {
        const text = (content || "").trim();
        if (!text) return;

        try {
            const created = await createPostApi({ content: text });
            upsertPost(created, "prepend");
            await ensureUsersForPosts([created]);
        } catch (e) {
            toast.error(getErrMsg(e, "Đăng bài thất bại"));
        }
    };

    const react = async (postId, type) => {
        try {
            const updated = await toggleReaction(postId, { type });
            upsertPost(updated, "upsert");
            await ensureUsersForPosts([updated]);
        } catch (e) {
            toast.error(getErrMsg(e, "Thả cảm xúc thất bại"));
        }
    };

    const toggleLike = async (postId) => react(postId, "LIKE");

    const addComment = async (postId, text) => {
        const content = (text || "").trim();
        if (!content) return;

        try {
            const updated = await addCommentApi(postId, { content });
            upsertPost(updated, "upsert");
            await ensureUsersForPosts([updated]);
        } catch (e) {
            toast.error(getErrMsg(e, "Bình luận thất bại"));
        }
    };

    const value = useMemo(
        () => ({
            me,
            users,
            usersById,
            posts,
            createPost,
            react,
            toggleLike,
            addComment,
            setUsers,
            setPosts,
        }),
        [me, users, usersById, posts]
    );

    return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
    const ctx = useContext(SocialContext);
    if (!ctx) throw new Error("useSocial must be used within SocialProvider");
    return ctx;
}

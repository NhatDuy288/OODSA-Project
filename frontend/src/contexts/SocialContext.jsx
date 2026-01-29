import { createContext, useContext, useMemo, useState } from "react";
import { AuthService } from "../services/auth.service";
import { buildMockSocialData } from "../mock/socialMock";

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
        coverUrl: u?.coverUrl || "",
        bio: u?.bio || "",
        location: u?.location || "",
        education: u?.education || "",
    };
}

function makeId(prefix = "id") {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function SocialProvider({ children }) {
    const me = useMemo(() => makeMeFromAuth(), []);

    const initial = useMemo(() => buildMockSocialData(me), [me]);
    const [users, setUsers] = useState(initial.users);
    const [posts, setPosts] = useState(initial.posts);

    const usersById = useMemo(() => {
        const map = {};
        users.forEach((u) => {
            map[String(u.id)] = u;
        });
        return map;
    }, [users]);

    const createPost = (content, imageUrl) => {
        const text = (content || "").trim();
        if (!text && !imageUrl) return;

        const newPost = {
            id: makeId("p"),
            userId: String(me.id),
            content: text,
            imageUrl: imageUrl || "",
            createdAt: new Date().toISOString(),
            likes: [],
            comments: [],
        };

        setPosts((prev) => [newPost, ...prev]);
    };

    const toggleLike = (postId, userId = String(me.id)) => {
        setPosts((prev) =>
            prev.map((p) => {
                if (String(p.id) !== String(postId)) return p;
                const uid = String(userId);
                const hasLiked = (p.likes || []).some((x) => String(x) === uid);
                const nextLikes = hasLiked
                    ? (p.likes || []).filter((x) => String(x) !== uid)
                    : [...(p.likes || []), uid];
                return { ...p, likes: nextLikes };
            })
        );
    };

    const addComment = (postId, text) => {
        const content = (text || "").trim();
        if (!content) return;

        const comment = {
            id: makeId("c"),
            userId: String(me.id),
            content,
            createdAt: new Date().toISOString(),
        };

        setPosts((prev) =>
            prev.map((p) => {
                if (String(p.id) !== String(postId)) return p;
                return { ...p, comments: [...(p.comments || []), comment] };
            })
        );
    };

    const value = useMemo(
        () => ({
            me,
            users,
            usersById,
            posts,
            createPost,
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

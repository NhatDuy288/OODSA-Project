import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { getMyFriends } from "../../../../api/friends.jsx";
import conversationApi from "../../../../api/conversationApi.jsx";
import Avatar from "../../../Avatar/Avatar.jsx";
import styles from "./AddMembersModal.module.css";

export default function AddMembersModal({
                                            isOpen,
                                            onClose,
                                            conversationId,
                                            existingMemberIds = [],
                                            onSuccess,
                                        }) {
    const [loading, setLoading] = useState(false);
    const [friends, setFriends] = useState([]);
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState(new Set());
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setError("");
        setQ("");
        setSelected(new Set());
        (async () => {
            try {
                setLoading(true);
                const data = await getMyFriends();
                setFriends(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e?.response?.data?.message || e?.message || "Không tải được danh sách bạn bè");
            } finally {
                setLoading(false);
            }
        })();
    }, [isOpen]);

    const existingSet = useMemo(() => new Set((existingMemberIds || []).map((x) => Number(x))), [existingMemberIds]);

    const candidates = useMemo(() => {
        const lower = q.trim().toLowerCase();
        return (friends || [])
            .filter((u) => !existingSet.has(Number(u?.id)))
            .filter((u) => {
                if (!lower) return true;
                const name = (u?.fullName || u?.username || u?.email || "").toLowerCase();
                return name.includes(lower);
            });
    }, [friends, q, existingSet]);

    const toggle = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            const key = Number(id);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const submit = async () => {
        setError("");
        const memberIds = Array.from(selected);
        if (!conversationId || memberIds.length === 0) return;
        try {
            setLoading(true);
            const updated = await conversationApi.addMembers(conversationId, memberIds);
            onSuccess?.(updated);
            onClose?.();
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || "Không thể thêm thành viên");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.modal} role="dialog" aria-modal="true">
                <div className={styles.header}>
                    <div className={styles.title}>Thêm thành viên</div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={styles.searchRow}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm bạn bè..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.list}>
                    {loading ? (
                        <div className={styles.empty}>Đang tải...</div>
                    ) : candidates.length === 0 ? (
                        <div className={styles.empty}>Không có bạn bè nào để thêm</div>
                    ) : (
                        candidates.map((u) => {
                            const id = Number(u?.id);
                            const checked = selected.has(id);
                            const display = u?.fullName || u?.username || u?.email || `User ${id}`;
                            const avatar = u?.avatar || u?.avatarUrl || "";
                            return (
                                <label key={id} className={styles.item}>
                                    <input type="checkbox" checked={checked} onChange={() => toggle(id)} />
                                    <Avatar src={avatar} alt={display} size={36} className={styles.avatar} />
                                    <div className={styles.itemText}>
                                        <div className={styles.name}>{display}</div>
                                        {u?.username && <div className={styles.sub}>@{u.username}</div>}
                                    </div>
                                </label>
                            );
                        })
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button className={styles.primaryBtn} onClick={submit} disabled={loading || selected.size === 0}>
                        <FontAwesomeIcon icon={faUserPlus} />
                        <span>Thêm ({selected.size})</span>
                    </button>
                </div>
            </div>
        </>
    );
}

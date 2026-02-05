import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import Avatar from "../../../Avatar/Avatar.jsx";
import styles from "./TransferAdminModal.module.css";

export default function TransferAdminModal({
                                               isOpen,
                                               onClose,
                                               members = [],
                                               currentAdminId,
                                               title = "Chuyển quyền admin",
                                               confirmText = "Xác nhận",
                                               excludeIds = [],
                                               onSubmit,
                                               busy = false,
                                           }) {
    const [q, setQ] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        if (!isOpen) return;
        setQ("");
        setSelectedId(null);
    }, [isOpen]);

    const excludeSet = useMemo(() => new Set((excludeIds || []).map((x) => Number(x))), [excludeIds]);

    const candidates = useMemo(() => {
        const lower = q.trim().toLowerCase();
        return (members || [])
            .filter((m) => !excludeSet.has(Number(m?.id)))
            .filter((m) => Number(m?.id) !== Number(currentAdminId))
            .filter((m) => {
                if (!lower) return true;
                const name = (m?.fullName || m?.username || "").toLowerCase();
                return name.includes(lower);
            });
    }, [members, q, excludeSet, currentAdminId]);

    const submit = async () => {
        if (!selectedId) return;
        await onSubmit?.(Number(selectedId));
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.modal} role="dialog" aria-modal="true">
                <div className={styles.header}>
                    <div className={styles.title}>
                        <FontAwesomeIcon icon={faCrown} className={styles.crown} />
                        <span>{title}</span>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={styles.searchRow}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Tìm thành viên..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>

                <div className={styles.list}>
                    {candidates.length === 0 ? (
                        <div className={styles.empty}>Không có thành viên phù hợp</div>
                    ) : (
                        candidates.map((m) => {
                            const id = Number(m?.id);
                            const display = m?.fullName || m?.username || `User ${id}`;
                            const avatar = m?.avatarUrl || m?.avatar || "";
                            return (
                                <label key={id} className={styles.item}>
                                    <input
                                        type="radio"
                                        name="newAdmin"
                                        checked={Number(selectedId) === id}
                                        onChange={() => setSelectedId(id)}
                                    />
                                    <Avatar src={avatar} alt={display} size={34} className={styles.avatar} />
                                    <div className={styles.itemText}>
                                        <div className={styles.name}>{display}</div>
                                        {m?.username && <div className={styles.sub}>@{m.username}</div>}
                                    </div>
                                </label>
                            );
                        })
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={busy}>
                        Hủy
                    </button>
                    <button className={styles.primaryBtn} onClick={submit} disabled={busy || !selectedId}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </>
    );
}

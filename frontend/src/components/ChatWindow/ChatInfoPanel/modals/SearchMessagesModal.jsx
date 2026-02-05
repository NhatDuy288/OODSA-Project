import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import conversationApi from "../../../../api/conversationApi.jsx";
import styles from "./SearchMessagesModal.module.css";

function formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function SearchMessagesModal({
                                                isOpen,
                                                onClose,
                                                conversationId,
                                                onJumpToMessage,
                                            }) {
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        setQ("");
        setResults([]);
        setError("");
    }, [isOpen]);

    const canSearch = useMemo(() => q.trim().length >= 2, [q]);

    useEffect(() => {
        if (!isOpen) return;
        if (!canSearch) {
            setResults([]);
            setError("");
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                setLoading(true);
                setError("");
                const data = await conversationApi.searchMessages(conversationId, q.trim(), 30);
                setResults(Array.isArray(data) ? data : []);
            } catch (e) {
                setError(e?.response?.data?.message || e?.message || "Không thể tìm tin nhắn");
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => debounceRef.current && clearTimeout(debounceRef.current);
    }, [q, canSearch, isOpen, conversationId]);

    const jump = (id) => {
        onClose?.();
        setTimeout(() => onJumpToMessage?.(id), 50);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.modal} role="dialog" aria-modal="true">
                <div className={styles.header}>
                    <div className={styles.title}>Tìm tin nhắn</div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={styles.searchRow}>
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Nhập từ khóa (ít nhất 2 ký tự)..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.list}>
                    {!canSearch ? (
                        <div className={styles.empty}>Nhập ít nhất 2 ký tự để tìm.</div>
                    ) : loading ? (
                        <div className={styles.empty}>Đang tìm...</div>
                    ) : results.length === 0 ? (
                        <div className={styles.empty}>Không có kết quả</div>
                    ) : (
                        results.map((m) => (
                            <button key={m.id} className={styles.item} onClick={() => jump(m.id)}>
                                <div className={styles.itemTop}>
                                    <div className={styles.sender}>{m?.sender?.fullName || ""}</div>
                                    <div className={styles.time}>{formatTime(m?.createdAt)}</div>
                                </div>
                                <div className={styles.preview}>{m?.content || ""}</div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

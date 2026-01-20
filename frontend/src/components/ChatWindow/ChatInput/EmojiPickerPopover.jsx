import { useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import styles from "./EmojiPickerPopover.module.css";

function EmojiPickerPopover({ open, onClose, onSelect, ignoreSelector }) {
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return;

        const handleMouseDown = (e) => {
            if (ignoreSelector && e.target.closest(ignoreSelector)) return;

            if (rootRef.current && rootRef.current.contains(e.target)) return;

            if (onClose) {
                onClose();
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                if (onClose) {
                    onClose();
                }
            }
        };

        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onClose, ignoreSelector]);

    if (!open) return null;

    const handleEmojiClick = (emojiData) => {
        if (onSelect) {
            onSelect(emojiData.emoji);
        }
    };

    return (
        <div ref={rootRef} className={styles.popover}>
            <EmojiPicker onEmojiClick={handleEmojiClick} lazyLoadEmojis={true} />
        </div>
    );
}

export default EmojiPickerPopover;

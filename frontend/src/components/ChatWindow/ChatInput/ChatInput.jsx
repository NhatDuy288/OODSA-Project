import { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { faFaceSmile } from "@fortawesome/free-regular-svg-icons";
import { useChat } from "../../../contexts/ChatContext";
import EmojiPickerPopover from "./EmojiPickerPopover";
import styles from "./ChatInput.module.css";

function ChatInput() {
    const [message, setMessage] = useState("");
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const { currentConversation, sendMessage, sendTypingStatus } = useChat();

    // Auto resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    }, [message]);

    useEffect(() => {
        const t = setTimeout(() => {
            setIsEmojiOpen(false);
        }, 0);

        return () => clearTimeout(t);
    }, [currentConversation?.id]);

    // Stop typing indicator
    const stopTyping = useCallback(() => {
        if (isTypingRef.current) {
            isTypingRef.current = false;
            sendTypingStatus(false);
        }
    }, [sendTypingStatus]);

    // Handle typing with debounce
    const handleTyping = useCallback(() => {
        if (!currentConversation?.id) return;

        // Send typing = true if not already typing
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            sendTypingStatus(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, 2000);
    }, [currentConversation?.id, sendTypingStatus, stopTyping]);

    const insertEmoji = useCallback(
        (emoji) => {
            const el = textareaRef.current;

            if (!el) {
                setMessage((prev) => `${prev}${emoji}`);
                handleTyping();
                return;
            }

            const start = el.selectionStart ?? message.length;
            const end = el.selectionEnd ?? message.length;

            setMessage((prev) => {
                return prev.slice(0, start) + emoji + prev.slice(end);
            });

            requestAnimationFrame(() => {
                el.focus();
                const pos = start + emoji.length;
                el.setSelectionRange(pos, pos);
            });

            handleTyping();
        },
        [handleTyping, message.length]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            stopTyping();
        };
    }, [stopTyping]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || !currentConversation) return;

        // Stop typing indicator before sending
        stopTyping();
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        sendMessage(message.trim());
        setMessage("");
        setIsEmojiOpen(false);
    };

    const handleChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
    };

    const handleKeyDown = (e) => {
        // Enter to send, Shift+Enter for new line
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleToggleEmoji = () => {
        setIsEmojiOpen((prev) => !prev);
    };

    return (
        <form className={styles.wrapper} onSubmit={handleSubmit}>


            <button
                type="button"
                className={styles.emojiBtn}
                title="Emoji"
                data-emoji-toggle="1"
                onClick={handleToggleEmoji}
            >
                <FontAwesomeIcon icon={faFaceSmile} />
            </button>

            <EmojiPickerPopover
                open={isEmojiOpen}
                onClose={() => setIsEmojiOpen(false)}
                onSelect={insertEmoji}
                ignoreSelector='[data-emoji-toggle="1"]'
            />

            {/* Input Container */}
            <div className={styles.inputContainer}>
                <textarea
                    ref={textareaRef}
                    className={styles.textarea}
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />
            </div>

            {/* Send Button */}
            <button
                type="submit"
                className={styles.sendBtn}
                disabled={!message.trim()}
                title="Gửi tin nhắn"
            >
                <FontAwesomeIcon icon={faPaperPlane} />
            </button>
        </form>
    );
}

export default ChatInput;

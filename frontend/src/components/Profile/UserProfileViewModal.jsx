import { useEffect, useState } from "react";
import styles from "./ProfileModal.module.css";
import ProfileView from "./components/ProfileView";

function UserProfileViewModal({ isOpen, onClose, profile: profileProp, fetchProfile }) {
    const [profile, setProfile] = useState(profileProp || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setError("");

        if (profileProp) {
            setProfile(profileProp);
            return;
        }

        if (!fetchProfile) {
            setProfile(null);
            return;
        }

        (async () => {
            setIsLoading(true);
            try {
                const data = await fetchProfile();
                setProfile(data);
            } catch {
                setError("Không thể tải hồ sơ người dùng.");
            } finally {
                setIsLoading(false);
            }
        })();
    }, [isOpen, profileProp, fetchProfile]);

    if (!isOpen) return null;

    return (
        <div className={`${styles.overlay} ${styles.overlayVisible}`} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.slider}>
                    <ProfileView
                        styles={styles}
                        isLoading={isLoading}
                        error={error}
                        profile={profile}
                        avatarValue={profile?.avatar || ""}
                        onClose={onClose}
                        onEdit={() => {}}
                        onEditAvatar={() => {}}
                        isSaving={false}
                        title="Profile"
                        showSubtitle={false}
                        showUpdateButton={false}
                        allowEditAvatar={false}
                    />
                    <div className={styles.panel} />
                </div>
            </div>
        </div>
    );
}

export default UserProfileViewModal;

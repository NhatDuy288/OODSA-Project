import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen, faCamera } from "@fortawesome/free-solid-svg-icons";
import logoFull from "../../../assets/logo_full.png";
import Avatar from "../../Avatar/Avatar";

function pad2(n) {
    return String(n).padStart(2, "0");
}

function formatDOB(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function genderLabel(g) {
    if (g === "MALE") return "Nam";
    if (g === "FEMALE") return "Nữ";
    if (g === "OTHER") return "Khác";
    return "-";
}

function statusMeta(status) {
    const s = String(status || "").toUpperCase();
    if (s === "ONLINE") return { label: "Online", type: "online" };
    if (s === "OFFLINE") return { label: "Offline", type: "offline" };
    return { label: s || "-", type: "offline" };
}

function ProfileView({
                         styles,
                         isLoading,
                         error,
                         profile,
                         avatarValue,
                         onClose,
                         onEdit,
                         onEditAvatar,
                         isSaving,
                         title = "Profile",
                         showSubtitle = true,
                         showUpdateButton = true,
                         allowEditAvatar = true,
                         showStatus = true,
                     }) {
    const meta = statusMeta(profile?.status);

    const handleClose = () => {
        if (isSaving) return;
        onClose();
    };

    const rawAvatar = avatarValue || profile?.avatar || profile?.avatarUrl || "";

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <span className={styles.title}>{title}</span>
                <button className={styles.iconBtn} onClick={handleClose} disabled={isSaving}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <div className={styles.content}>
                {isLoading ? (
                    <div className={styles.loading}>
                        <div className={styles.spinner} />
                    </div>
                ) : (
                    <div className={styles.viewLayout}>
                        <div className={styles.profileHeader}>
                            <div className={styles.profileHeaderInner}>
                                <div className={styles.profileLeft}>
                                    <div className={styles.avatarWrap}>
                                        <Avatar
                                            src={rawAvatar}
                                            alt="avatar"
                                            size="100%"
                                            className={styles.avatar}
                                            imgClassName={styles.avatar}
                                        />

                                        {allowEditAvatar && (
                                            <button
                                                className={styles.avatarEditBtn}
                                                onClick={onEditAvatar}
                                                title="Đổi ảnh"
                                                disabled={isSaving}
                                            >
                                                <FontAwesomeIcon icon={faCamera} />
                                            </button>
                                        )}
                                    </div>

                                    <div className={styles.profileText}>
                                        <div className={styles.displayName}>
                                            {profile?.fullName || "Tên user"}
                                        </div>
                                        <div className={styles.subLine}>
                                            <span className={styles.subStrong}>{profile?.username || "-"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.profileRight}>
                                    {showStatus && (
                                        <span
                                            className={`${styles.statusBadge} ${
                                                meta.type === "online" ? styles.statusOnline : styles.statusOffline
                                            }`}
                                        >
                      <span className={styles.statusDot} />
                                            {meta.label}
                    </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.sectionCard}>
                            <div className={styles.sectionHead}>
                                <img className={styles.schoolLogo} src={logoFull} alt="logo" />
                                <div className={styles.sectionHeadText}>
                                    <div className={styles.sectionHeadTitle}>Thông tin cá nhân</div>
                                    {showSubtitle && (
                                        <div className={styles.sectionHeadSub}>
                                            Cập nhật chi tiết cá nhân và thông tin hồ sơ của bạn
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.sectionBody}>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabel}>Giới tính</div>
                                    <div className={styles.infoValue}>{genderLabel(profile?.gender)}</div>
                                </div>

                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabel}>Ngày sinh</div>
                                    <div className={styles.infoValue}>{formatDOB(profile?.dateOfBirth)}</div>
                                </div>

                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabel}>Email</div>
                                    <div className={styles.infoValue}>{profile?.email || "user1@gmail.com"}</div>
                                </div>

                                {error ? <div className={styles.error}>{error}</div> : null}
                            </div>
                        </div>

                        {showUpdateButton && (
                            <button className={styles.updateBtn} onClick={onEdit} disabled={isSaving}>
                                <FontAwesomeIcon icon={faPen} />
                                <span>{isSaving ? "Đang xử lý..." : "Cập nhật"}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileView;

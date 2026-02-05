import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faArrowLeft, faPen } from "@fortawesome/free-solid-svg-icons";
import logoFull from "../../../assets/logo_full.png";

function pad2(n) {
    return String(n).padStart(2, "0");
}

function ProfileEdit({
                         styles,
                         error,
                         isSaving,
                         isChanged,
                         years,
                         days,
                         months,
                         form,
                         onClose,
                         onBack,
                         onChangeField,
                         onChangeDOB,
                         onSave,
                     }) {
    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <button className={styles.iconBtn} onClick={onBack} disabled={isSaving}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <span className={styles.title}>Profile &amp; Settings</span>
                <button className={styles.iconBtn} onClick={onClose} disabled={isSaving}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            <div className={styles.contentEdit}>
                <div className={styles.sectionCard}>
                    <div className={styles.sectionHead}>
                        <img className={styles.schoolLogo} src={logoFull} alt="logo" />
                        <div className={styles.sectionHeadText}>
                            <div className={styles.sectionHeadTitle}>Thông tin cá nhân</div>
                            <div className={styles.sectionHeadSub}>
                                Cập nhật chi tiết cá nhân và thông tin hồ sơ của bạn
                            </div>
                        </div>
                    </div>

                    <div className={styles.form}>
                        <div className={styles.field}>
                            <label className={styles.label}>Tên hiển thị</label>
                            <input
                                className={styles.input}
                                value={form.fullName}
                                onChange={(e) => onChangeField("fullName", e.target.value)}
                                placeholder="Nhập tên hiển thị"
                                disabled={isSaving}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Giới tính</label>
                            <div className={styles.genderRow}>
                                <label className={styles.genderItem}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="MALE"
                                        checked={form.gender === "MALE"}
                                        onChange={(e) => onChangeField("gender", e.target.value)}
                                        disabled={isSaving}
                                    />
                                    <span>Nam</span>
                                </label>

                                <label className={styles.genderItem}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="FEMALE"
                                        checked={form.gender === "FEMALE"}
                                        onChange={(e) => onChangeField("gender", e.target.value)}
                                        disabled={isSaving}
                                    />
                                    <span>Nữ</span>
                                </label>

                                <label className={styles.genderItem}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="OTHER"
                                        checked={form.gender === "OTHER"}
                                        onChange={(e) => onChangeField("gender", e.target.value)}
                                        disabled={isSaving}
                                    />
                                    <span>Khác</span>
                                </label>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Ngày sinh</label>
                            <div className={styles.dobRow}>
                                <select
                                    className={styles.select}
                                    value={form.dob.day}
                                    onChange={(e) => onChangeDOB("day", e.target.value)}
                                    disabled={isSaving}
                                >
                                    <option value="">DD</option>
                                    {days.map((d) => (
                                        <option key={d} value={d}>
                                            {pad2(d)}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className={styles.select}
                                    value={form.dob.month}
                                    onChange={(e) => onChangeDOB("month", e.target.value)}
                                    disabled={isSaving}
                                >
                                    <option value="">MM</option>
                                    {months.map((m) => (
                                        <option key={m} value={m}>
                                            {pad2(m)}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className={styles.select}
                                    value={form.dob.year}
                                    onChange={(e) => onChangeDOB("year", e.target.value)}
                                    disabled={isSaving}
                                >
                                    <option value="">YYYY</option>
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Email</label>
                            <input
                                className={styles.input}
                                type="email"
                                value={form.email}
                                onChange={(e) => onChangeField("email", e.target.value)}
                                placeholder="user1@gmail.com"
                                disabled={isSaving}
                            />
                        </div>

                        {error ? <div className={styles.error}>{error}</div> : null}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.saveBtn}
                        onClick={onSave}
                        disabled={!isChanged || isSaving}
                    >
                        <FontAwesomeIcon icon={faPen} />
                        <span>{isSaving ? "Đang lưu..." : "Cập nhật"}</span>
                    </button>

                    <button className={styles.cancelBtn} onClick={onBack} disabled={isSaving}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileEdit;

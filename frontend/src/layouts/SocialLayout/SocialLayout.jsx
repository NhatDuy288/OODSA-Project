import { NavLink, Outlet, useNavigate } from "react-router-dom";
import styles from "./SocialLayout.module.css";
import logo from "../../assets/logo_full.png";
import Avatar from "../../components/Avatar/Avatar";
import { SocialProvider, useSocial } from "../../contexts/SocialContext";
import GlobalDefautl from "../../styles/GlobalDefautl/GlobalDefautl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHouse,
    faMessage,
    faUser,
    faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

function Shell() {
    const navigate = useNavigate();
    const { me, users } = useSocial();

    const suggestions = users
        .filter((u) => String(u.id) !== String(me.id))
        .slice(0, 3);

    return (
        <div className={styles.page}>
            <header className={styles.topbar}>
                <div
                    className={styles.brand}
                    onClick={() => navigate("/feed")}
                    role="button"
                    tabIndex={0}
                >
                    <img src={logo} alt="UTHHub" className={styles.logo} />
                    <span className={styles.brandText}>UTHHub</span>
                </div>

                <div className={styles.search}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                    <input placeholder="Tìm kiếm" />
                </div>

                <div className={styles.navIcons}>
                    <button
                        className={styles.iconBtn}
                        onClick={() => navigate("/feed")}
                        title="Bảng tin"
                    >
                        <FontAwesomeIcon icon={faHouse} />
                    </button>
                    <button
                        className={styles.iconBtn}
                        onClick={() => navigate("/messages")}
                        title="Tin nhắn"
                    >
                        <FontAwesomeIcon icon={faMessage} />
                    </button>
                    <button
                        className={styles.iconBtn}
                        onClick={() => navigate("/profile")}
                        title="Trang cá nhân"
                    >
                        <FontAwesomeIcon icon={faUser} />
                    </button>
                    <button
                        className={styles.me}
                        onClick={() => navigate("/profile")}
                        title={me.fullName}
                    >
                        <Avatar src={me.avatar} size={32} />
                        <span className={styles.meName}>{me.fullName}</span>
                    </button>
                </div>
            </header>

            <div className={styles.content}>
                <aside className={styles.left}>
                    <button
                        className={styles.userCard}
                        onClick={() => navigate("/profile")}
                        title="Xem trang cá nhân"
                    >
                        <Avatar src={me.avatar} size={40} />
                        <div className={styles.userMeta}>
                            <div className={styles.userName}>{me.fullName}</div>
                            <div className={styles.userSub}>Trang cá nhân của bạn</div>
                        </div>
                    </button>

                    <nav className={styles.nav}>
                        <NavLink
                            to="/feed"
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                            }
                        >
                            <FontAwesomeIcon icon={faHouse} />
                            <span>Bảng tin</span>
                        </NavLink>
                        <NavLink
                            to="/messages"
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                            }
                        >
                            <FontAwesomeIcon icon={faMessage} />
                            <span>Tin nhắn</span>
                        </NavLink>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                            }
                        >
                            <FontAwesomeIcon icon={faUser} />
                            <span>Trang cá nhân</span>
                        </NavLink>
                    </nav>
                </aside>

                <main className={styles.main}>
                    <Outlet />
                </main>

                <aside className={styles.right}>
                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Gợi ý kết bạn</div>
                        <div className={styles.suggestions}>
                            {suggestions.map((u) => (
                                <button
                                    key={u.id}
                                    className={styles.suggestionItem}
                                    onClick={() => navigate(`/profile/${u.id}`)}
                                >
                                    <Avatar src={u.avatar} size={36} />
                                    <div className={styles.suggestionMeta}>
                                        <div className={styles.suggestionName}>{u.fullName}</div>
                                        <div className={styles.suggestionSub}>
                                            {u.location || ""}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardTitle}>Mẹo UI</div>
                        <p className={styles.tip}>
                            Tất cả dữ liệu ở phần này đang nhập cứng để làm UI. Backend sẽ nối
                            sau.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default function SocialLayout() {
    return (
        <GlobalDefautl>
            <SocialProvider>
                <Shell />
            </SocialProvider>
        </GlobalDefautl>
    );
}

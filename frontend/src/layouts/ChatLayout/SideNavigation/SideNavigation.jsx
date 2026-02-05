import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMessage,
    faAddressBook,
    faBell,
} from "@fortawesome/free-regular-svg-icons";
import {
    faGear,
    faArrowRightFromBracket,
    faHouse,
} from "@fortawesome/free-solid-svg-icons";
import Avatar from "../../../components/Avatar/Avatar";
import NavButton from "../../../components/NavButton/NavButton";
import styles from "./SideNavigation.module.css";
import { useChat } from "../../../contexts/ChatContext";
import { useNotifications } from "../../../contexts/NotificationsContext";
import { CHAT_TABS } from "../../../constants/contactsMenu";
import { logout } from "../../../api/auth";
import { useState } from "react";
import { createPortal } from "react-dom";
import Notifications from "../../../components/Notifications/Notifications";
import Settings from "../../../components/Settings/Settings";
import ProfileModal from "../../../components/Profile/ProfileModal";

function SideNavigation() {
    const { leftTab, setLeftTab } = useChat();
    const { unreadCount } = useNotifications();
    const [isShowNotifications, setIsShowNotifications] = useState(false);
    const [isShowSetting, setIsShowSetting] = useState(false);
    const [isShowProfile, setIsShowProfile] = useState(false);
    const navigate = useNavigate();
    const handleGoHome = () => {
        navigate("/feed");
    };

    const hanldLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const handleShowNotifications = () => {
        setIsShowNotifications((prev) => !prev);
    };

    const hanldeShowSetting = () => {
        setIsShowSetting((prev) => !prev);
    };

    const handleShowProfile = () => {
        setIsShowProfile((prev) => !prev);
    };

    const modal = isShowNotifications
        ? createPortal(
            <div>
                <Notifications onClick={handleShowNotifications} />
            </div>,
            document.body
        )
        : null;

    const modalSetting = isShowSetting
        ? createPortal(<Settings onClick={hanldeShowSetting} />, document.body)
        : null;

    const modalProfile = isShowProfile
        ? createPortal(
            <ProfileModal isOpen={isShowProfile} onClose={handleShowProfile} />,
            document.body
        )
        : null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.top}>
                <Avatar variant="me" onClick={handleShowProfile} />
                {modalProfile}
                <NavButton onClick={handleGoHome} active={false}>
                 <FontAwesomeIcon icon={faHouse} />
                </NavButton>
                <NavButton
                    onClick={() => setLeftTab(CHAT_TABS.MESSAGES)}
                    active={leftTab === CHAT_TABS.MESSAGES}
                >
                    <FontAwesomeIcon icon={faMessage} />
                </NavButton>
                <NavButton
                    onClick={() => setLeftTab(CHAT_TABS.CONTACTS)}
                    active={leftTab === CHAT_TABS.CONTACTS}
                >
                    <FontAwesomeIcon icon={faAddressBook} />
                </NavButton>
            </div>
            <div className={styles.bottom}>
                <NavButton onClick={handleShowNotifications}>
                <div style={{ position: "relative", display: "inline-block" }}>
                    <FontAwesomeIcon icon={faBell} />
                <span
                style={{
                  position: "absolute",
                  top: "-8px",     
                  right: "-6px",  
                  backgroundColor: "#FF3B30", 
                  color: "white",
                  fontSize: "10px",
                  fontWeight: "bold",
                  height: "18px",
                  minWidth: "18px",
                  borderRadius: "50%", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fff", 
                  padding: "0 4px",
                  boxSizing: "border-box"
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
                </span>
          </div>
                </NavButton>
                {modal}
                <NavButton onClick={hanldeShowSetting}>
                    <FontAwesomeIcon icon={faGear} />
                </NavButton>
                {modalSetting}
                <NavButton onClick={hanldLogout}>
                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                </NavButton>
            </div>
        </div>
    );
}
export default SideNavigation;
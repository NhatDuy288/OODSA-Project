import styles from "./Avatar.module.css";
import default_avatar from "../../assets/default_avatar.jpg";

function Avatar({ src, alt = "avatar" }) {
  const imgSrc = src || default_avatar;

  return (
    <div className={styles.wrapper}>
      <img src={imgSrc} alt={alt} />
    </div>
  );
}

export default Avatar;
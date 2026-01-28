import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import bg from "../../../assets/background_uth.jpg";
import logo from "../../../assets/logo_full.png";
import { login } from "../../../api/auth.jsx";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.username, form.password);
      navigate("/feed"); // đổi từ messages -> feed
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={styles.container}>
        <div className={styles.left} style={{ backgroundImage: `url(${bg})` }}>
          <div className={styles.overlay} />
        </div>

        <div className={styles.right}>
          <div className={styles.logoWrapper}>
            <img src={logo} alt="logo" className={styles.logo} />
          </div>

          <h1 className={styles.title}>Đăng nhập</h1>

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <FontAwesomeIcon icon={faUser} className={styles.icon} />
              <input
                  type="text"
                  name="username"
                  placeholder="Tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                  className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <FontAwesomeIcon icon={faLock} className={styles.icon} />
              <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  className={styles.input}
              />
              <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword((prev) => !prev)}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.submit} disabled={loading}>
              {loading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
            </button>

            <button
                type="button"
                className={styles.registerBtn}
                onClick={() => navigate("/register")}
            >
              ĐĂNG KÝ
            </button>
          </form>

          <p className={styles.forgot}>Quên mật khẩu?</p>
        </div>
      </div>
  );
}

export default Login;

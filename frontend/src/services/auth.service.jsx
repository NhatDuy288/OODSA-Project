const TOKEN_KEY = "access_token";
const USER_KEY = "user";
export const AuthService = {
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },
  logout() {
    this.removeToken();
    this.removeUser();
  },
  isAuthenticated() {
    return !!this.getToken();
  },
};

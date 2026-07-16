import { useContext,useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      
      const data = await login({ email, password });
      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username , email, password }) => {
    setLoading(true);
    try {
      const data = await register({
        username,
        email,
        password,
      });
      setUser(data.user);
    } catch (err) {
     
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      await logout();
      setUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetMe = async () => {
    try {
      setLoading(true);

      const data = await getMe();
      setUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
      const getAndSetUser = async () => {
        try {
          const data = await getMe();
  
          if (data?.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error(error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
  
      getAndSetUser();
    }, []);

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGetMe,
  };
};
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';
import { toast } from 'sonner';

const AuthContext = createContext();
const TOKEN_KEY = 'shifacare_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkUserLoggedIn(); }, []);

  const checkUserLoggedIn = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      setUser(data.data);
      toast.success(`Welcome back, ${data.data.name}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      setUser(data.data);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    toast.success('Logged out');
  };

  // Update name / phone / address — keeps user state in sync
  const updateProfile = async (fields) => {
    try {
      const { data } = await api.put('/auth/updateprofile', fields);
      setUser(data.data);
      toast.success('Profile updated');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      return { success: false };
    }
  };

  // Upload new avatar — re-fetches user so avatar URL is fresh
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.put('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser((prev) => ({ ...prev, avatar: data.data.avatar }));
      toast.success('Avatar updated');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Avatar upload failed');
      return { success: false };
    }
  };

  // Change password — token stays valid (backend issues new token)
  const deleteAvatar = async () => {
    try {
      await api.delete('/auth/avatar');
      setUser((prev) => ({ ...prev, avatar: 'no-photo.jpg' }));
      toast.success('Profile photo removed');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove photo');
      return { success: false };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/auth/updatepassword', { currentPassword, newPassword });
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile,
      uploadAvatar,
      deleteAvatar,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

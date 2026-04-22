import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

export function AppProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      const url = user?.role === 'student'
        ? `${API_URL}/complaints?studentId=${user.id}`
        : `${API_URL}/complaints`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setComplaints(data);
    } catch (err) {
      console.error('fetchComplaints error:', err);
    }
  };

  useEffect(() => {
    if (user) fetchComplaints();
  }, [user]);

  const addComplaint = async (complaintData) => {
    try {
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...complaintData, student_id: user.id })
      });
      if (res.ok) await fetchComplaints();
    } catch (err) {
      console.error('addComplaint error:', err);
    }
  };

  /**
   * Universal complaint update — accepts any combination of:
   *   { status, assigned_worker, locked_by }
   * Updates state optimistically from the server response.
   */
  const updateComplaint = async (id, fields) => {
    try {
      const res = await fetch(`${API_URL}/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (data.success && data.complaint) {
        // Optimistic local update — no full refetch needed
        setComplaints(prev =>
          prev.map(c => (c.id === id ? { ...c, ...data.complaint } : c))
        );
      } else {
        // Fallback: refetch on any server error message
        await fetchComplaints();
        if (!data.success) throw new Error(data.message || 'Update failed');
      }
      return data;
    } catch (err) {
      console.error('updateComplaint error:', err);
      throw err;
    }
  };

  // Legacy helpers — kept for backward compatibility
  const updateComplaintStatus = async (id, newStatus) => {
    return updateComplaint(id, { status: newStatus, locked_by: null });
  };

  const toggleLock = async (id, adminId) => {
    const complaint = complaints.find(c => c.id === id);
    const isLockedByMe = complaint?.locked_by === adminId;
    return updateComplaint(id, { locked_by: isLockedByMe ? null : adminId });
  };

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${role}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        const userData = { ...data.user, role };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (err) {
      console.error('login error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <AppContext.Provider value={{
      complaints,
      user,
      login,
      logout,
      loading,
      addComplaint,
      updateComplaint,
      updateComplaintStatus,
      toggleLock,
      fetchComplaints
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);

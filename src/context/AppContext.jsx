import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AppProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [user, setUser] = useState(null); // { id, name, email, role }
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      const url = user?.role === 'student' ? `${API_URL}/complaints?studentId=${user.id}` : `${API_URL}/complaints`;
      const res = await fetch(url);
      const data = await res.json();
      if(Array.isArray(data)) setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const addComplaint = async (complaintData) => {
    try {
      const res = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...complaintData, student_id: user.id })
      });
      if (res.ok) fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const updateComplaintStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, locked_by: null })
      });
      if (res.ok) fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLock = async (id, adminId) => {
    try {
      const complaint = complaints.find(c => c.id === id);
      const isLockedByMe = complaint.locked_by === adminId;
      
      const res = await fetch(`${API_URL}/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked_by: isLockedByMe ? null : adminId })
      });
      if (res.ok) fetchComplaints();
    } catch (err) {
      console.error(err);
    }
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
        setUser({ ...data.user, role });
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ complaints, user, login, logout, loading, addComplaint, updateComplaintStatus, toggleLock, fetchComplaints }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);

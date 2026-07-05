import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  
  // Pure React Dropdown Toggle State
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Poll for notifications if user is authenticated
  useEffect(() => {
    if (!token) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdown if user clicks anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.length > notifications.length && notifications.length > 0) {
        setActiveToast(res.data[0]);
      }
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed fetching notification streams:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setShowDropdown(false); 
    } catch (err) {
      console.error('Failed clearing notifications:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 position-relative" style={{ zIndex: 1040 }}>
        <Link className="navbar-brand fw-bold" to="/dashboard">TaskManager</Link>
        
        {token && (
          <div className="navbar-nav ms-auto align-items-center gap-2">
            <Link className="nav-link text-white m-0 px-2" to="/dashboard">Dashboard</Link>
            <Link className="nav-link text-white m-0 px-2" to="/tasks">Tasks</Link>
            
            {/* Conditional Check for Admin Directory Features */}
            {user?.role === 'Admin' && (
              <>
                <Link className="nav-link text-white m-0 px-2" to="/employees">Employees</Link>
                {/* ✅ ADDED: System Reports link explicitly for Admins */}
                <Link className="nav-link text-white m-0 px-2 me-2" to="/reports">Reports</Link>
              </>
            )}
            
            {/* BOOTSTRAP NOTIFICATION HUB DROPDOWN USING PURE REACT LOGIC */}
            <div className="dropdown me-3" ref={dropdownRef}>
              <button 
                className="btn btn-link text-white-50 position-relative p-1 border-0 shadow-none" 
                type="button" 
                onClick={() => setShowDropdown(!showDropdown)} 
              >
                <Bell size={18} className="text-light" />
                {notifications.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px', padding: '3px 5px' }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              
              <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 p-0 rounded-3 ${showDropdown ? 'show' : ''}`} style={{ width: '300px', zIndex: 1050, right: 0, left: 'auto' }}>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top-3">
                  <h6 className="mb-0 fw-bold text-dark small">System Notifications</h6>
                  {notifications.length > 0 && (
                    <button onClick={markAllAsRead} className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-semibold small" style={{ fontSize: '11px' }}>
                      Clear All
                    </button>
                  )}
                </div>
                <div className="overflow-auto" style={{ maxHeight: '250px' }}>
                  {notifications.length === 0 ? (
                    <li className="p-4 text-center text-muted small">No pending updates.</li>
                  ) : (
                    notifications.map((notif) => (
                      <li key={notif.Id} className="p-3 border-bottom dropdown-item-text bg-white">
                        <p className="mb-1 text-dark small fw-medium" style={{ whiteSpace: 'normal', lineHeight: '1.4' }}>{notif.Message}</p>
                        <small className="text-muted d-block" style={{ fontSize: '10px' }}>
                          {new Date(notif.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </li>
                    ))
                  )}
                </div>
              </ul>
            </div>

            <span className="navbar-text text-light me-3">Hi, {user?.fullName} ({user?.role})</span>
            <button className="btn btn-danger btn-sm px-3" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </nav>

      {/* FLOATING TOASTS */}
      {activeToast && (
        <div className="position-fixed top-0 end-0 p-3 mt-5 pt-3" style={{ zIndex: 1060 }}>
          <div className="toast show align-items-center text-white bg-dark border-0 shadow-lg rounded-3" role="alert">
            <div className="d-flex">
              <div className="toast-body p-3">
                <div className="fw-bold text-warning small mb-1">⚡ New Assignment Update</div>
                <span className="small">{activeToast.Message}</span>
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setActiveToast(null)}></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
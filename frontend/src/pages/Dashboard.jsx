import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, CheckCircle2, AlertCircle, Clock, Users, FileText } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Decoded from your local storage auth state
const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')) || { role: 'Employee', fullName: 'Team Member' };
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to pull analytics grid stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container p-5 text-center text-muted placeholder-glow">
        <span className="placeholder col-4 py-2 rounded"></span>
        <div className="mt-2 fw-medium">Assembling metrics dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Welcome Hero Banner */}
      <div className="bg-dark bg-gradient text-white rounded-3 p-4 mb-4 shadow-sm d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1">Welcome Back, {user.fullName}</h1>
          <p className="text-light opacity-75 small mb-0">Here is the current state of operations today.</p>
        </div>
        <span className="badge bg-secondary bg-opacity-25 border border-secondary border-opacity-50 rounded-pill px-3 py-2 text-uppercase d-inline-flex align-items-center gap-1 align-self-start align-self-sm-center" style={{ fontSize: '11px', trackingWith: '0.5px' }}>
          <Shield size={14} className="text-info" /> {user.role} Nodes
        </span>
      </div>

      {/* Conditional Stat Grids */}
      {user.role === 'Admin' ? (
        <div className="row g-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard title="Total Employees" count={stats?.totalEmployees || 0} icon={<Users size={24} className="text-primary" />} bg="bg-primary-subtle" border="border-primary-subtle" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard title="Total Assigned Tasks" count={stats?.totalTasks || 0} icon={<FileText size={24} className="text-purple" />} bg="bg-light" border="border-light-subtle" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard title="Completed Tasks" count={stats?.completedTasks || 0} icon={<CheckCircle2 size={24} className="text-success" />} bg="bg-success-subtle" border="border-success-subtle" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard title="Pending Backlog" count={stats?.pendingTasks || 0} icon={<Clock size={24} className="text-warning" />} bg="bg-warning-subtle" border="border-warning-subtle" />
          </div>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard title="My Allocated Tasks" count={stats?.myTasks || 0} icon={<FileText size={24} className="text-primary" />} bg="bg-primary-subtle" border="border-primary-subtle" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard title="My Completed Tasks" count={stats?.completed || 0} icon={<CheckCircle2 size={24} className="text-success" />} bg="bg-success-subtle" border="border-success-subtle" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard title="My Pending Actions" count={stats?.pending || 0} icon={<Clock size={24} className="text-warning" />} bg="bg-warning-subtle" border="border-warning-subtle" />
          </div>
          <div className="col-12 col-sm-6 col-lg-3">
            <StatCard title="Overdue Milestones" count={stats?.overdue || 0} icon={<AlertCircle size={24} className="text-danger" />} bg="bg-danger-subtle" border="border-danger-subtle" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, count, icon, bg, border }) {
  return (
    <div className={`card h-100 shadow-sm border ${border} transition-transform`} style={{ cursor: 'default' }}>
      <div className="card-body d-flex align-items-center justify-content-between p-4">
        <div>
          <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{title}</p>
          <h3 className="display-6 fw-bold text-dark mb-0">{count}</h3>
        </div>
        <div className={`p-3 rounded-3 ${bg} d-flex align-items-center justify-content-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
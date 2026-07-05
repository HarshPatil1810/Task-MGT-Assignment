import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpDown, Edit, Trash, Plus, Search } from 'lucide-react';

export default function Employees() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('FullName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);

  // Added department and designation schema keys here
  const [formData, setFormData] = useState({ id: null, fullName: '', email: '', password: '', department: '', designation: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [search, sortBy, sortOrder, page]);

const fetchEmployees = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/employees`, {
      headers: { Authorization: `Bearer ${token}` },
      // Make sure 'sortOrder' maps to 'order' to match your backend query variable
      params: { 
        search, 
        sortBy, 
        order: sortOrder, 
        page, 
        limit: 5 
      }
    });
    
   
    setEmployees(res.data?.employees || []);
    
    setMeta({
      currentPage: res.data?.page || 1,
      totalPages: res.data?.totalPages || 1,
      totalRecords: res.data?.totalCount || 0
    });
    
  } catch (err) {
    console.error("Failed fetching employee directory stream:", err);
    setEmployees([]); // Fail-safe to avoid length crashes
  }
};

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleOpenModal = (emp = null) => {
    setError('');
    if (emp) {
      setIsEditing(true);
      setFormData({ 
        id: emp.Id, 
        fullName: emp.FullName, 
        email: emp.Email, 
        password: '', 
        department: emp.Department || '', 
        designation: emp.Designation || '' 
      });
    } else {
      setIsEditing(false);
      setFormData({ id: null, fullName: '', email: '', password: '', department: '', designation: '' });
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/employees/${formData.id}`, 
          { fullName: formData.fullName, email: formData.email, department: formData.department, designation: formData.designation },
          { headers: { Authorization: `Bearer ${token}` }}
        );
      } else {
        await axios.post(`http://localhost:5000/api/employees`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed execution.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you certain you want to remove this employee profile?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmployees();
    } catch (err) {
      alert('Delete operation rejected.');
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-3 p-4 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">Employee Directory</h4>
          <small className="text-muted">Manage system users, tracking departments and titles.</small>
        </div>
        <button className="btn btn-dark d-flex align-items-center gap-2 fw-medium btn-sm px-3 py-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add New Employee
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0 text-muted"><Search size={14} /></span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Search directory..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive rounded-3 border">
        <table className="table table-hover align-middle mb-0 text-sm">
          <thead className="table-light text-muted uppercase small">
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Id')}>ID <ArrowUpDown size={12} /></th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('FullName')}>Name <ArrowUpDown size={12} /></th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Email')}>Email <ArrowUpDown size={12} /></th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Department')}>Department <ArrowUpDown size={12} /></th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('Designation')}>Designation <ArrowUpDown size={12} /></th>
              <th className="text-end px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan="6" className="text-center p-4 text-muted small">No profile alignments found.</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.Id}>
                  <td className="text-secondary small">#{emp.Id}</td>
                  <td className="fw-semibold text-dark">{emp.FullName}</td>
                  <td className="text-muted">{emp.Email}</td>
                  <td><span className="badge bg-light text-dark border px-2 py-1">{emp.Department || 'N/A'}</span></td>
                  <td className="text-secondary small">{emp.Designation || 'N/A'}</td>
                  <td className="text-end px-4">
                    <button className="btn btn-outline-secondary btn-sm p-1 border-0 me-1" onClick={() => handleOpenModal(emp)}><Edit size={14} /></button>
                    <button className="btn btn-outline-danger btn-sm p-1 border-0" onClick={() => handleDelete(emp.Id)}><Trash size={14} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <span className="small text-muted">Showing page <b>{meta.currentPage}</b> of <b>{meta.totalPages}</b> ({meta.totalRecords} records)</span>
        <nav>
          <ul className="pagination pagination-sm m-0 gap-1">
            <button className="btn btn-outline-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="btn btn-outline-secondary btn-sm" disabled={page === meta.totalPages || meta.totalPages === 0} onClick={() => setPage(page + 1)}>Next</button>
          </ul>
        </nav>
      </div>

      {/* FORM INPUT MODAL FOR CRUDS */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleFormSubmit}>
                <div className="modal-header border-bottom bg-light">
                  <h6 className="modal-title fw-bold text-dark">{isEditing ? 'Edit Profile Details' : 'Register New Employee'}</h6>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  {error && <div className="alert alert-danger py-2 small">{error}</div>}
                  
                  <div className="mb-2">
                    <label className="form-label small fw-medium m-1">Full Name</label>
                    <input type="text" className="form-control form-control-sm" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
                  </div>
                  
                  <div className="mb-2">
                    <label className="form-label small fw-medium m-1">Email Address</label>
                    <input type="email" className="form-control form-control-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-medium m-1">Department</label>
                      <input type="text" className="form-control form-control-sm" placeholder="e.g. IT, Sales" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium m-1">Designation</label>
                      <input type="text" className="form-control form-control-sm" placeholder="e.g. Developer" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} />
                    </div>
                  </div>

                  {!isEditing && (
                    <div className="mb-2">
                      <label className="form-label small fw-medium m-1">Password Key</label>
                      <input type="password" className="form-control form-control-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top bg-light p-2">
                  <button type="button" className="btn btn-light btn-sm px-3" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-dark btn-sm px-3">Save Employee</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
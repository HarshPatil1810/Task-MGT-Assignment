import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileSpreadsheet, Download, CheckCircle2, Clock, Users, ShieldAlert } from 'lucide-react';

export default function Reports() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/employees?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data?.employees || res.data || []);
      } catch (err) {
        console.error("Error collecting active system profiles:", err);
      }
    };
    fetchEmployees();
  }, [token]);

  // Unified dynamic route download pipeline engine
  const downloadReport = (format, status = '', empId = '') => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
 
  let url = `http://localhost:5000/api/reports/tasks?format=${format}&token=${token}`;
  if (status) url += `&status=${status}`;
  if (empId) url += `&employeeId=${empId}`;

  // This will now open securely because the token is carried along with the request
  window.open(url, '_blank');
};

  return (
    <div className="container py-4">
      <div className="mb-4 border-bottom pb-3">
        <h2 className="h4 fw-bold text-dark mb-1">Operational Analytics Reports</h2>
        <p className="text-muted small mb-0">Export structured live task registries and team metric logs safely.</p>
      </div>

      <div className="row g-4">
        {/* CARD A: COMPLETED TASKS LEDGER */}
        <div className="col-md-4">
          <div className="card h-100 border shadow-sm border-success-subtle">
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="p-2 bg-success-subtle text-success d-inline-block rounded-3 mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <h5 className="fw-bold text-dark">Completed Tasks Ledger</h5>
                <p className="text-muted small">Generates a structural report containing all completed milestones, timelines, and final engineering handlers.</p>
              </div>
              <div className="d-flex gap-2 mt-3 pt-2 border-top">
                <button onClick={() => downloadReport('excel', 'Completed')} className="btn btn-outline-success btn-sm w-100 d-flex align-items-center justify-content-center gap-1">
                  <FileSpreadsheet size={14} /> Excel
                </button>
                <button onClick={() => downloadReport('csv', 'Completed')} className="btn btn-success btn-sm w-100 d-flex align-items-center justify-content-center gap-1">
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD B: PENDING BACKLOG TRACKER */}
        <div className="col-md-4">
          <div className="card h-100 border shadow-sm border-warning-subtle">
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="p-2 bg-warning-subtle text-warning-emphasis d-inline-block rounded-3 mb-3">
                  <Clock size={24} />
                </div>
                <h5 className="fw-bold text-dark">Pending Backlog Tracker</h5>
                <p className="text-muted small">Collects open workflows, task priority queues, and imminent target execution deadlines across branches.</p>
              </div>
              <div className="d-flex gap-2 mt-3 pt-2 border-top">
                <button onClick={() => downloadReport('excel', 'Pending')} className="btn btn-outline-warning btn-sm w-100 d-flex align-items-center justify-content-center gap-1 text-dark">
                  <FileSpreadsheet size={14} /> Excel
                </button>
                <button onClick={() => downloadReport('csv', 'Pending')} className="btn btn-warning btn-sm w-100 d-flex align-items-center justify-content-center gap-1 text-dark">
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD C: EMPLOYEE TARGET MATRIX ALIGNMENT */}
        <div className="col-md-4">
          <div className="card h-100 border shadow-sm border-primary-subtle">
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="p-2 bg-primary-subtle text-primary d-inline-block rounded-3 mb-3">
                  <Users size={24} />
                </div>
                <h5 className="fw-bold text-dark">Employee Assignment Allocation</h5>
                <p className="text-muted small">Select an employee from the dropdown map matrix to compile individual task registries.</p>
                
                <select 
                  className="form-select form-select-sm mt-3"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp.Id} value={emp.Id}>{emp.FullName} ({emp.Department || 'No Dept'})</option>
                  ))}
                </select>
              </div>
              
              <div className="d-flex gap-2 mt-3 pt-2 border-top">
                <button 
                  disabled={!selectedEmployee}
                  onClick={() => downloadReport('excel', '', selectedEmployee)} 
                  className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                >
                  <FileSpreadsheet size={14} /> Excel
                </button>
                <button 
                  disabled={!selectedEmployee}
                  onClick={() => downloadReport('csv', '', selectedEmployee)} 
                  className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                >
                  <Download size={14} /> CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
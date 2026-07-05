import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, ShieldAlert, CheckCircle2, Paperclip, Download } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));  
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'Medium', startDate: '', dueDate: '', assignedEmployeeId: ''
  });
  
  // NEW: State to track selected attachment file 
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchTasks();
    if (user.role === 'Admin') fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/tasks', { headers: { Authorization: `Bearer ${token}` } });
    setTasks(res.data);
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/employees?limit=100', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data && Array.isArray(res.data.employees)) {
        setEmployees(res.data.employees);
      } else if (Array.isArray(res.data)) {
        setEmployees(res.data); 
      }
    } catch (err) {
      console.error('Failed to parse employee assignment logs:', err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    if (!newTask.startDate || !newTask.dueDate) {
      setError('Both Start Date and Due Date are mandatory parameters.');
      return;
    }

    if (new Date(newTask.dueDate) < new Date(newTask.startDate)) {
      setError('Due Date cannot sit earlier in timeline than project Start Date.');
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // ✅ TRANSITION TO FORMDATA CONSTRUCTOR
      const formData = new FormData();
      formData.append('title', newTask.title);
      formData.append('description', newTask.description);
      formData.append('priority', newTask.priority);
      formData.append('startDate', new Date(newTask.startDate).toISOString().split('T')[0]);
      formData.append('dueDate', new Date(newTask.dueDate).toISOString().split('T')[0]);
      formData.append('assignedEmployeeId', newTask.assignedEmployeeId);
      
      // Append raw binary document if it exists inside state storage
      if (file) {
        formData.append('file', file);
      }

      await axios.post('http://localhost:5000/api/tasks', formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          //'Content-Type': 'multipart/form-data' // Dynamic browser configuration mapping
        } 
      });
      
      setShowModal(false);
      setFile(null); // Reset upload inputs
      fetchTasks();
      setNewTask({ title: '', description: '', priority: 'Medium', startDate: '', dueDate: '', assignedEmployeeId: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed production dispatch');
    }
  };

  const handleUpdateStatus = async (taskId, currentStatus) => {
    if (currentStatus === 'Completed') {
      alert('Completed workflows are finalized and cannot be modified.');
      return;
    }
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/tasks/${taskId}/status`, { status: 'Completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Status evolution blocked');
    }
  };

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <h2 className="h4 fw-bold text-dark mb-1">Task Allocation Registers</h2>
          <p className="text-muted small mb-0">View and update task milestones safely</p>
        </div>
        {user.role === 'Admin' && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm">
            <Plus size={16} /> Deploy Task
          </button>
        )}
      </div>

      {/* Task Grid Layout */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {tasks.map((task) => (
          <div key={task.Id} className="col">
            <div className="card h-100 shadow-sm border-light-subtle">
              <div className="card-body d-flex flex-column justify-content-between">
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={`badge uppercase px-2 py-1 text-uppercase ${
                      task.Priority === 'High' ? 'bg-danger-subtle text-danger' : task.Priority === 'Medium' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary'
                    }`}>
                      {task.Priority} Priority
                    </span>
                    <span className={`badge px-2 py-1 ${
                      task.Status === 'Completed' ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'
                    }`}>
                      {task.Status}
                    </span>
                  </div>
                  <h5 className="card-title fw-bold text-dark text-truncate">{task.Title}</h5>
                  <p className="card-text text-muted small mb-3" style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.Description}
                  </p>

                  {/* ✅ UI ADDITION: RENDER ACCESSIBLE FILE DOWNLOAD ATTACHMENTS LINK */}
                  {task.AttachmentUrl && (
                    <div className="mt-2">
                      <a 
                        href={`http://localhost:5000${task.AttachmentUrl}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-light btn-sm text-primary border d-inline-flex align-items-center gap-2 rounded-2 px-3 py-1 text-decoration-none"
                        style={{ fontSize: '11px' }}
                      >
                        <Download size={12} /> View Attachment Link
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t mt-auto">
                  <div className="d-flex justify-content-between text-muted mb-3" style={{ fontSize: '11px' }}>
                    <span className="d-flex align-items-center gap-1"><Calendar size={12} /> Start: {new Date(task.StartDate).toLocaleDateString()}</span>
                    <span className="d-flex align-items-center gap-1"><Calendar size={12} /> Due: {new Date(task.DueDate).toLocaleDateString()}</span>
                  </div>

                  {user.role === 'Admin' && (
                    <div className="p-2 bg-light border rounded small text-muted mb-2">
                      Assigned Node: <span className="fw-bold text-dark">{task.employeeName || 'Unassigned'}</span>
                    </div>
                  )}

                  {user.role === 'Employee' && task.Status !== 'Completed' && (
                    <button onClick={() => handleUpdateStatus(task.Id, task.Status)} className="btn btn-success btn-sm w-100 d-flex align-items-center justify-content-center gap-2 fw-bold py-2 shadow-sm">
                      <CheckCircle2 size={14} /> Finalize Work Completion
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Modal for Admins */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(33, 37, 41, 0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Deploy New System Task</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 rounded-3 small fw-medium" role="alert">
                    <ShieldAlert size={16} />
                    <div>{error}</div>
                  </div>
                )}
                
                <form onSubmit={handleCreateTask} className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1">Task Title</label>
                    <input type="text" required className="form-control rounded-2" onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1">Task Description</label>
                    <textarea rows="3" required className="form-control rounded-2" onChange={(e) => setNewTask({...newTask, description: e.target.value})}></textarea>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1">Start Date</label>
                    <input type="date" required className="form-control rounded-2" onChange={(e) => setNewTask({...newTask, startDate: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1">Due Date</label>
                    <input type="date" required className="form-control rounded-2" onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1">Priority</label>
                    <select className="form-select rounded-2" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1">Assign Employee</label>
                    <select required className="form-select rounded-2" onChange={(e) => setNewTask({...newTask, assignedEmployeeId: e.target.value})}>
                      <option value="">Select Employee...</option>
                      {employees.map(emp => <option key={emp.Id} value={emp.Id}>{emp.FullName}</option>)}
                    </select>
                  </div>

                  {/* ✅ UI ADDITION: FILE INPUT ELEMENT ROW */}
                  <div className="col-12">
                    <label className="form-label text-muted small fw-bold text-uppercase mb-1 d-flex align-items-center gap-1">
                      <Paperclip size={12} /> Attachment Document <span className="text-lowercase fw-normal text-muted">(Optional)</span>
                    </label>
                    <input 
                      type="file" 
                      className="form-control rounded-2" 
                      onChange={(e) => setFile(e.target.files[0])} // Capture the raw binary instance directly
                    />
                  </div>

                  <div className="col-12 d-flex gap-2 justify-content-end pt-2">
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline-secondary px-3" style={{ borderRadius: '8px' }}>Cancel</button>
                    <button type="submit" className="btn btn-primary px-3" style={{ borderRadius: '8px' }}>Deploy Workflow</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
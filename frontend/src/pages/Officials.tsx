import React, { useEffect, useState } from 'react';
import { Settings, Trash2, Plus, AlertCircle, Users, Calendar, Briefcase } from 'lucide-react';
import { getAuth } from "../utils/getAuth.js";
import { getData } from "../utils/getData.js";
import Sidebar from '../components/Sidebar';
import { postData, putData, deleteData } from '../utils/postData.js';
import '../css/official.css'

const OfficialDashboard = () => {
  const { data: officials, error: officialsError, loading: officialsLoading } = getData("officials");
  
  const { data: residentsData } = getData("residents") || {};
  
  const residents = residentsData
    ? Object.keys(residentsData).map((key) => ({
        resident_id: key, 
        ...residentsData[key], 
      }))
    : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [formData, setFormData] = useState({
    position: "",
    start_term: "",
    end_term: "",
    status: "Active",
    resident_id: ""
  });

  useEffect(() => {
    if (!getAuth()) {
      window.location.href = "/";
    }
  }, []);

  const openDeleteConfirmation = (official) => {
    setSelectedOfficial(official);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (selectedOfficial) {
      await putData('residents', selectedOfficial.resident_id, { status: 'Accepted' });
      
      const deleteRes = await deleteData('officials', selectedOfficial.official_id);
      console.log(deleteRes);

      if (deleteRes) {
        setShowConfirmDialog(false);
        window.location.reload();
      }
    }
  };

  const handleAdd = async () => {
    if (!formData.position || !formData.start_term || !formData.end_term || !formData.resident_id) {
      alert("Please fill in all fields");
      return;
    }

    console.log("Adding official:", formData);
    const res = await postData('officials', formData);
    
    if (res) {
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      <Sidebar />
      <div className="dashboard-container">
        <h1 className="text-3xl font-bold mb-6">Officials Dashboard</h1>
        
        <div className="welcome-card">
          <h2>Welcome to the Officials Page!</h2>
          <p>Manage official tasks and assignments for your community.</p>
        </div>

        <div className="section-header">
          <h2>Officials List</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary">
            <Plus size={16} className="mr-2" /> Add Official
          </button>
        </div>

        {/* Officials Table */}
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Start Term</th>
                  <th>End Term</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {officialsLoading ? (
                  <tr>
                    <td colSpan="6">
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                      </div>
                    </td>
                  </tr>
                ) : officials?.length > 0 ? (
                  officials.map((official) => (
                    <tr key={official.official_id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white">
                            {official.first_name.charAt(0)}
                          </div>
                          <span>{official.first_name} {official.middle_name} {official.last_name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Briefcase size={16} className="text-primary" />
                          {official.position}
                        </div>
                      </td>
                      <td>{formatDate(official.start_term)}</td>
                      <td>{formatDate(official.end_term)}</td>
                      <td>
                        <span className={`status-badge ${official.status === 'Active' ? 'active' : 'inactive'}`}>
                          {official.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => openDeleteConfirmation(official)}
                          className="btn btn-danger">
                          <Trash2 size={16} className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <Users className="empty-state-icon" />
                        <p>No officials found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Official Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={(e) => {
            if (e.target.className === 'modal-overlay') {
              setIsModalOpen(false);
            }
          }}>
            <div className="modal-container">
              <div className="modal-header">
                <h2>
                  <Plus size={20} className="mr-2" />
                  Add Official
                </h2>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter position title"
                    value={formData.position} 
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Term</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={formData.start_term} 
                    onChange={(e) => setFormData({ ...formData, start_term: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Term</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={formData.end_term} 
                    onChange={(e) => setFormData({ ...formData, end_term: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Resident</label>
                  <select 
                    className="form-control" 
                    value={formData.resident_id} 
                    onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                  >
                    <option value="">Select Resident</option>
                    {residents.map(resident => (
                      <option key={resident.resident_id} value={resident.resident_id}>
                        {resident.first_name} {resident.middle_name} {resident.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setIsModalOpen(false)} className="btn btn-gray">Cancel</button>
                <button onClick={handleAdd} className="btn btn-primary">Add Official</button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && selectedOfficial && (
          <div className="confirm-dialog">
            <div className="confirm-dialog-content">
              <div className="confirm-dialog-header">
                <AlertCircle size={24} />
                <h3 className="text-xl font-bold">Confirm Deletion</h3>
              </div>
              <div className="confirm-dialog-body">
                <p>Are you sure you want to delete {selectedOfficial.first_name} {selectedOfficial.last_name} from the officials list?</p>
                <p className="text-gray-500 mt-2">This action cannot be undone.</p>
              </div>
              <div className="confirm-dialog-footer">
                <button onClick={() => setShowConfirmDialog(false)} className="btn btn-gray">Cancel</button>
                <button onClick={handleDelete} className="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialDashboard;
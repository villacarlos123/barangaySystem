import React, { useEffect, useState } from 'react';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import { getAuth } from "../utils/getAuth.js";
import { getData } from "../utils/getData.js";
import Sidebar from '../components/Sidebar';
import { putData } from '../utils/postData.js';
import '../css/resident.css'

interface Resident {
  resident_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  contact_number: string;
  status: string;
}

interface GetDataResponse<T> {
  data: T | null;
  error: boolean;
  loading: boolean;
}

const ResidentsDashboard: React.FC = () => {
  const { data: residentsData, loading: residentsLoading } = getData("residents") as GetDataResponse<Record<string, Resident>>;

  const residents = residentsData
    ? Object.entries(residentsData).map(([key, value]) => ({
        ...value,
        resident_id: key
      }))
    : [];

  const pendingResidents = residents.filter(resident => resident.status === "Pending");
  const acceptedResidents = residents.filter(resident => resident.status === "Accepted");
  
  const pendingCount = pendingResidents.length;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!getAuth()) {
      window.location.href = "/";
    }
  }, []);

  const handleAcceptResident = async (residentId: string): Promise<void> => {
    const res = await putData('residents', residentId, { status: 'Accepted' });
    console.log(res);

    if (res) {
      alert('Resident accepted successfully');
      window.location.reload();
    }
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target instanceof HTMLDivElement && e.target.className === 'modal-overlay') {
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      <Sidebar />
      <div className="dashboard-container">
        <h1 className="text-3xl font-bold mb-6">Residents Dashboard</h1>
        
        <div className="welcome-card">
          <h2>Welcome to the Residents Page!</h2>
          <p>Manage resident accounts and requests with ease.</p>
        </div>

        <div className="section-header">
          <h2>Accepted Residents</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}>
            View Pending Requests
            {pendingCount > 0 && (
              <span className="notification-badge">{pendingCount}</span>
            )}
          </button>
        </div>

        {/* Accepted Residents Table */}
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {residentsLoading ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="loading-state">
                        <div className="loading-spinner"></div>
                      </div>
                    </td>
                  </tr>
                ) : acceptedResidents.length > 0 ? (
                  acceptedResidents.map((resident) => (
                    <tr key={resident.resident_id}>
                      <td>{resident.first_name} {resident.middle_name} {resident.last_name}</td>
                      <td>{resident.email}</td>
                      <td>{resident.contact_number}</td>
                      <td>
                        <span className="status-badge accepted">
                          <CheckCircle size={16} className="mr-1" /> Accepted
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <Users className="empty-state-icon" />
                        <p>No accepted residents found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Residents Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={handleModalClick}>
            <div className="modal-container">
              <div className="modal-header">
                <h2>
                  <AlertCircle size={20} className="inline-block mr-2 text-yellow-500" />
                  Pending Residents
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table pending-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingResidents.length > 0 ? (
                      pendingResidents.map((resident) => (
                        <tr key={resident.resident_id}>
                          <td>{resident.first_name} {resident.middle_name} {resident.last_name}</td>
                          <td>{resident.email}</td>
                          <td>{resident.contact_number}</td>
                          <td className="text-center">
                            <button 
                              className="btn btn-success"
                              onClick={() => handleAcceptResident(resident.resident_id)}>
                              <CheckCircle size={16} className="mr-1" /> Accept
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <div className="empty-state">
                            <CheckCircle className="empty-state-icon text-green-500" />
                            <p>No pending account requests</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-gray"
                  onClick={() => setIsModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentsDashboard;
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Trash2, Edit, Mail, CheckCircle, XCircle, Clock, Search, Download, Eye, Filter, FileImage, Calendar, User, Phone, AtSign, FileText, CreditCard } from "lucide-react";
import axios from 'axios';
import CertificationGenerator from "../components/Cert";

interface Document {
  documentId: string;
  requester_name?: string;
  first_name?: string;
  last_name?: string;
  requester_email?: string;
  email?: string;
  requester_contact?: string;
  contactNumber?: string;
  document_type?: string;
  documentType?: string;
  purpose?: string;
  status: string;
  timestamp?: string;
  requested_date?: string;
  approval_date?: string;
  email_sent?: boolean;
  email_sent_date?: string;
  paymentMethod?: string;
  receiptImage?: string;
  receiptUploadedAt?: string;
  residentId?: string;
  viewImageUrl?: string;
}

interface ActionStatus {
  message: string;
  type: 'success' | 'error';
}

const Document = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<ActionStatus>({ message: '', type: 'success' });
  const [imageLoading, setImageLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageId, setImageId] = useState('');
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://barangayapi.vercel.app/document');
      setAllDocuments(res.data);
      setLoading(false);
    }
    catch (err) {
      console.error(err);
      setLoading(false);
      setActionStatus({ message: 'Error fetching documents', type: 'error' });
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  // Function to handle document status change
  const handleStatusChange = async (documentId: string, newStatus: string) => {
    try {
      setLoading(true);
      const updateData: Partial<Document> = { 
        status: newStatus 
      };
      
      // Add approval date if status is Completed
      if (newStatus === "Completed") {
        updateData.approval_date = new Date().toLocaleDateString('en-US', { 
          month: 'long', day: 'numeric', year: 'numeric' 
        });
      }
      
      // Send update request to backend
      const response = await axios.put(`https://barangayapi.vercel.app/document/${documentId}`, updateData);
      
      if (response.data.success) {
        // Update UI
        setAllDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.documentId === documentId ? { ...doc, ...updateData } : doc
          )
        );
        
        setActionStatus({ 
          message: `Document ${newStatus.toLowerCase()} successfully`, 
          type: 'success' 
        });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setActionStatus({ 
        message: `Error updating document status: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  // Function to handle sending email
  const handleSendEmail = async (documentId: string) => {
    try {
      setLoading(true);
      const updateData: Partial<Document> = {
        email_sent: true,
        email_sent_date: new Date().toLocaleDateString('en-US', { 
          month: 'long', day: 'numeric', year: 'numeric' 
        })
      };
      
      // Send update request to backend
      const response = await axios.put(`https://barangayapi.vercel.app/document/${documentId}`, updateData);
      
      if (response.data.success) {
        // Update UI
        setAllDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.documentId === documentId ? { ...doc, ...updateData } : doc
          )
        );
        
        setActionStatus({ 
          message: 'Email notification sent successfully', 
          type: 'success' 
        });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setActionStatus({ 
        message: `Error sending email: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  // Function to handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    try {
      setLoading(true);
      // Send delete request to backend
      const response = await axios.delete(`https://barangayapi.vercel.app/document/${documentId}`);

      if (response.data.success) {
        // Update UI
        setAllDocuments(prevDocs => prevDocs.filter(doc => doc.documentId !== documentId));
        setActionStatus({ 
          message: 'Document deleted successfully', 
          type: 'success' 
        });
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setActionStatus({ 
        message: `Error deleting document: ${err instanceof Error ? err.message : 'Unknown error'}`, 
        type: 'error' 
      });
    }
  };

  // Function to handle document view
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    const sample = document?.receiptImage;
    if (typeof sample?.file === 'string' && sample?.file.includes('id=')) {
      const match = sample?.file.match(/id=([^&]+)/);
      if (match) {
        setImageId(match[1]);
      }
    }
    setIsViewModalOpen(true);
  };

  // Function to open image modal
  const handleViewImage = (event: React.MouseEvent, imageUrl: string) => {
    event.stopPropagation();
    if (selectedDocument) {
      setSelectedDocument({...selectedDocument, viewImageUrl: imageUrl});
    }
    setIsImageModalOpen(true);
  };

  // Function to filter documents based on search term and status
  const filteredDocuments = allDocuments?.filter(doc => {
    const matchesSearch = (doc.requester_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                         (doc.documentType?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (doc.document_type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Function to get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <XCircle className="w-4 h-4" />;
      case "Pending":
        return <Clock className="w-4 h-4" />;
      case "Processing":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Function to format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Document Requests</h1>
            <p className="text-gray-600 mt-2">
              Manage and process document requests from residents.
            </p>
          </div>

          {/* Status message */}
          {actionStatus.message && (
            <div className={`mb-4 p-4 rounded-md ${actionStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {actionStatus.type === 'success' ? 
                    <CheckCircle className="h-5 w-5 text-green-400" /> : 
                    <XCircle className="h-5 w-5 text-red-400" />
                  }
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{actionStatus.message}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => setActionStatus({ message: '', type: 'success' })}
                      className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        actionStatus.type === 'success' ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600' : 
                        'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
                      }`}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by name or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  {/* <option value="Approved">Approved</option> */}
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>  
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}

          {/* Document List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requester
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Sent
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!loading && filteredDocuments?.length > 0 ? (
                    filteredDocuments?.map((doc) => (
                      <tr key={doc.documentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {doc.requester_name || `${doc.first_name} ${doc.last_name}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doc.requester_email || doc.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doc.requester_contact || doc.contactNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doc.document_type || doc.documentType}</div>
                          {doc.purpose && (
                            <div className="text-xs text-gray-500">Purpose: {doc.purpose}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(doc.timestamp || doc.requested_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)}
                            <span className="ml-1">{doc.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.email_sent ? (
                            <div>
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Sent
                              </span>
                              <div className="text-xs text-gray-500 mt-1">{doc.email_sent_date}</div>
                            </div>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              <XCircle className="w-4 h-4 mr-1" />
                              Not Sent
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDocument(doc)}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                              title="View Document"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            
                            {doc.status === "Completed" && !doc.email_sent && (
                              <button
                                onClick={() => handleSendEmail(doc.documentId)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                title="Send Email Notification"
                              >
                                <Mail className="w-5 h-5" />
                              </button>
                            )}
                            
                            {doc.status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(doc.documentId, "Processing")}
                                    className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                  title="Process Document"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                </button>
                                {/* <button
                                  onClick={() => handleStatusChange(doc.documentId, "Approved")}
                                  className="text-green-600 hover:text-green-900 transition-colors duration-200"
                                  title="Approve Document"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button> */}
                                <button
                                  onClick={() => handleStatusChange(doc.documentId, "Rejected")}
                                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                  title="Reject Document"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => handleDeleteDocument(doc.documentId)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                              title="Delete Document"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="text-gray-500">
                          {loading ? "Loading documents..." : "No documents found matching your criteria."}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* View Document Modal */}
        {isViewModalOpen && selectedDocument && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                          Document Request Details
                        </h3>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedDocument.status)}`}>
                          {getStatusIcon(selectedDocument.status)}
                          <span className="ml-1">{selectedDocument.status}</span>
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                <User className="w-4 h-4 mr-1" />
                                Requester Information
                              </div>
                              <p className="text-base font-medium text-gray-800">
                                {selectedDocument.requester_name || `${selectedDocument.first_name} ${selectedDocument.last_name}`}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                <AtSign className="w-4 h-4 mr-1" />
                                Email
                              </div>
                              <p className="text-sm text-gray-600">
                                {selectedDocument.requester_email || selectedDocument.email}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                <Phone className="w-4 h-4 mr-1" />
                                Contact
                              </div>
                              <p className="text-sm text-gray-600">
                                {selectedDocument.requester_contact || selectedDocument.contactNumber}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                <FileText className="w-4 h-4 mr-1" />
                                Document Type
                              </div>
                              <p className="text-base text-gray-800">
                                {selectedDocument.document_type || selectedDocument.documentType}
                              </p>
                            </div>
                            
                            {selectedDocument.purpose && (
                              <div>
                                <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                  <FileText className="w-4 h-4 mr-1" />
                                  Purpose
                                </div>
                                <p className="text-base text-gray-800">
                                  {selectedDocument.purpose}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                Request Date
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatDate(selectedDocument.timestamp || selectedDocument.requested_date)}
                              </p>
                            </div>
                            
                            {selectedDocument.status === "Processing" && selectedDocument.approval_date && (
                              <div>
                                <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Approval Date
                                </div>
                                <p className="text-sm text-gray-600">
                                  {selectedDocument.approval_date}
                                </p>
                              </div>
                            )}
                            
                            <div>
                              <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                <Mail className="w-4 h-4 mr-1" />
                                Email Notification
                              </div>
                              {selectedDocument.email_sent ? (
                                <div>
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Sent on {selectedDocument.email_sent_date}
                                  </span>
                                </div>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Not Sent
                                </span>
                              )}
                            </div>
                            
                            {selectedDocument.paymentMethod && (
                              <div>
                                <div className="flex items-center text-sm font-semibold text-gray-500 mb-1">
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  Payment Method
                                </div>
                                <p className="text-sm text-gray-600">
                                  {selectedDocument.paymentMethod}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Receipt Image Section */}
                      {selectedDocument.receiptImage && (
                        <div className="mt-6">
                          <div className="flex items-center text-sm font-semibold text-gray-500 mb-2">
                            <FileImage className="w-4 h-4 mr-1" />
                            Payment Receipt
                          </div>
                          <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            {imageLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                              </div>
                            )}
                            <img 
                              src={`https://lh3.googleusercontent.com/d/${imageId}`} 
                              alt="Payment Receipt" 
                              className="w-auto h-auto cursor-pointer"
                              style={{ margin: '0 auto' }}
                              onLoad={() => setImageLoading(false)}
                              onError={() => {
                                setImageLoading(false);
                                setActionStatus({ 
                                  message: 'Error loading receipt image', 
                                  type: 'error' 
                                });
                              }}
                              onClick={(e) => selectedDocument?.receiptImage && handleViewImage(e, selectedDocument.receiptImage)}
                            />
                            <div className="absolute bottom-2 right-2">
                              <button 
                                onClick={(e) => selectedDocument?.receiptImage && handleViewImage(e, selectedDocument.receiptImage)}
                                className="bg-gray-800 bg-opacity-70 rounded-full p-2 text-white hover:bg-opacity-90 transition-all"
                                title="View Full Image"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {selectedDocument.receiptUploadedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              Uploaded: {formatDate(selectedDocument.receiptUploadedAt)}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {selectedDocument.status === "Processing" && (
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            Certificate Preview
                          </h4>
                          <div className="mt-2 border border-gray-200 p-4 rounded-md bg-gray-50">
                            <CertificationGenerator 
                              documentDetails={{
                                requester_name: selectedDocument.requester_name || `${selectedDocument.first_name} ${selectedDocument.last_name}` || '',
                                requester_email: selectedDocument.requester_email || selectedDocument.email || '',
                                documentId: selectedDocument.documentId,
                                document_type: selectedDocument.document_type || selectedDocument.documentType || '',
                                residentId: selectedDocument.residentId || ''
                              }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  {selectedDocument.status === "Approved" && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </button>
                  )}
                  
                  {selectedDocument.status === "Approved" && !selectedDocument.email_sent && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSendEmail(selectedDocument.documentId);
                        setIsViewModalOpen(false);
                      }}
                      className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </button>
                  )}
                  
                  {selectedDocument.status === "Pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          handleStatusChange(selectedDocument.documentId, "Approved");
                          setIsViewModalOpen(false);
                        }}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm transition-colors duration-200"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleStatusChange(selectedDocument.documentId, "Rejected");
                          setIsViewModalOpen(false);
                        }}
                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm transition-colors duration-200 ml-3"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Image Viewer Modal */}
        {isImageModalOpen && selectedDocument && selectedDocument.viewImageUrl && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-900 opacity-90"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom rounded-lg text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="relative">
               
                  <img 
                     src={`https://lh3.googleusercontent.com/d/${imageId}`} 
                    alt="Full size image" 
                    className="w-full object-contain max-h-screen"
                  />
                  <button
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 rounded-full p-2 text-white hover:bg-opacity-90 transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Document;
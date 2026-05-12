import api from './api';

const getPendingRequests = async () => {
  const response = await api.get('/verification/pending');
  return response.data; 
};

const approveRequest = async (id) => {
  const response = await api.patch(`/verification/${id}/approve`);
  return response.data;
};

const rejectRequest = async (id, reason) => {
  const response = await api.patch(`/verification/${id}/reject`, { reason });
  return response.data;
};

export default { getPendingRequests, approveRequest, rejectRequest };
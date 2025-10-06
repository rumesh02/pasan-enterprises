// Determine the API base URL based on environment
const getBaseURL = () => {
  // Check if running on localhost (development)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Production URL
  return 'https://pasan-enterprises.me/api';
};

const API_BASE_URL = getBaseURL();

// Machine API Service
export const machineService = {
  // Get all machines
  getAllMachines: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_BASE_URL}/machines?${queryString}` : `${API_BASE_URL}/machines`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch machines');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching machines:', error);
      throw error;
    }
  },

  // Get machine by ID
  getMachineById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch machine');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching machine:', error);
      throw error;
    }
  },

  // Get machine by item ID
  getMachineByItemId: async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/item/${itemId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch machine');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching machine by item ID:', error);
      throw error;
    }
  },

  // Create new machine
  createMachine: async (machineData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create machine');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating machine:', error);
      throw error;
    }
  },

  // Update machine
  updateMachine: async (id, machineData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(machineData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update machine');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating machine:', error);
      throw error;
    }
  },

  // Delete machine
  deleteMachine: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete machine');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting machine:', error);
      throw error;
    }
  },

  // Search machines
  searchMachines: async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/search/${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search machines');
      }
      
      return data;
    } catch (error) {
      console.error('Error searching machines:', error);
      throw error;
    }
  },

  // Get machines by category
  getMachinesByCategory: async (category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/machines/category/${encodeURIComponent(category)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch machines by category');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching machines by category:', error);
      throw error;
    }
  }
};

export default machineService;
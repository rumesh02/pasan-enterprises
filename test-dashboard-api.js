// Simple test to verify dashboard API endpoints
const testDashboardAPI = async () => {
  try {
    // Test dashboard stats
    console.log('Testing dashboard stats API...');
    const statsResponse = await fetch('http://localhost:5000/api/dashboard/stats');
    const statsData = await statsResponse.json();
    console.log('Dashboard Stats Response:', statsData);

    // Test monthly revenue
    console.log('Testing monthly revenue API...');
    const revenueResponse = await fetch('http://localhost:5000/api/dashboard/monthly-revenue');
    const revenueData = await revenueResponse.json();
    console.log('Monthly Revenue Response:', revenueData);

  } catch (error) {
    console.error('Error testing APIs:', error);
  }
};

// Run the test
testDashboardAPI();
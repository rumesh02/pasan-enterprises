// Advanced session management with heartbeat
class SessionManager {
  constructor() {
    this.heartbeatInterval = null;
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.heartbeatFrequency = 5 * 60 * 1000; // 5 minutes
  }

  // Start session with heartbeat
  startSession(token, user) {
    const sessionData = {
      token,
      user,
      lastActivity: Date.now(),
      sessionId: this.generateSessionId()
    };

    sessionStorage.setItem('authSession', JSON.stringify(sessionData));
    sessionStorage.setItem('isLoggedIn', 'true');
    
    this.startHeartbeat();
    this.setupActivityListeners();
  }

  // Generate unique session ID
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Check if session is valid
  isSessionValid() {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('authSession') || '{}');
      const now = Date.now();
      
      if (!sessionData.lastActivity) return false;
      
      // Check if session has expired
      if (now - sessionData.lastActivity > this.sessionTimeout) {
        this.clearSession();
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  // Update last activity timestamp
  updateActivity() {
    try {
      const sessionData = JSON.parse(sessionStorage.getItem('authSession') || '{}');
      if (sessionData.token) {
        sessionData.lastActivity = Date.now();
        sessionStorage.setItem('authSession', JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }

  // Get current session data
  getSession() {
    try {
      if (!this.isSessionValid()) return null;
      return JSON.parse(sessionStorage.getItem('authSession') || '{}');
    } catch {
      return null;
    }
  }

  // Clear session
  clearSession() {
    sessionStorage.removeItem('authSession');
    sessionStorage.removeItem('isLoggedIn');
    this.stopHeartbeat();
    this.removeActivityListeners();
  }

  // Start heartbeat to keep session alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isSessionValid()) {
        this.updateActivity();
        // Optionally ping server to keep server session alive
        // this.pingServer();
      } else {
        this.clearSession();
        window.location.reload(); // Force re-authentication
      }
    }, this.heartbeatFrequency);
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Setup activity listeners to update session on user interaction
  setupActivityListeners() {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), { passive: true });
    });
  }

  // Remove activity listeners
  removeActivityListeners() {
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.removeEventListener(event, this.handleActivity.bind(this));
    });
  }

  // Handle user activity
  handleActivity() {
    this.updateActivity();
  }

  // Optional: Ping server to keep server session alive
  async pingServer() {
    try {
      const session = this.getSession();
      if (session?.token) {
        await fetch('/api/auth/ping', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Heartbeat ping failed:', error);
    }
  }
}

export default new SessionManager();
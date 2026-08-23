const API_BASE = process.env.NEXT_PUBLIC_API_BASE || (typeof window !== "undefined" ? `${window.location.protocol}//${window.location.hostname}:8000` : "http://localhost:8000");

async function request(path: string, options: RequestInit = {}) {
  // Enforce standard json headers and credentials inclusion for HTTP-only cookies
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include", // Required to pass HttpOnly session cookies
  });
  
  if (!response.ok) {
    let errorData = "An unknown error occurred.";
    try {
      const err = await response.json();
      errorData = err.detail || errorData;
    } catch (_) {}
    throw new Error(errorData);
  }
  
  return response.json();
}

export const api = {
  // Auth
  async login(email: string) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  
  async logout() {
    return request("/api/auth/logout", {
      method: "POST",
    });
  },
  
  async getMe() {
    return request("/api/auth/me", {
      method: "GET",
    });
  },
  
  // Complaints & Cases
  async analyzeComplaint(rawComplaint: string, targetLanguage: string) {
    return request("/api/complaints/analyze", {
      method: "POST",
      body: JSON.stringify({ raw_complaint: rawComplaint, target_language: targetLanguage }),
    });
  },

  async generateDraft(caseId: string, payload: { confirmed_info_sought?: string; confirmed_department?: string; confirmed_location?: string; target_language?: string }) {
    return request(`/api/cases/${caseId}/draft`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async submitComplaint(rawComplaint: string, targetLanguage: string) {
    return request("/api/complaints", {
      method: "POST",
      body: JSON.stringify({ raw_complaint: rawComplaint, target_language: targetLanguage }),
    });
  },
  
  async fileCase(caseId: string) {
    return request(`/api/cases/${caseId}/file`, {
      method: "POST",
    });
  },
  
  async resolveCase(caseId: string) {
    return request(`/api/cases/${caseId}/resolve`, {
      method: "POST",
    });
  },
  
  async getCases() {
    return request("/api/cases", {
      method: "GET",
    });
  },
  
  async getCase(caseId: string) {
    return request(`/api/cases/${caseId}`, {
      method: "GET",
    });
  }
};

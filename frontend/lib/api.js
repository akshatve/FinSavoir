const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";



// 1. Send OTP to Email
export async function sendOTP(email) {
  const res = await fetch(`${API_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to send OTP");
  return data;
}

// 2. Verify the OTP
export async function verifyOTP(email, otp_code) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp_code }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Invalid OTP");
  return data;
}

// 3. Create the User (Final Step)
export async function registerUser(email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  return data;
}

// 4. Login
export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}



// getting the profile 
export async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    const err = new Error("No token found");
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.detail || "Failed to fetch profile");
    err.status = res.status;
    throw err;
  }

  return data;
}




// Update the search function to handle errors better
export async function searchCompanies(query) {
  const url = `${API_URL}/companies/search?q=${encodeURIComponent(query)}`;
  
  // ADD THIS LOG
  console.log("🚀 [searchCompanies] Firing request to:", url);

  try {
    const res = await fetch(url, { cache: 'no-store' });
    
    // ADD THIS LOG
    console.log("📡 [searchCompanies] Response status:", res.status);

    if (!res.ok) throw new Error("Search failed");
    return await res.json();
  } catch (err) {
    console.error("❌ [searchCompanies] Error:", err);
    return [];
  }
}



// THIS is the function your page.js is calling
export async function getCompanyOverview(ticker) {
  // This fetches from http://127.0.0.1:8000/companies/overview/AAPL
  const res = await fetch(`${API_URL}/companies/overview/${ticker}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch company data");
  return data;
}

// ... (keep your other API functions here) ...


export async function getCompanyHistory(ticker, period = "1y") {
  const res = await fetch(`${API_URL}/companies/history/${ticker}?period=${period}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch history");
  return data;
}




export async function getCompanyFinancials(ticker, period = "annual") {
  const res = await fetch(`${API_URL}/companies/financials/${ticker}?period=${period}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch financials");
  return data;
}



export async function getCompanyStatistics(ticker) {
  const res = await fetch(`${API_URL}/companies/statistics/${ticker}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch statistics");
  return data;
}


export async function getCompanyNews(ticker, timeframe = "7d") {
  const res = await fetch(`${API_URL}/companies/news/${ticker}?timeframe=${timeframe}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch news");
  return data;
}




export async function compareCompanies(ticker1, ticker2) {
  const res = await fetch(`${API_URL}/companies/compare?t1=${ticker1}&t2=${ticker2}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Comparison failed");
  return data;
}


export async function getComparisonHistory(ticker1, ticker2, period = "1y") {
  const res = await fetch(`${API_URL}/companies/compare/history?t1=${ticker1}&t2=${ticker2}&period=${period}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch comparison history");
  return data;
}


export async function getMarketIndices() {
  const res = await fetch(`${API_URL}/companies/dashboard/indices`);
  if (!res.ok) throw new Error("Failed to fetch indices");
  return res.json();
}

export async function getTopMovers() {
  const res = await fetch(`${API_URL}/companies/dashboard/movers`);
  if (!res.ok) throw new Error("Failed to fetch movers");
  return res.json();
}



export async function getTrendingStocks() {
  const res = await fetch(`${API_URL}/companies/dashboard/trending`);
  if (!res.ok) throw new Error("Failed to fetch trending stocks");
  return res.json();
}




export async function getTrendingNews() {
  const res = await fetch(`${API_URL}/companies/dashboard/trending-news`);
  if (!res.ok) throw new Error("Failed to fetch trending news");
  return res.json();
}



export async function getTrendingVideos() {
  const res = await fetch(`${API_URL}/companies/dashboard/trending-videos`);
  if (!res.ok) throw new Error("Failed to fetch videos");
  return res.json();
}




export async function getSectorFundamentals() {
  const res = await fetch(`${API_URL}/companies/dashboard/sector-fundamentals`);
  if (!res.ok) throw new Error("Failed to fetch sector data");
  return res.json();
}



// to get latest sec fillings
export async function getLatestSECFilings() {
  const res = await fetch(`${API_URL}/companies/dashboard/sec-filings`);
  if (!res.ok) throw new Error("Failed to fetch SEC filings");
  return res.json();
}


// for getting all the stocks 
export async function getAllStocks(page = 1, limit = 20) {
  const res = await fetch(`${API_URL}/companies/all-stocks?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch stocks");
  return res.json();
}


// for search a stock 
export async function searchStocks(query, page = 1, limit = 20) {
  const res = await fetch(`${API_URL}/companies/search-stocks?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to search stocks");
  return res.json();
}



// to get all the news 
export async function getAllNews(page = 1, limit = 10, category = "All", query = "") {
  const res = await fetch(`${API_URL}/companies/all-news?page=${page}&limit=${limit}&category=${category}&q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}



// to get the fillings from the sec 
export async function getAllFilings(page = 1, limit = 20, formType = "All", query = "") {
  const res = await fetch(`${API_URL}/companies/all-filings?page=${page}&limit=${limit}&form_type=${formType}&q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to fetch filings");
  return res.json();
}


// for marquee stocks
export async function getMarqueeStocks() {
  const res = await fetch(`${API_URL}/companies/marquee-stocks`);
  if (!res.ok) throw new Error("Failed to fetch marquee stocks");
  return res.json();
}



// for email newsletter subscription 
export async function subscribeNewsletter(email) {
  const res = await fetch(`${API_URL}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Subscription failed");
  return data;
}


// for contact form submission
export async function submitContactForm(data) {
  const res = await fetch(`${API_URL}/contact/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.detail || "Failed to send message");
  return result;
}


// to get the press news for the press news tab page
export async function getPressReleases(page = 1, limit = 20, query = "") {
  const res = await fetch(
    `${API_URL}/companies/press-releases?page=${page}&limit=${limit}&q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Failed to fetch press releases");
  return res.json();
}



// for the chatbot
export async function sendChatMessage(messages, signal) {
  const res = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal, // optional AbortController signal for cancellation
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Chat request failed");
  }

  return res.body; // caller reads the stream
}


// to get all the sectors 
export async function getAllSectors() {
  const res = await fetch(`${API_URL}/companies/sectors/all`);
  if (!res.ok) throw new Error("Failed to fetch sectors");
  return res.json();
}


// to get all the company related to all the sectors
export async function getSectorCompanies(sectorName) {
  const res = await fetch(`${API_URL}/companies/sector/${encodeURIComponent(sectorName)}`);
  if (!res.ok) throw new Error("Failed to fetch sector companies");
  return res.json();
}


// to get the proscore detials for a particular stock 
export async function getProScore(ticker) {
  const res = await fetch(`${API_URL}/pro-score/${ticker}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch Pro Score");
  return data;
}




// to get the summary analysis
export async function getSummary(ticker) {
  const res = await fetch(`${API_URL}/pro-score/summary/${ticker}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch summary");
  return data;
}




// to get the filling according to the stock 
export async function getFilings(ticker) {
  const res = await fetch(`${API_URL}/pro-score/filings/${ticker}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch filings");
  return data;
}





// ===== FORGOT PASSWORD =====

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to request reset");
  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to reset password");
  return data;
}
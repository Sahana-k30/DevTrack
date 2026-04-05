// utils/refreshAll.js
// Call this from any page — dashboard, navbar button, wherever you want

export async function refreshAllData(token) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const endpoints = [
    '/api/github/refresh',
    '/api/leetcode/refresh',
    '/api/codeforces/refresh',
  ];

  // Fire all three refreshes in parallel
  const results = await Promise.allSettled(
    endpoints.map(url =>
      fetch(`${process.env.REACT_APP_API_URL}${url}`, {
        method: 'POST',
        headers,
        credentials: 'include',
      })
    )
  );

  const summary = {
    github:     results[0].status === 'fulfilled' ? 'ok' : 'error',
    leetcode:   results[1].status === 'fulfilled' ? 'ok' : 'error',
    codeforces: results[2].status === 'fulfilled' ? 'ok' : 'error',
  };

  console.log('Refresh results:', summary);
  return summary;
}
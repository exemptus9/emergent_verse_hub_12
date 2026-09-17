import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function getVisitorId() {
  let id = localStorage.getItem('_vid');
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('_vid', id);
  }
  return id;
}

function getSessionId() {
  let sid = sessionStorage.getItem('_sid');
  if (!sid) {
    sid = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_sid', sid);
  }
  return sid;
}

export default function usePageTracking() {
  const location = useLocation();
  const lastTracked = useRef('');

  useEffect(() => {
    const path = location.pathname;
    // Skip admin pages and duplicate tracking
    if (path.startsWith('/admin') || path === lastTracked.current) return;
    lastTracked.current = path;

    const payload = {
      visitor_id: getVisitorId(),
      path,
      referrer: document.referrer || '',
      session_id: getSessionId(),
    };

    // Fire and forget — no await, no error blocking
    fetch(`${BACKEND_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [location.pathname]);
}

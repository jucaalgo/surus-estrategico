/**
 * SURUS Intel — Visitor Tracker v3
 * Sends initial visit + exit beacon only (no heartbeat spam)
 * Completely silent on errors — never disrupts user experience
 */
(function () {
  var TRACK_URL = '/api/track';
  var SESSION_KEY = 'surus_session_id';
  var LAST_VISIT_KEY = 'surus_last_visit';
  var VISIT_COUNT_KEY = 'surus_visit_count';
  var FIRST_VISIT_KEY = 'surus_first_visit';
  var VISIT_TIMEOUT = 30 * 60 * 1000;
  var sentInitial = false;
  var sentExit = false;

  var now = Date.now();
  var sessionId = localStorage.getItem(SESSION_KEY);
  var lastVisit = parseInt(localStorage.getItem(LAST_VISIT_KEY) || '0');
  var visitCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0') + 1;
  var firstVisit = localStorage.getItem(FIRST_VISIT_KEY);

  if (!sessionId || (now - lastVisit > VISIT_TIMEOUT)) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  if (!firstVisit) {
    firstVisit = new Date().toISOString();
    localStorage.setItem(FIRST_VISIT_KEY, firstVisit);
  }
  localStorage.setItem(LAST_VISIT_KEY, now.toString());
  localStorage.setItem(VISIT_COUNT_KEY, visitCount.toString());

  var pageEnter = Date.now();

  function sendOnce(isExit) {
    if (isExit && sentExit) return;
    if (!isExit && sentInitial) return;
    if (isExit) sentExit = true; else sentInitial = true;
    var payload = {
      user_agent: navigator.userAgent,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      page: window.location.pathname || '/',
      session_id: sessionId,
      visit_count: visitCount,
      first_visit: firstVisit,
      time_spent_seconds: Math.round((Date.now() - pageEnter) / 1000),
      is_exit: isExit
    };
    try {
      if (isExit && navigator.sendBeacon) {
        navigator.sendBeacon(TRACK_URL, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      } else {
        fetch(TRACK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(function() {});
      }
    } catch (e) { /* completely silent */ }
  }

  sendOnce(false);
  window.addEventListener('beforeunload', function() { sendOnce(true); });
  window.addEventListener('pagehide', function() { sendOnce(true); });
})();
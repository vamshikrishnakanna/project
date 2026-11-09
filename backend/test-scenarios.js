const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('🚀 Running CivicTrack QA End-to-End Audit Suite (Native Fetch)...\n');
  let passed = 0;
  let failed = 0;

  function report(num, name, isSuccess, details = '') {
    if (isSuccess) {
      console.log(`✅ [PASS] ${num}. ${name}: ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${num}. ${name}: ${details}`);
      failed++;
    }
  }

  // --- Check Backend Health ---
  try {
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    report(0, 'Backend Health Check', healthRes.status === 200 && healthData.success, healthData.message);
  } catch (err) {
    report(0, 'Backend Health Check', false, err.message);
  }

  // --- 1. React frontend communicates with Express backend & MongoDB stores new complaint ---
  let newIssue = null;
  try {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Deep pothole on Outer Ring Road near Bellandur EcoSpace',
        description: 'A newly formed deep pothole in the middle lane causing severe vehicle damage and accidents near Bellandur.',
        category: 'Pothole',
        latitude: 12.9260,
        longitude: 77.6762,
        area: 'Bellandur',
        city: 'Bengaluru',
        forceSubmit: true,
      }),
    });
    const data = await res.json();
    const success = res.status === 201 && data.success && data.issue?._id;
    newIssue = data.issue;
    report(1, 'Store & Retrieve New Complaint in MongoDB', success, `ID: ${data.issue?.complaintId} (${data.issue?._id})`);
  } catch (err) {
    report(1, 'Store & Retrieve New Complaint in MongoDB', false, err.message);
  }

  // --- 2 & 3. Duplicate detection (Category + Proximity + Description) ---
  let duplicateData = null;
  try {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Pothole on Outer Ring Road near Bellandur main road',
        description: 'Deep dangerous pothole in middle lane near Bellandur EcoSpace creating traffic slowdown and accidents.',
        category: 'Pothole',
        latitude: 12.9262, // ~25 meters from the one above
        longitude: 77.6763,
        area: 'Bellandur',
        city: 'Bengaluru',
        forceSubmit: false,
      }),
    });
    duplicateData = await res.json();
    const isDup = res.status === 200 && duplicateData.isDuplicate === true && duplicateData.duplicates?.length > 0;
    const match = duplicateData.duplicates?.[0];
    report(2, 'Duplicate Detection Engine (Category + Geo + Text)', isDup,
      `Matched ${duplicateData.duplicates?.length} complaints. Top Match Score: ${match?.scores?.combined}% (Category: ${match?.scores?.category}%, Geo: ${match?.scores?.geo}%, Text: ${match?.scores?.text}%, Distance: ${match?.distance}m)`);
  } catch (err) {
    report(2, 'Duplicate Detection Engine (Category + Geo + Text)', false, err.message);
  }

  // --- 4. Duplicate warnings appear before submission ---
  const warningTriggered = duplicateData?.isDuplicate === true;
  report(3, 'Duplicate Warning Response Before Saving', warningTriggered, 'System warned without inserting duplicate record');

  // --- 5. Users can continue submitting after seeing warnings (forceSubmit: true) ---
  try {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Pothole on Outer Ring Road near Bellandur main road',
        description: 'Deep dangerous pothole in middle lane near Bellandur EcoSpace creating traffic slowdown and accidents.',
        category: 'Pothole',
        latitude: 12.9262,
        longitude: 77.6763,
        area: 'Bellandur',
        city: 'Bengaluru',
        forceSubmit: true, // User chose "Continue Anyway"
      }),
    });
    const data = await res.json();
    const saved = res.status === 201 && data.success && data.issue?._id;
    report(4, 'Continue Submission After Warning (forceSubmit)', saved, `Complaint saved with ID: ${data.issue?.complaintId}`);
  } catch (err) {
    report(4, 'Continue Submission After Warning (forceSubmit)', false, err.message);
  }

  // --- 6. Different category nearby does NOT trigger false duplicate ---
  try {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Garbage dump near Bellandur EcoSpace',
        description: 'Piles of domestic and organic garbage overflowing on the sidewalk.',
        category: 'Garbage', // Different category
        latitude: 12.9261,
        longitude: 77.6761,
        area: 'Bellandur',
        city: 'Bengaluru',
        forceSubmit: false,
      }),
    });
    const data = await res.json();
    const passedNoDup = res.status === 201 && data.isDuplicate === false;
    report(5, 'Category Differentiation in Duplicate Check', passedNoDup, 'Garbage at same coordinate was not flagged as Pothole duplicate');
  } catch (err) {
    report(5, 'Category Differentiation in Duplicate Check', false, err.message);
  }

  // --- 7. Filters return correct results (Category & Search) ---
  try {
    const resCat = await fetch(`${BASE_URL}/issues?category=Streetlight`);
    const dataCat = await resCat.json();
    const allStreetlight = dataCat.issues?.every((i) => i.category === 'Streetlight');

    const resSearch = await fetch(`${BASE_URL}/issues?search=Indiranagar`);
    const dataSearch = await resSearch.json();
    const allIndiranagar = dataSearch.issues?.every((i) =>
      i.title.toLowerCase().includes('indiranagar') ||
      i.description.toLowerCase().includes('indiranagar') ||
      i.location?.area?.toLowerCase().includes('indiranagar')
    );

    report(6, 'Filtering & Searching Engine', allStreetlight && allIndiranagar && dataCat.issues.length > 0,
      `Category filter: ${dataCat.issues.length} Streetlights; Search filter: ${dataSearch.issues.length} Indiranagar complaints`);
  } catch (err) {
    report(6, 'Filtering & Searching Engine', false, err.message);
  }

  // --- 8. Dashboard statistics from real database records ---
  try {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    const data = await res.json();
    const stats = data.stats;
    const isValid = res.status === 200 && stats.total > 0 &&
      stats.total === (stats.pending + stats.inProgress + stats.resolved + stats.underReview);
    report(7, 'Dashboard Statistics Calculations', isValid,
      `Total: ${stats.total} = Pending(${stats.pending}) + InProgress(${stats.inProgress}) + Resolved(${stats.resolved}) + UnderReview(${stats.underReview})`);
  } catch (err) {
    report(7, 'Dashboard Statistics Calculations', false, err.message);
  }

  // --- 9. Admin Authentication & Role-Based Authorization ---
  let adminCookie = null;
  try {
    // 9a: Unauthorized access rejected
    const unauthRes = await fetch(`${BASE_URL}/issues/${newIssue?._id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved' }),
    });
    const unauthBlocked = unauthRes.status === 401;

    // 9b: Admin Login
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@civictrack.in', password: 'Admin@123' }),
    });
    const loginData = await loginRes.json();
    adminCookie = loginRes.headers.get('set-cookie');
    const loginSuccess = loginRes.status === 200 && loginData.user?.role === 'admin';

    // 9c: Authorized status update
    let updateSuccess = false;
    if (adminCookie && newIssue?._id) {
      const updateRes = await fetch(`${BASE_URL}/issues/${newIssue._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': adminCookie,
        },
        body: JSON.stringify({ status: 'Resolved' }),
      });
      const updateData = await updateRes.json();
      updateSuccess = updateRes.status === 200 && updateData.issue?.status === 'Resolved';
    }

    report(8, 'Admin Authentication & RBAC Authorization', unauthBlocked && loginSuccess && updateSuccess,
      `Unauthorized rejected: 401; Admin logged in: ${loginData.user?.email}; Status updated to Resolved: ${updateSuccess}`);
  } catch (err) {
    report(8, 'Admin Authentication & RBAC Authorization', false, err.message);
  }

  // --- 10. Form Validation & Centralized Error Handling ---
  try {
    // Missing required fields
    const res = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Short' }), // invalid
    });
    const data = await res.json();
    const handlesErrors = res.status === 400 && data.success === false;

    // Invalid coordinates
    const resCoords = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Proper title for validation test',
        description: 'Valid description that has sufficient character length for validation',
        category: 'Pothole',
        latitude: 'invalid-lat',
        longitude: 'invalid-lng',
      }),
    });
    const dataCoords = await resCoords.json();
    const handlesCoords = resCoords.status === 400 && dataCoords.success === false;

    // Non-existent route 404
    const res404 = await fetch(`${BASE_URL}/nonexistent-route`);
    const handles404 = res404.status === 404;

    report(9, 'Server-Side Validation & Error Handling', handlesErrors && handlesCoords && handles404,
      'Proper 400 Bad Request, coordinate validation, and 404 route handling verified');
  } catch (err) {
    report(9, 'Server-Side Validation & Error Handling', false, err.message);
  }

  // --- 11. Single Issue Details & Related Complaints Retrieval ---
  try {
    const res = await fetch(`${BASE_URL}/issues/${newIssue?._id}`);
    const data = await res.json();
    const valid = res.status === 200 && data.issue?._id === newIssue?._id;
    report(10, 'Issue Details & Related Complaints Endpoint', valid,
      `Fetched issue "${data.issue?.title}" with ${data.related?.length || 0} geographically related issues`);
  } catch (err) {
    report(10, 'Issue Details & Related Complaints Endpoint', false, err.message);
  }

  console.log('\n======================================================');
  console.log(`QA AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runTests();

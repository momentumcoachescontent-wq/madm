
import { execSync } from 'child_process';
import bcrypt from 'bcryptjs';

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin_validation@example.com';
const STUDENT_EMAIL = 'student_validation@example.com';
const PASSWORD = 'demo123';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    console.error(error.message);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    throw error;
  }
}

async function setupUsers() {
  console.log('Setting up test users...');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(PASSWORD, salt);
  const escapedHash = hash.replace(/\$/g, '\\$');

  // Create Admin - remove OR IGNORE to catch errors
  runCommand(`npx wrangler d1 execute mas-alla-del-miedo-db --local --command "INSERT INTO users (name, email, password_hash, role, active, email_verified) VALUES ('Validation Admin', '${ADMIN_EMAIL}', '${escapedHash}', 'admin', 1, 1);"`);

  // Verify Admin
  const check = runCommand(`npx wrangler d1 execute mas-alla-del-miedo-db --local --command "SELECT id, email, role, password_hash FROM users WHERE email='${ADMIN_EMAIL}'"`);
  console.log('Inserted Hash:', hash);
  console.log('DB Verification:', check);
  if (!check.includes(ADMIN_EMAIL)) {
      throw new Error('Admin user was not inserted!');
  }

  // Create Student
  runCommand(`npx wrangler d1 execute mas-alla-del-miedo-db --local --command "INSERT INTO users (name, email, password_hash, role, active, email_verified) VALUES ('Validation Student', '${STUDENT_EMAIL}', '${escapedHash}', 'student', 1, 1);"`);
}

async function cleanupUsers() {
  console.log('Cleaning up test users...');
  runCommand(`npx wrangler d1 execute mas-alla-del-miedo-db --local --command "DELETE FROM users WHERE email IN ('${ADMIN_EMAIL}', '${STUDENT_EMAIL}');"`);
}

async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('email', email);
  formData.append('password', password);

  const response = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Login failed for ${email}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`Login failed for ${email}: ${data.error}`);
  }

  // Extract session cookie
  const cookieHeader = response.headers.get('set-cookie');
  if (!cookieHeader) {
    throw new Error(`No cookie received for ${email}`);
  }

  // Simple extraction of the session part
  const sessionCookie = cookieHeader.split(';')[0];
  return sessionCookie;
}

async function checkAdminAccess(cookie, userType) {
  const response = await fetch(`${BASE_URL}/admin`, {
    headers: {
      Cookie: cookie || '',
    },
    redirect: 'manual', // Don't follow redirects automatically so we can check status
  });

  console.log(`[${userType}] Accessing /admin - Status: ${response.status}`);

  if (response.status === 200) {
    const text = await response.text();
    // Check for unique content in admin dashboard to confirm
    if (text.includes('Panel de Administración')) {
        return 'ALLOWED';
    } else {
        return 'UNKNOWN_CONTENT';
    }
  } else if (response.status === 302) {
    const location = response.headers.get('location');
    console.log(`[${userType}] Redirected to: ${location}`);
    return 'REDIRECTED';
  } else if (response.status === 401 || response.status === 403) {
      return 'DENIED';
  }

  return `STATUS_${response.status}`;
}

async function main() {
  try {
    // Wait a bit for server to be ready if called immediately after start
    console.log('Waiting for server to be ready...');
    let retries = 10;
    while (retries > 0) {
        try {
            await fetch(BASE_URL);
            break;
        } catch (e) {
            await sleep(1000);
            retries--;
            if (retries === 0) throw new Error('Server not reachable');
        }
    }

    // Attempt to cleanup first in case of previous failure
    try { await cleanupUsers(); } catch(e) {}

    await setupUsers();
    await sleep(2000); // Wait for potential server restart/file unlock

    // 1. Test Admin Access
    console.log('\n--- Testing Admin User ---');
    const adminCookie = await login(ADMIN_EMAIL, PASSWORD);
    const adminResult = await checkAdminAccess(adminCookie, 'ADMIN');

    if (adminResult === 'ALLOWED') {
        console.log('✅ PASS: Admin user can access /admin');
    } else {
        console.error(`❌ FAIL: Admin user result was ${adminResult}`);
        process.exitCode = 1;
    }

    // 2. Test Student Access
    console.log('\n--- Testing Student User ---');
    const studentCookie = await login(STUDENT_EMAIL, PASSWORD);
    const studentResult = await checkAdminAccess(studentCookie, 'STUDENT');

    if (studentResult === 'REDIRECTED' || studentResult === 'DENIED') {
        console.log('✅ PASS: Student user was denied access to /admin');
    } else {
        console.error(`❌ FAIL: Student user result was ${studentResult}`);
        process.exitCode = 1;
    }

    // 3. Test Anonymous Access
    console.log('\n--- Testing Anonymous User ---');
    const anonResult = await checkAdminAccess(null, 'ANONYMOUS');

    if (anonResult === 'REDIRECTED' || anonResult === 'DENIED') {
        console.log('✅ PASS: Anonymous user was denied access to /admin');
    } else {
        console.error(`❌ FAIL: Anonymous user result was ${anonResult}`);
        process.exitCode = 1;
    }

  } catch (error) {
    console.error('An error occurred:', error);
    process.exitCode = 1;
  } finally {
    // await cleanupUsers(); // Keep users for debugging if it fails
    // Restore cleanup if it passes? I'll leave it commented out for now to inspect if needed.
    // If I want to be clean, I should uncomment it.
    // I will uncomment it but wrap it in try catch so it doesn't hide previous errors.
    try { await cleanupUsers(); } catch(e) { console.error('Cleanup failed:', e.message); }
  }
}

main();

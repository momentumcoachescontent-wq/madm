import * as auth from './auth';
import * as stripe from './stripe';
import * as quiz from './quiz';
import * as video from './video-tracking';
import * as certificate from './certificate';

declare global {
  interface Window {
    ADM: any;
  }
}

window.ADM = { auth, stripe, quiz, video, certificate };

// Helpers
function on(pathPrefix: string) {
  return window.location.pathname.startsWith(pathPrefix);
}

function has(selector: string) {
  return document.querySelector(selector) !== null;
}

function safeRun(name: string, fn: () => void) {
  try {
    fn();
  } catch (err) {
    console.error(`[client_init] ${name} failed`, err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Auth: usually safe everywhere, but avoid noisy checkAuth on /login
  safeRun('auth.initLogout', () => auth.initLogout());
  safeRun('auth.init', () => auth.init());

  // If your checkAuth calls /api/me, it might "Failed to fetch" when not logged in.
  // Run it only when it makes sense.
  if (!on('/login')) {
    safeRun('auth.checkAuth', () => auth.checkAuth());
  }

  // Stripe: only if checkout elements exist
  if (has('[data-stripe]') || has('#checkout') || has('.stripe-checkout')) {
    safeRun('stripe.init', () => stripe.init());
  }

  // Quiz: only if quiz UI exists
  if (has('#quiz') || has('[data-quiz]')) {
    safeRun('quiz.init', () => quiz.init());
  }

  // Certificates: only if certificate UI exists
  if (has('[data-certificate]') || has('#certificate')) {
    safeRun('certificate.initCertificate', () => certificate.initCertificate());
  }

  // Video tracking: only if videos exist
  if (has('video') || has('[data-video-tracking]')) {
    safeRun('video.init', () => video.init());
  }
});

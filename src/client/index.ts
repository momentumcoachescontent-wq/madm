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

window.ADM = {
  auth,
  stripe,
  quiz,
  video,
  certificate
};

// Check auth status on every page load
document.addEventListener('DOMContentLoaded', () => {
  auth.checkAuth();
  auth.initLogout();
  certificate.initCertificate();
});

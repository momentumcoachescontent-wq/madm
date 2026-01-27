// Admin Client Bundle Entry Point
import { initLayout } from './admin/layout';
import { initMediaLibrary } from './admin/media';
import { initBlogEditor } from './admin/blog';

console.log('Admin Client Loaded');

document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  initMediaLibrary();
  initBlogEditor();
});

import React from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import usePageTracking from "./hooks/usePageTracking";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import PoemDetailPage from "./pages/PoemDetailPage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";
import CategoriesPage from "./pages/CategoriesPage";
import TagsPage from "./pages/TagsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BookmarksPage from "./pages/BookmarksPage";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPoemsList from "./pages/admin/AdminPoemsList";
import AdminPoemForm from "./pages/admin/AdminPoemForm";
import AdminComments from "./pages/admin/AdminComments";
import AdminCommentModeration from "./pages/admin/AdminCommentModeration";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSiteAnalytics from "./pages/admin/AdminSiteAnalytics";
import AdminExport from "./pages/admin/AdminExport";
import AdminSubscribers from "./pages/admin/AdminSubscribers";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminSettings from "./pages/admin/AdminSettings";

// Public Layout wrapper
const PublicLayout = ({ children }) => (
  <>
    <Header />
    <div className="flex-1">{children}</div>
    <Footer />
  </>
);

// Page tracking wrapper (must be inside BrowserRouter)
const PageTracker = ({ children }) => {
  usePageTracking();
  return children;
};

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-[#f5f5f5]">
      <BrowserRouter>
        <PageTracker>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/poem/:slug" element={<PublicLayout><PoemDetailPage /></PublicLayout>} />
          <Route path="/category/:category" element={<PublicLayout><CategoryPage /></PublicLayout>} />
          <Route path="/tag/:tag" element={<PublicLayout><TagPage /></PublicLayout>} />
          <Route path="/categories" element={<PublicLayout><CategoriesPage /></PublicLayout>} />
          <Route path="/tags" element={<PublicLayout><TagsPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/bookmarks" element={<PublicLayout><BookmarksPage /></PublicLayout>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="site-analytics" element={<AdminSiteAnalytics />} />
            <Route path="poems" element={<AdminPoemsList />} />
            <Route path="poems/new" element={<AdminPoemForm />} />
            <Route path="poems/edit/:id" element={<AdminPoemForm />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="moderation" element={<AdminCommentModeration />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="export" element={<AdminExport />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        </PageTracker>
      </BrowserRouter>
    </div>
  );
}

export default App;

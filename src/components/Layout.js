import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const menuItems = [
  { title: 'Dashboard', path: '/admin/dashboard' },
  { title: 'Customers', path: '/admin/customers' },
  { title: 'Astrologer', children: [
    { title: 'Manage Astrologer', path: '/admin/astrologers' },
    { title: 'Block Astrologer', path: '/admin/blocked-astrologers' },
    { title: 'Pending Requests', path: '/admin/pending-astrologers' },
    { title: 'Reviews', path: '/admin/app-feedback' },
    { title: 'Gifts', path: '/admin/gifts' },
    { title: 'Skills', path: '/admin/skills' },
    { title: 'Categories', path: '/admin/astrologer-categories' },
    { title: 'Profile Boost Settings', path: '/admin/profile-boost-list' },
    { title: 'Profile Boost History', path: '/admin/profile-boost-history' },
    { title: 'Astrologer Assistant', path: '/admin/astrologer-assistants' },
    { title: 'Document List', path: '/admin/astrologer-documents' },
    { title: 'AI Astrologers', path: '/admin/ai-astrologer' },
    { title: 'AI Chat History', path: '/admin/ai-chat-history' },
  ]},
  { title: 'AstroShop', children: [
    { title: 'Product Categories', path: '/admin/astromall/categories' },
    { title: 'Products', path: '/admin/astromall/products' },
    { title: 'Orders', path: '/admin/astromall/orders' },
    { title: 'Product Recommend', path: '/admin/astromall/product-recommend' },
  ]},
  { title: 'Horoscope', children: [
    { title: 'Daily Horoscope', path: '/admin/daily-horoscope' },
    { title: 'Weekly Horoscope', path: '/admin/weekly-horoscope' },
    { title: 'Yearly Horoscope', path: '/admin/yearly-horoscope' },
    { title: 'Horoscope Feedback', path: '/admin/horoscope-feedback' },
  ]},
  { title: 'Blogs', path: '/admin/blogs' },
  { title: 'Astroguru News', path: '/admin/news' },
  { title: 'Videos Ads', path: '/admin/ads-videos' },
  { title: 'Support Tickets', path: '/admin/tickets' },
  { title: 'Stories', path: '/admin/stories' },
  { title: 'Puja Management', children: [
    { title: 'Puja Categories', path: '/admin/puja-categories' },
    { title: 'Puja SubCategories', path: '/admin/puja-subcategories' },
    { title: 'Puja List', path: '/admin/puja-list' },
    { title: 'Puja Orders', path: '/admin/puja-orders' },
    { title: 'Puja Recommends', path: '/admin/puja-recommends' },
    { title: 'Astrologer Puja', path: '/admin/astrologer-puja' },
    { title: 'Puja Packages', path: '/admin/puja-packages' },
    { title: 'Puja FAQ', path: '/admin/puja-faq' },
  ]},
  { title: 'Kundali', children: [
    { title: 'Kundali Earnings', path: '/admin/kundali-earnings' },
    { title: 'Kundali Prices', path: '/admin/kundali-prices' },
  ]},
  { title: 'Referral Settings', path: '/admin/referral-settings' },
  { title: 'Course Management', children: [
    { title: 'Course Categories', path: '/admin/course-categories' },
    { title: 'Courses', path: '/admin/course-list' },
    { title: 'Course Chapters', path: '/admin/course-chapters' },
    { title: 'Course Orders', path: '/admin/course-orders' },
  ]},
  { title: 'Page Management', path: '/admin/pages' },
  { title: 'App Design', path: '/admin/app-design' },
  { title: 'Training Videos', path: '/admin/training-videos' },
  { title: 'Web Home FAQ', path: '/admin/web-home-faq' },
  { title: 'Master Settings', children: [
    { title: 'Customer Profile', path: '/admin/default-images' },
    { title: 'HoroScope Signs', path: '/admin/horoscope-signs' },
    { title: 'Report Type', path: '/admin/reports' },
    { title: 'Banners', path: '/admin/banners' },
    { title: 'Notifications', path: '/admin/notifications' },
    { title: 'Help Support', path: '/admin/help-support' },
    { title: 'Recharge Amount', path: '/admin/recharge' },
  ]},
  { title: 'Team Management', children: [
    { title: 'Team Roles', path: '/admin/team-roles' },
    { title: 'Team List', path: '/admin/team-list' },
  ]},
  { title: 'General Settings', path: '/admin/setting' },
  { title: 'Report', children: [
    { title: 'Call History', path: '/admin/call-history' },
    { title: 'Chat History', path: '/admin/chat-history' },
    { title: 'Report Requests', path: '/admin/report-requests' },
    { title: 'Report/Block', path: '/admin/report-blocks' },
  ]},
  { title: 'Earning', children: [
    { title: 'Withdrawal Requests', path: '/admin/withdrawals' },
    { title: 'Withdrawal Methods', path: '/admin/withdrawal-methods' },
    { title: 'Recharge History', path: '/admin/wallet-history' },
    { title: 'Admin Earnings', path: '/admin/admin-earnings' },
    { title: 'Astrologer Earnings', path: '/admin/astrologer-earnings' },
  ]},
];

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleMenu = (index) => {
    setOpenMenus(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
    
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>AstroGuru</h2>
          <span className="admin-label">Admin Panel</span>
          <button className="close-btn" onClick={closeSidebar}>✕</button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item, i) => (
            <div key={i} className="menu-group">
              {item.path ? (
                <Link to={item.path} onClick={closeSidebar} className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}>
                  <span>{item.icon} {item.title}</span>
                </Link>
              ) : (
                <>
                  <div className="menu-item menu-parent" onClick={() => toggleMenu(i)}>
                    <span>{item.title}</span>
                    <span className={`arrow ${openMenus[i] ? 'open' : ''}`}>&#9656;</span>
                  </div>
                  {openMenus[i] && item.children && (
                    <div className="submenu">
                      {item.children.map((child, j) => (
                        <Link key={j} to={child.path} onClick={closeSidebar} className={`submenu-item ${location.pathname === child.path ? 'active' : ''}`}>
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <button className="toggle-btn" onClick={toggleSidebar}>☰</button>
          <div className="topbar-right">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

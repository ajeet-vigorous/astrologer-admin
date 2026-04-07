import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminNotificationApi } from '../api/services';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, Users, Sparkles, ShoppingBag, Star, FileText,
  Newspaper, Video, TicketCheck, BookOpen, HandHeart, ScrollText,
  Link2, GraduationCap, FileStack, Palette, MonitorPlay, CircleHelp,
  Settings, UsersRound, Sliders, BarChart3, Wallet, LogOut,
  Bell, Menu, X
} from 'lucide-react';
import './Layout.css';

const menuItems = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Customers', path: '/admin/customers', icon: Users },
  { title: 'Astrologer', icon: Sparkles, children: [
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
  { title: 'AstroShop', icon: ShoppingBag, children: [
    { title: 'Product Categories', path: '/admin/astromall/categories' },
    { title: 'Products', path: '/admin/astromall/products' },
    { title: 'Orders', path: '/admin/astromall/orders' },
    { title: 'Product Recommend', path: '/admin/astromall/product-recommend' },
  ]},
  { title: 'Horoscope', icon: Star, children: [
    { title: 'Daily Horoscope', path: '/admin/daily-horoscope' },
    { title: 'Weekly Horoscope', path: '/admin/weekly-horoscope' },
    { title: 'Yearly Horoscope', path: '/admin/yearly-horoscope' },
    { title: 'Horoscope Feedback', path: '/admin/horoscope-feedback' },
  ]},
  { title: 'Blogs', path: '/admin/blogs', icon: FileText },
  { title: 'Astroguru News', path: '/admin/news', icon: Newspaper },
  { title: 'Videos Ads', path: '/admin/ads-videos', icon: Video },
  { title: 'Support Tickets', path: '/admin/tickets', icon: TicketCheck },
  { title: 'Stories', path: '/admin/stories', icon: BookOpen },
  { title: 'Puja Management', icon: HandHeart, children: [
    { title: 'Puja Categories', path: '/admin/puja-categories' },
    { title: 'Puja SubCategories', path: '/admin/puja-subcategories' },
    { title: 'Puja List', path: '/admin/puja-list' },
    { title: 'Puja Orders', path: '/admin/puja-orders' },
    { title: 'Puja Recommends', path: '/admin/puja-recommends' },
    { title: 'Astrologer Puja', path: '/admin/astrologer-puja' },
    { title: 'Puja Packages', path: '/admin/puja-packages' },
    { title: 'Puja FAQ', path: '/admin/puja-faq' },
  ]},
  { title: 'Kundali', icon: ScrollText, children: [
    { title: 'Kundali Earnings', path: '/admin/kundali-earnings' },
    { title: 'Kundali Prices', path: '/admin/kundali-prices' },
  ]},
  { title: 'Referral Settings', path: '/admin/referral-settings', icon: Link2 },
  { title: 'Course Management', icon: GraduationCap, children: [
    { title: 'Course Categories', path: '/admin/course-categories' },
    { title: 'Courses', path: '/admin/course-list' },
    { title: 'Course Chapters', path: '/admin/course-chapters' },
    { title: 'Course Orders', path: '/admin/course-orders' },
  ]},
  { title: 'Page Management', path: '/admin/pages', icon: FileStack },
  { title: 'App Design', path: '/admin/app-design', icon: Palette },
  { title: 'Training Videos', path: '/admin/training-videos', icon: MonitorPlay },
  { title: 'Web Home FAQ', path: '/admin/web-home-faq', icon: CircleHelp },
  { title: 'Master Settings', icon: Settings, children: [
    { title: 'Customer Profile', path: '/admin/default-images' },
    { title: 'HoroScope Signs', path: '/admin/horoscope-signs' },
    { title: 'Report Type', path: '/admin/reports' },
    { title: 'Banners', path: '/admin/banners' },
    { title: 'Notifications', path: '/admin/notifications' },
    { title: 'Help Support', path: '/admin/help-support' },
    { title: 'Recharge Amount', path: '/admin/recharge' },
  ]},
  { title: 'Team Management', icon: UsersRound, children: [
    { title: 'Team Roles', path: '/admin/team-roles' },
    { title: 'Team List', path: '/admin/team-list' },
  ]},
  { title: 'General Settings', path: '/admin/setting', icon: Sliders },
  { title: 'Report', icon: BarChart3, children: [
    { title: 'Call History', path: '/admin/call-history' },
    { title: 'Chat History', path: '/admin/chat-history' },
    { title: 'Report Requests', path: '/admin/report-requests' },
    { title: 'Report/Block', path: '/admin/report-blocks' },
  ]},
  { title: 'Earning', icon: Wallet, children: [
    { title: 'Withdrawal Requests', path: '/admin/withdrawals' },
    { title: 'Withdrawal Methods', path: '/admin/withdrawal-methods' },
    { title: 'Recharge History', path: '/admin/wallet-history' },
    { title: 'Admin Earnings', path: '/admin/admin-earnings' },
    { title: 'Astrologer Earnings', path: '/admin/astrologer-earnings' },
  ]},
];

const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Socket connection for admin notifications
  useEffect(() => {
    // Fetch initial unread count
    adminNotificationApi.getUnreadCount().then(res => setNotifCount(res.data?.count || 0)).catch(() => {});

    // Connect socket
    const token = localStorage.getItem('token');
    if (!token) return;
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('connect', () => socket.emit('join-admin'));
    socket.on('admin-notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 20));
    });
    socket.on('admin-notification-count', (data) => setNotifCount(data.count));
    return () => socket.disconnect();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openNotifications = async () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) {
      setNotifLoading(true);
      try {
        const res = await adminNotificationApi.getAll({ page: 1 });
        setNotifications(res.data?.notifications || []);
      } catch(e) {}
      setNotifLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await adminNotificationApi.markRead({});
      setNotifCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch(e) {}
  };

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

  const isChildActive = (children) => {
    return children?.some(child => location.pathname === child.path);
  };

  const userName = user?.name || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand-icon">AG</div>
          <div className="sidebar-brand-text">
            <h2>AstroGuru</h2>
            <span className="admin-label">Admin Panel</span>
          </div>
          <button className="close-btn" onClick={closeSidebar}><X size={18} /></button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, i) => {
            const IconComponent = item.icon;
            return (
              <div key={i} className="menu-group">
                {item.path ? (
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <span>
                      <IconComponent size={17} className="menu-icon" />
                      {item.title}
                    </span>
                  </Link>
                ) : (
                  <>
                    <div
                      className={`menu-item menu-parent ${openMenus[i] ? 'is-open' : ''} ${isChildActive(item.children) ? 'active' : ''}`}
                      onClick={() => toggleMenu(i)}
                    >
                      <span>
                        <IconComponent size={17} className="menu-icon" />
                        {item.title}
                      </span>
                      <span className={`arrow ${openMenus[i] ? 'open' : ''}`}>&#9656;</span>
                    </div>
                    {openMenus[i] && item.children && (
                      <div className="submenu">
                        {item.children.map((child, j) => (
                          <Link
                            key={j}
                            to={child.path}
                            onClick={closeSidebar}
                            className={`submenu-item ${location.pathname === child.path ? 'active' : ''}`}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="toggle-btn" onClick={toggleSidebar}><Menu size={20} /></button>
          </div>

          <div className="topbar-right">
            <div className="notif-wrapper" ref={notifRef}>
              <button className="topbar-icon-btn" title="Notifications" onClick={openNotifications}>
                <Bell size={20} />
                {notifCount > 0 && <span className="notif-badge">{notifCount > 99 ? '99+' : notifCount}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-title">Notifications</span>
                    {notifCount > 0 && <button className="notif-mark-read" onClick={markAllRead}>Mark all read</button>}
                  </div>
                  <div className="notif-list">
                    {notifLoading ? <div className="notif-empty">Loading...</div> :
                      notifications.length === 0 ? <div className="notif-empty">No notifications</div> :
                      notifications.map(n => (
                        <div key={n.id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
                          <div className="notif-item-title">{n.title}</div>
                          <div className="notif-item-msg">{n.message}</div>
                          <div className="notif-item-time">{n.created_at ? new Date(n.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-divider"></div>

            <div className="user-profile">
              <div className="user-avatar">{userInitial}</div>
              <div className="user-info">
                <span className="user-name">{userName}</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

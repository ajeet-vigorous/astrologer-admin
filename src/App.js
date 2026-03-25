import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Astrologers from './pages/Astrologers';
import AstrologerDetail from './pages/AstrologerDetail';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Skills from './pages/Skills';
import Gifts from './pages/Gifts';
import HoroscopeSigns from './pages/HoroscopeSigns';
import AstrologerCategories from './pages/AstrologerCategories';
import Banners from './pages/Banners';
import Coupons from './pages/Coupons';
import Notifications from './pages/Notifications';
import Blogs from './pages/Blogs';
import News from './pages/News';
import AstroMallCategories from './pages/AstroMallCategories';
import AstroMallProducts from './pages/AstroMallProducts';
import ProductForm from './pages/ProductForm';
import ProductDetail from './pages/ProductDetail';
import ProductRecommend from './pages/ProductRecommend';
import HelpSupport from './pages/HelpSupport';
import Commissions from './pages/Commissions';
import DailyHoroscope from './pages/DailyHoroscope';
import Horoscope from './pages/Horoscope';
import DailyHoroscopeInsight from './pages/DailyHoroscopeInsight';
import WeeklyHoroscope from './pages/WeeklyHoroscope';
import YearlyHoroscope from './pages/YearlyHoroscope';
import Tickets from './pages/Tickets';
import CallHistory from './pages/CallHistory';
import ChatHistory from './pages/ChatHistory';
import ReportRequests from './pages/ReportRequests';
import PartnerEarnings from './pages/PartnerEarnings';
import Earnings from './pages/Earnings';
import AdminEarnings from './pages/AdminEarnings';
import AstrologerEarnings from './pages/AstrologerEarnings';
import OrderRequests from './pages/OrderRequests';
import Orders from './pages/Orders';
import DefaultImages from './pages/DefaultImages';
import SystemFlags from './pages/SystemFlags';
import Withdrawals from './pages/Withdrawals';
import ReportBlocks from './pages/ReportBlocks';
import BlockedAstrologers from './pages/BlockedAstrologers';
import Reports from './pages/Reports';
import TeamRoles from './pages/TeamRoles';
import TeamMembers from './pages/TeamMembers';
import AppFeedback from './pages/AppFeedback';
import AdsVideos from './pages/AdsVideos';
import Recharge from './pages/Recharge';
import Stories from './pages/Stories';
import PujaCategories from './pages/PujaCategories';
import PujaSubCategories from './pages/PujaSubCategories';
import PujaList from './pages/PujaList';
import AddPuja from './pages/AddPuja';
import ViewPuja from './pages/ViewPuja';
import PujaOrders from './pages/PujaOrders';
import PujaRecommends from './pages/PujaRecommends';
import AstrologerPuja from './pages/AstrologerPuja';
import PujaPackages from './pages/PujaPackages';
import PujaFaq from './pages/PujaFaq';
import ProfileBoostList from './pages/ProfileBoostList';
import ProfileBoostForm from './pages/ProfileBoostForm';
import ProfileBoostHistory from './pages/ProfileBoostHistory';
import KundaliEarnings from './pages/KundaliEarnings';
import KundaliPrices from './pages/KundaliPrices';
import ReferralSettings from './pages/ReferralSettings';
import CourseCategories from './pages/CourseCategories';
import CourseList from './pages/CourseList';
import CourseChapters from './pages/CourseChapters';
import AddCourseChapter from './pages/AddCourseChapter';
import CourseOrders from './pages/CourseOrders';
import AstrologerDocuments from './pages/AstrologerDocuments';
import Pages from './pages/Pages';
import AppDesign from './pages/AppDesign';
import TrainingVideos from './pages/TrainingVideos';
import WebHomeFaq from './pages/WebHomeFaq';
import PendingAstrologers from './pages/PendingAstrologers';
import AstrologerAssistants from './pages/AstrologerAssistants';
import AstrologerForm from './pages/AstrologerForm';
import WalletHistory from './pages/WalletHistory';
import WithdrawalMethods from './pages/WithdrawalMethods';
import ContactList from './pages/ContactList';
import ExotelReport from './pages/ExotelReport';
import HoroscopeFeedback from './pages/HoroscopeFeedback';
import ChatsMonitoring from './pages/ChatsMonitoring';
import CallsMonitoring from './pages/CallsMonitoring';
import BlockKeywords from './pages/BlockKeywords';
import EmailTemplates from './pages/EmailTemplates';
import AiAstrologerList from './pages/AiAstrologerList';
import AiAstrologerForm from './pages/AiAstrologerForm';
import MasterAiBotList from './pages/MasterAiBotList';
import MasterAiBotForm from './pages/MasterAiBotForm';
import AiChatHistory from './pages/AiChatHistory';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="astrologers" element={<Astrologers />} />
                  <Route path="astrologers/add" element={<AstrologerForm />} />
                  <Route path="astrologers/edit/:id" element={<AstrologerForm />} />
                  <Route path="astrologers/:id" element={<AstrologerDetail />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="customers/:id" element={<CustomerDetail />} />
                  <Route path="skills" element={<Skills />} />
                  <Route path="gifts" element={<Gifts />} />
                  <Route path="horoscope-signs" element={<HoroscopeSigns />} />
                  <Route path="astrologer-categories" element={<AstrologerCategories />} />
                  <Route path="banners" element={<Banners />} />
                  <Route path="coupons" element={<Coupons />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="blogs" element={<Blogs />} />
                  <Route path="news" element={<News />} />
                  <Route path="astromall/categories" element={<AstroMallCategories />} />
                  <Route path="astromall/products" element={<AstroMallProducts />} />
                  <Route path="astromall/products/add" element={<ProductForm />} />
                  <Route path="astromall/products/edit/:id" element={<ProductForm />} />
                  <Route path="astromall/products/view/:id" element={<ProductDetail />} />
                  <Route path="astromall/orders" element={<Orders />} />
                  <Route path="astromall/product-recommend" element={<ProductRecommend />} />
                  <Route path="help-support" element={<HelpSupport />} />
                  <Route path="commissions" element={<Commissions />} />
                  <Route path="daily-horoscope" element={<DailyHoroscope />} />
                  <Route path="horoscope" element={<Horoscope />} />
                  <Route path="daily-horoscope-insight" element={<DailyHoroscopeInsight />} />
                  <Route path="weekly-horoscope" element={<WeeklyHoroscope />} />
                  <Route path="yearly-horoscope" element={<YearlyHoroscope />} />
                  <Route path="tickets" element={<Tickets />} />
                  <Route path="call-history" element={<CallHistory />} />
                  <Route path="chat-history" element={<ChatHistory />} />
                  <Route path="report-requests" element={<ReportRequests />} />
                  <Route path="partner-earnings" element={<PartnerEarnings />} />
                  <Route path="earnings" element={<Earnings />} />
                  <Route path="admin-earnings" element={<AdminEarnings />} />
                  <Route path="astrologer-earnings" element={<AstrologerEarnings />} />
                  <Route path="order-requests" element={<OrderRequests />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="default-images" element={<DefaultImages />} />
                  <Route path="system-flags" element={<SystemFlags />} />
                  <Route path="setting" element={<SystemFlags />} />
                  <Route path="withdrawals" element={<Withdrawals />} />
                  <Route path="report-blocks" element={<ReportBlocks />} />
                  <Route path="blocked-astrologers" element={<BlockedAstrologers />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="team-roles" element={<TeamRoles />} />
                  <Route path="team-list" element={<TeamMembers />} />
                  <Route path="app-feedback" element={<AppFeedback />} />
                  <Route path="ads-videos" element={<AdsVideos />} />
                  <Route path="recharge" element={<Recharge />} />
                  <Route path="stories" element={<Stories />} />
                  <Route path="puja-categories" element={<PujaCategories />} />
                  <Route path="puja-subcategories" element={<PujaSubCategories />} />
                  <Route path="puja-list" element={<PujaList />} />
                  <Route path="puja/add" element={<AddPuja />} />
                  <Route path="puja/edit/:id" element={<AddPuja />} />
                  <Route path="puja/view/:id" element={<ViewPuja />} />
                  <Route path="puja-orders" element={<PujaOrders />} />
                  <Route path="puja-recommends" element={<PujaRecommends />} />
                  <Route path="astrologer-puja" element={<AstrologerPuja />} />
                  <Route path="puja-packages" element={<PujaPackages />} />
                  <Route path="puja-faq" element={<PujaFaq />} />
                  <Route path="profile-boost-list" element={<ProfileBoostList />} />
                  <Route path="profile-boost/add" element={<ProfileBoostForm />} />
                  <Route path="profile-boost/edit/:id" element={<ProfileBoostForm />} />
                  <Route path="profile-boost-history" element={<ProfileBoostHistory />} />
                  <Route path="kundali-earnings" element={<KundaliEarnings />} />
                  <Route path="kundali-prices" element={<KundaliPrices />} />
                  <Route path="referral-settings" element={<ReferralSettings />} />
                  <Route path="course-categories" element={<CourseCategories />} />
                  <Route path="course-list" element={<CourseList />} />
                  <Route path="course-chapters" element={<CourseChapters />} />
                  <Route path="course-chapter/add" element={<AddCourseChapter />} />
                  <Route path="course-chapter/edit/:id" element={<AddCourseChapter />} />
                  <Route path="course-orders" element={<CourseOrders />} />
                  <Route path="astrologer-documents" element={<AstrologerDocuments />} />
                  <Route path="pages" element={<Pages />} />
                  <Route path="app-design" element={<AppDesign />} />
                  <Route path="training-videos" element={<TrainingVideos />} />
                  <Route path="web-home-faq" element={<WebHomeFaq />} />
                  <Route path="pending-astrologers" element={<PendingAstrologers />} />
                  <Route path="astrologer-assistants" element={<AstrologerAssistants />} />
                  <Route path="wallet-history" element={<WalletHistory />} />
                  <Route path="withdrawal-methods" element={<WithdrawalMethods />} />
                  <Route path="contact-list" element={<ContactList />} />
                  <Route path="exotel-report" element={<ExotelReport />} />
                  <Route path="horoscope-feedback" element={<HoroscopeFeedback />} />
                  <Route path="chats-monitoring" element={<ChatsMonitoring />} />
                  <Route path="calls-monitoring" element={<CallsMonitoring />} />
                  <Route path="block-keywords" element={<BlockKeywords />} />
                  <Route path="email-templates" element={<EmailTemplates />} />
                  <Route path="ai-astrologer" element={<AiAstrologerList />} />
                  <Route path="ai-astrologer/create" element={<AiAstrologerForm />} />
                  <Route path="ai-astrologer/edit/:id" element={<AiAstrologerForm />} />
                  <Route path="master-ai-bot" element={<MasterAiBotList />} />
                  <Route path="master-ai-bot/create" element={<MasterAiBotForm />} />
                  <Route path="master-ai-bot/edit/:id" element={<MasterAiBotForm />} />
                  <Route path="ai-chat-history" element={<AiChatHistory />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

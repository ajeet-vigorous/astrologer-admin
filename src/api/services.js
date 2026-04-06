import API from './axiosInstance';

// ==================== DASHBOARD ====================
export const dashboardApi = {
  get: () => API.get('/dashboard'),
  verifyAstrologer: (data) => API.post('/dashboard/verified-astrologer', data),
  getBusinessReport: (params) => API.get('/dashboard/business-report', { params }),
};

// ==================== CUSTOMERS ====================
export const customerApi = {
  getAll: (params) => API.get('/customers', { params }),
  getById: (id) => API.get(`/customers/detail/${id}`),
  getEdit: (id) => API.get(`/customers/edit/${id}`),
  add: (data) => API.post('/customers/add', data),
  edit: (data) => API.post('/customers/edit', data),
  delete: (data) => API.post('/customers/delete', data),
  printPdf: (params) => API.get('/customers/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/customers/export-csv', { params, responseType: 'blob' }),
  rechargeWallet: (data) => API.post('/customers/recharge-wallet', data)
};

// ==================== ASTROLOGERS ====================
export const astrologerApi = {
  getAll: (params) => API.get('/astrologers', { params }),
  getPending: (params) => API.get('/astrologers/pending', { params }),
  add: (data) => API.post('/astrologers/add', data),
  editTotalOrder: (data) => API.post('/astrologers/edit-total-order', data),
  updateSectionStatus: (data) => API.post('/astrologers/update-section-status', data),
  getAssistants: (params) => API.get('/astrologers/assistants', { params }),
  deleteAssistant: (data) => API.post('/astrologers/assistants/delete', data),
  getDetail: (id) => API.get(`/astrologers/detail/${id}`),
  getEdit: (id) => API.get(`/astrologers/edit/${id}`),
  edit: (data) => API.post('/astrologers/edit', data),
  delete: (data) => API.post('/astrologers/delete', data),
  verify: (data) => API.post('/astrologers/verified', data),
  printPdf: (params) => API.get('/astrologers/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/astrologers/export-csv', { params, responseType: 'blob' }),
  updateCommission: (data) => API.post('/astrologers/update-commission', data)
};

// ==================== SKILLS ====================
export const skillApi = {
  getAll: (params) => API.get('/skills', { params }),
  add: (data) => API.post('/skills/add', data),
  edit: (data) => API.post('/skills/edit', data),
  status: (data) => API.post('/skills/status', data),
  delete: (data) => API.post('/skills/delete', data)
};

// ==================== GIFTS ====================
export const giftApi = {
  getAll: (params) => API.get('/gifts', { params }),
  add: (data) => API.post('/gifts/add', data),
  edit: (data) => API.post('/gifts/edit', data),
  status: (data) => API.post('/gifts/status', data),
  delete: (data) => API.post('/gifts/delete', data)
};

// ==================== BANNERS ====================
export const bannerApi = {
  getAll: (params) => API.get('/banners', { params }),
  add: (data) => API.post('/banners/add', data),
  edit: (data) => API.post('/banners/edit', data),
  status: (data) => API.post('/banners/status', data),
  delete: (data) => API.post('/banners/delete', data)
};

// ==================== COUPONS ====================
export const couponApi = {
  getAll: (params) => API.get('/coupons', { params }),
  add: (data) => API.post('/coupons/add', data),
  edit: (data) => API.post('/coupons/edit', data),
  status: (data) => API.post('/coupons/status', data)
};

// ==================== NOTIFICATIONS ====================
export const notificationApi = {
  getAll: (params) => API.get('/notifications', { params }),
  add: (data) => API.post('/notifications/add', data),
  edit: (data) => API.post('/notifications/edit', data),
  status: (data) => API.post('/notifications/status', data),
  send: (data) => API.post('/notifications/send', data)
};

// ==================== BLOGS ====================
export const blogApi = {
  getAll: (params) => API.get('/blogs', { params }),
  getById: (id) => API.get(`/blogs/${id}`),
  add: (data) => API.post('/blogs/add', data),
  edit: (data) => API.post('/blogs/edit', data),
  status: (data) => API.post('/blogs/status', data),
  delete: (data) => API.post('/blogs/delete', data)
};

// ==================== HOROSCOPE SIGNS ====================
export const horoscopeSignApi = {
  getAll: (params) => API.get('/horoscope-signs', { params }),
  add: (data) => API.post('/horoscope-signs/add', data),
  edit: (data) => API.post('/horoscope-signs/edit', data),
  status: (data) => API.post('/horoscope-signs/status', data)
};

// ==================== ASTROLOGER CATEGORIES ====================
export const astrologerCategoryApi = {
  getAll: (params) => API.get('/astrologer-categories', { params }),
  add: (data) => API.post('/astrologer-categories/add', data),
  edit: (data) => API.post('/astrologer-categories/edit', data),
  status: (data) => API.post('/astrologer-categories/status', data)
};

// ==================== NEWS ====================
export const newsApi = {
  getAll: (params) => API.get('/news', { params }),
  add: (data) => API.post('/news/add', data),
  edit: (data) => API.post('/news/edit', data),
  status: (data) => API.post('/news/status', data),
  delete: (data) => API.post('/news/delete', data)
};

// ==================== ASTROMALL ====================
export const astroMallApi = {
  getCategories: (params) => API.get('/astromall/categories', { params }),
  getCategoriesDropdown: () => API.get('/astromall/categories/dropdown'),
  getCategoryById: (id) => API.get(`/astromall/categories/${id}`),
  addCategory: (data) => API.post('/astromall/categories/add', data),
  editCategory: (data) => API.post('/astromall/categories/edit', data),
  categoryStatus: (data) => API.post('/astromall/categories/status', data),
  getProducts: (params) => API.get('/astromall/products', { params }),
  getProductById: (id) => API.get(`/astromall/products/${id}`),
  addProduct: (data) => API.post('/astromall/products/add', data),
  editProduct: (data) => API.post('/astromall/products/edit', data),
  productStatus: (data) => API.post('/astromall/products/status', data),
  addProductDetail: (data) => API.post('/astromall/products/detail', data),
  deleteCategory: (data) => API.post('/astromall/categories/delete', data),
  deleteProduct: (data) => API.post('/astromall/products/delete', data)
};

// ==================== HELP SUPPORT ====================
export const helpSupportApi = {
  getAll: () => API.get('/help-support'),
  add: (data) => API.post('/help-support/add', data),
  edit: (data) => API.post('/help-support/edit', data),
  delete: (data) => API.post('/help-support/delete', data),
  getSubCategories: (id) => API.get(`/help-support/sub/${id}`),
  addSubCategory: (data) => API.post('/help-support/sub/add', data),
  editSubCategory: (data) => API.post('/help-support/sub/edit', data),
  deleteSubCategory: (data) => API.post('/help-support/sub/delete', data),
  getSubSubCategories: (id) => API.get(`/help-support/subsub/${id}`),
  addSubSubCategory: (data) => API.post('/help-support/subsub/add', data),
  editSubSubCategory: (data) => API.post('/help-support/subsub/edit', data),
  deleteSubSubCategory: (data) => API.post('/help-support/subsub/delete', data)
};

// ==================== COMMISSIONS ====================
export const commissionApi = {
  getAll: (params) => API.get('/commissions', { params }),
  add: (data) => API.post('/commissions/add', data),
  edit: (data) => API.post('/commissions/edit', data),
  delete: (data) => API.post('/commissions/delete', data)
};

// ==================== DAILY HOROSCOPE ====================
export const dailyHoroscopeApi = {
  getAll: (params) => API.get('/daily-horoscope', { params }),
  add: (data) => API.post('/daily-horoscope/add', data),
  edit: (data) => API.post('/daily-horoscope/edit', data),
  delete: (data) => API.post('/daily-horoscope/delete', data),
  getFeedback: (params) => API.get('/daily-horoscope/feedback', { params })
};

// ==================== HOROSCOPE ====================
export const horoscopeApi = {
  getAll: (params) => API.get('/horoscope', { params }),
  add: (data) => API.post('/horoscope/add', data),
  edit: (data) => API.post('/horoscope/edit', data),
  delete: (data) => API.post('/horoscope/delete', data),
  getDailyList: (params) => API.get('/horoscope/daily-list', { params }),
  getWeeklyList: (params) => API.get('/horoscope/weekly-list', { params }),
  getYearlyList: (params) => API.get('/horoscope/yearly', { params }),
  getFeedbackList: (params) => API.get('/horoscope/feedback-list', { params }),
  generateDaily: () => API.post('/horoscope/generate-daily'),
  generateWeekly: () => API.post('/horoscope/generate-weekly'),
  generateYearly: () => API.post('/horoscope/generate-yearly'),
};

// ==================== DAILY HOROSCOPE INSIGHT ====================
export const dailyHoroscopeInsightApi = {
  getAll: (params) => API.get('/daily-horoscope-insight', { params }),
  add: (data) => API.post('/daily-horoscope-insight/add', data),
  edit: (data) => API.post('/daily-horoscope-insight/edit', data),
  delete: (data) => API.post('/daily-horoscope-insight/delete', data)
};

// ==================== TICKETS ====================
export const ticketApi = {
  getAll: (params) => API.get('/tickets', { params }),
  close: (data) => API.post('/tickets/close', data),
  pause: (data) => API.post('/tickets/pause', data)
};

// ==================== CHATS ====================
export const chatApi = {
  getAll: () => API.get('/chats'),
  getBySender: (senderId) => API.get(`/chats/sender/${senderId}`),
  create: (data) => API.post('/chats/create', data),
  delete: (data) => API.post('/chats/delete', data)
};

// ==================== FCM ====================
export const fcmApi = {
  saveToken: (data) => API.post('/fcm/save-token', data)
};

// ==================== REPORTS ====================
export const callHistoryApi = {
  getAll: (params) => API.get('/call-history', { params }),
  printPdf: (params) => API.get('/call-history/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/call-history/export-csv', { params, responseType: 'blob' })
};

export const chatHistoryApi = {
  getAll: (params) => API.get('/chat-history', { params }),
  printPdf: (params) => API.get('/chat-history/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/chat-history/export-csv', { params, responseType: 'blob' })
};

export const reportRequestApi = {
  getAll: (params) => API.get('/report-requests', { params }),
  printPdf: (params) => API.get('/report-requests/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/report-requests/export-csv', { params, responseType: 'blob' })
};

export const partnerEarningApi = {
  getAll: (params) => API.get('/partner-earnings', { params }),
  printPdf: (params) => API.get('/partner-earnings/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/partner-earnings/export-csv', { params, responseType: 'blob' })
};

export const earningApi = {
  getAll: (params) => API.get('/earnings', { params }),
  printPdf: (params) => API.get('/earnings/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/earnings/export-csv', { params, responseType: 'blob' }),
  adminEarnings: (params) => API.get('/earnings/admin', { params }),
  adminExportCsv: (params) => API.get('/earnings/admin/export-csv', { params, responseType: 'blob' }),
  astrologerEarning: (params) => API.get('/earnings/astrologer', { params })
};

export const orderRequestApi = {
  getAll: (params) => API.get('/order-requests', { params }),
  printPdf: (params) => API.get('/order-requests/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/order-requests/export-csv', { params, responseType: 'blob' })
};

export const orderApi = {
  getAll: (params) => API.get('/orders', { params }),
  changeStatus: (data) => API.post('/orders/change-status', data),
  downloadInvoice: (id) => API.get(`/orders/invoice/${id}`),
  printPdf: (params) => API.get('/orders/print', { params, responseType: 'blob' }),
  exportCsv: (params) => API.get('/orders/export-csv', { params, responseType: 'blob' }),
  getProductRecommend: (params) => API.get('/orders/product-recommend', { params })
};

// ==================== OTHER ====================
export const defaultImageApi = {
  getAll: (params) => API.get('/default-images', { params }),
  add: (data) => API.post('/default-images/add', data),
  edit: (data) => API.post('/default-images/edit', data),
  status: (data) => API.post('/default-images/status', data)
};

export const systemFlagApi = {
  getAll: (params) => API.get('/system-flags', { params }),
  edit: (data) => API.post('/system-flags/edit', data)
};

export const withdrawalApi = {
  getAll: (params) => API.get('/withdrawals', { params }),
  release: (data) => API.post('/withdrawals/release', data),
  cancel: (data) => API.post('/withdrawals/cancel', data),
  tdsCsv: (params) => API.get('/withdrawals/tds-csv', { params, responseType: 'blob' }),
  tdsPdf: (params) => API.get('/withdrawals/tds-pdf', { params, responseType: 'blob' }),
  walletHistory: (params) => API.get('/withdrawals/wallet-history', { params }),
  walletHistoryCsv: (params) => API.get('/withdrawals/wallet-history-csv', { params, responseType: 'blob' }),
  walletHistoryPdf: (params) => API.get('/withdrawals/wallet-history-pdf', { params, responseType: 'blob' }),
  getMethods: () => API.get('/withdrawals/methods'),
  methodStatus: (data) => API.post('/withdrawals/methods/status', data),
  methodEdit: (data) => API.post('/withdrawals/methods/edit', data)
};

export const reportBlockApi = {
  getAll: (params) => API.get('/report-blocks', { params }),
  delete: (data) => API.post('/report-blocks/delete', data)
};

export const blockAstrologerApi = {
  getAll: (params) => API.get('/blocked-astrologers', { params })
};

export const reportApi = {
  getAll: (params) => API.get('/reports', { params }),
  add: (data) => API.post('/reports/add', data),
  edit: (data) => API.post('/reports/edit', data),
  status: (data) => API.post('/reports/status', data)
};

export const teamRoleApi = {
  getAll: (params) => API.get('/team-roles', { params }),
  add: (data) => API.post('/team-roles/add', data),
  edit: (data) => API.post('/team-roles/edit', data),
  delete: (data) => API.post('/team-roles/delete', data),
  getAddPage: () => API.get('/team-roles/add-page'),
  getEditPage: (id) => API.get(`/team-roles/edit-page/${id}`),
  getMembers: (params) => API.get('/team-roles/members', { params }),
  addMember: (data) => API.post('/team-roles/members/add', data),
  editMember: (data) => API.post('/team-roles/members/edit', data),
  deleteMember: (data) => API.post('/team-roles/members/delete', data)
};

export const appFeedbackApi = {
  getAll: (params) => API.get('/app-feedback', { params }),
  getContacts: (params) => API.get('/app-feedback/contacts', { params }),
  getContactDetails: (params) => API.get('/app-feedback/contact/details', { params })
};

export const adsVideoApi = {
  getAll: (params) => API.get('/ads-videos', { params }),
  add: (data) => API.post('/ads-videos/add', data),
  edit: (data) => API.post('/ads-videos/edit', data),
  status: (data) => API.post('/ads-videos/status', data),
  delete: (data) => API.post('/ads-videos/delete', data)
};

export const rechargeApi = {
  getAll: (params) => API.get('/recharge', { params }),
  add: (data) => API.post('/recharge/add', data),
  edit: (data) => API.post('/recharge/edit', data),
  delete: (data) => API.post('/recharge/delete', data)
};

// ==================== WEB HOME FAQ ====================
export const webHomeFaqApi = {
  getAll: (params) => API.get('/web-home-faq/list', { params }),
  add: (data) => API.post('/web-home-faq/add', data),
  edit: (data) => API.post('/web-home-faq/edit', data),
  delete: (data) => API.delete('/web-home-faq/delete', { data })
};

export const storyApi = {
  getAll: (params) => API.get('/stories', { params }),
  delete: (data) => API.delete('/stories/delete', { data })
};

export const pujaCategoryApi = {
  getAll: (params) => API.get('/puja/categories', { params }),
  add: (data) => API.post('/puja/categories/add', data),
  edit: (data) => API.post('/puja/categories/edit', data),
  status: (data) => API.post('/puja/categories/status', data),
  delete: (data) => API.post('/puja/categories/delete', data)
};

export const pujaSubCategoryApi = {
  getAll: (params) => API.get('/puja/subcategories', { params }),
  add: (data) => API.post('/puja/subcategories/add', data),
  edit: (data) => API.post('/puja/subcategories/edit', data),
  status: (data) => API.post('/puja/subcategories/status', data),
  delete: (data) => API.post('/puja/subcategories/delete', data)
};

// ==================== PUJA MANAGEMENT ====================
export const pujaApi = {
  getList: (params) => API.get('/pujas/list', { params }),
  getAddData: () => API.get('/pujas/add-data'),
  store: (data) => API.post('/pujas/store', data),
  update: (id, data) => API.post(`/pujas/update/${id}`, data),
  edit: (id) => API.get(`/pujas/edit/${id}`),
  view: (id) => API.get(`/pujas/view/${id}`),
  status: (data) => API.post('/pujas/status', data),
  delete: (data) => API.delete('/pujas/delete', { data }),
  getOrders: (params) => API.get('/pujas/orders', { params }),
  updateOrder: (data) => API.post('/pujas/order/update', data),
  getRecommends: (params) => API.get('/pujas/recommends', { params }),
  getAstrologerList: (params) => API.get('/pujas/astrologer-list', { params }),
  approveStatus: (data) => API.post('/pujas/approve-status', data)
};

// ==================== PUJA PACKAGES + FAQ ====================
export const pujaPackageApi = {
  getList: (params) => API.get('/puja-package/list', { params }),
  store: (data) => API.post('/puja-package/store', data),
  update: (id, data) => API.post(`/puja-package/update/${id}`, data),
  edit: (id) => API.get(`/puja-package/edit/${id}`),
  delete: (data) => API.delete('/puja-package/delete', { data }),
  status: (data) => API.post('/puja-package/status', data),
  getFaqList: (params) => API.get('/puja-package/faq', { params }),
  addFaq: (data) => API.post('/puja-package/faq/add', data),
  editFaq: (data) => API.post('/puja-package/faq/edit', data),
  deleteFaq: (data) => API.delete('/puja-package/faq/delete', { data })
};

// ==================== PROFILE BOOST ====================
export const profileBoostApi = {
  getList: (params) => API.get('/profile-boost/list', { params }),
  store: (data) => API.post('/profile-boost/store', data),
  edit: (id) => API.get(`/profile-boost/edit/${id}`),
  update: (id, data) => API.post(`/profile-boost/update/${id}`, data),
  getHistory: (params) => API.get('/profile-boost/history', { params })
};

// ==================== KUNDALI REPORT ====================
export const kundaliApi = {
  getEarnings: (params) => API.get('/kundali/earnings', { params }),
  getPrices: (params) => API.get('/kundali/prices', { params }),
  editAmount: (data) => API.post('/kundali/edit-amount', data)
};

// ==================== REFERRAL SETTINGS ====================
export const referralApi = {
  get: () => API.get('/referral-settings'),
  update: (data) => API.post('/referral-settings/update', data)
};

// ==================== COURSE MANAGEMENT ====================
export const courseApi = {
  getCategories: (params) => API.get('/course/categories', { params }),
  addCategory: (data) => API.post('/course/categories/add', data),
  editCategory: (data) => API.post('/course/categories/edit', data),
  categoryStatus: (data) => API.post('/course/categories/status', data),
  getList: (params) => API.get('/course/list', { params }),
  add: (data) => API.post('/course/add', data),
  edit: (data) => API.post('/course/edit', data),
  status: (data) => API.post('/course/status', data),
  delete: (data) => API.delete('/course/delete', { data }),
  getChapters: (params) => API.get('/course/chapters', { params }),
  getChapterAddData: () => API.get('/course/chapters/add-data'),
  addChapter: (data) => API.post('/course/chapters/add', data),
  editChapter: (id) => API.get(`/course/chapters/edit/${id}`),
  updateChapter: (id, data) => API.post(`/course/chapters/update/${id}`, data),
  chapterStatus: (data) => API.post('/course/chapters/status', data),
  deleteChapter: (data) => API.delete('/course/chapters/delete', { data }),
  getOrders: (params) => API.get('/course/orders', { params })
};

// ==================== PAGE MANAGEMENT ====================
export const pageApi = {
  getAll: () => API.get('/pages/list'),
  add: (data) => API.post('/pages/add', data),
  edit: (data) => API.post('/pages/edit', data),
  status: (data) => API.post('/pages/status', data),
  delete: (data) => API.delete('/pages/delete', { data })
};

// ==================== APP DESIGN ====================
export const appDesignApi = {
  getAll: (params) => API.get('/app-design/list', { params }),
  status: (data) => API.post('/app-design/status', data)
};

// ==================== TRAINING VIDEOS ====================
export const trainingVideoApi = {
  getAll: (params) => API.get('/training-videos/list', { params }),
  add: (data) => API.post('/training-videos/add', data),
  edit: (data) => API.post('/training-videos/edit', data),
  status: (data) => API.post('/training-videos/status', data),
  delete: (data) => API.delete('/training-videos/delete', { data })
};

// ==================== ASTROLOGER DOCUMENTS ====================
export const documentApi = {
  getAll: (params) => API.get('/documents/list', { params }),
  add: (data) => API.post('/documents/add', data),
  edit: (data) => API.post('/documents/edit', data),
  delete: (data) => API.delete('/documents/delete', { data })
};

// ==================== DATA MONITOR ====================
export const dataMonitorApi = {
  getChatsMonitoring: (params) => API.get('/data-monitor/chats-monitoring', { params }),
  getCallsMonitoring: (params) => API.get('/data-monitor/calls-monitoring', { params }),
  getUserChatMonitoring: (params) => API.get('/data-monitor/user-chat-monitoring', { params }),
  getUserDataMonitoring: (id, params) => API.get(`/data-monitor/user-data-monitoring/${id}`, { params }),
  getCounsellor: (params) => API.get('/data-monitor/counsellor-data-monitoring', { params }),
  getFirestoreData: (params) => API.get('/data-monitor/firestore-data', { params }),
  getBlockKeywords: (params) => API.get('/data-monitor/block-keywords', { params }),
  storeKeyword: (data) => API.post('/data-monitor/store-keyword', data),
  getEditKeyword: (id) => API.get(`/data-monitor/edit-keyword/${id}`),
  updateKeyword: (data) => API.put('/data-monitor/update-keyword', data),
  deleteKeyword: (id) => API.delete(`/data-monitor/delete-keyword/${id}`)
};

// ==================== EMAIL TEMPLATES ====================
export const emailTemplateApi = {
  getAll: (params) => API.get('/email-templates', { params }),
  add: (data) => API.post('/email-templates/add', data),
  edit: (data) => API.put('/email-templates/edit', data)
};

// ==================== EXOTEL REPORT ====================
export const reportExotelApi = {
  getAll: (params) => API.get('/reports/exotel', { params })
};

// ==================== HOROSCOPE FEEDBACK ====================
export const horoscopeFeedbackApi = {
  getAll: (params) => API.get('/horoscope/feedback', { params })
};

// ==================== AI ASTROLOGER ====================
export const aiAstrologerApi = {
  getAll: (params) => API.get('/ai-astrologer', { params }),
  getFormData: () => API.get('/ai-astrologer/form-data'),
  store: (data) => API.post('/ai-astrologer/store', data),
  getEdit: (id) => API.get(`/ai-astrologer/edit/${id}`),
  update: (id, data) => API.post(`/ai-astrologer/update/${id}`, data),
  delete: (id) => API.delete(`/ai-astrologer/delete/${id}`),
  getMasterBots: (params) => API.get('/ai-astrologer/master', { params }),
  storeMasterBot: (data) => API.post('/ai-astrologer/master/store', data),
  getMasterBotEdit: (id) => API.get(`/ai-astrologer/master/edit/${id}`),
  updateMasterBot: (id, data) => API.post(`/ai-astrologer/master/update/${id}`, data),
  deleteMasterBot: (id) => API.delete(`/ai-astrologer/master/delete/${id}`),
  getChatHistory: (params) => API.get('/ai-astrologer/chat-history', { params }),
  exportChatCsv: (params) => API.get('/ai-astrologer/chat-history/export-csv', { params, responseType: 'blob' }),
  printChatPdf: (params) => API.get('/ai-astrologer/chat-history/print', { params, responseType: 'blob' })
};

// ==================== PAYMENTS ====================
export const paymentApi = {
  getDetails: (params) => API.get('/payments/details', { params }),
  processResponse: (data) => API.post('/payments/response', data),
  getPending: () => API.get('/payments/pending'),
  getFailed: () => API.get('/payments/failed'),
  getSuccess: () => API.get('/payments/success')
};

const API_BASE = (process.env.REACT_APP_API_URL || 'https://astrology-i7c9.onrender.com/api').replace('/api', '');

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) return API_BASE + img;
  return API_BASE + '/' + img;
};

export default getImageUrl;

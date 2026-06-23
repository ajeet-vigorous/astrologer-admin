const IMAGE_HOST = process.env.REACT_APP_IMAGE_URL;
const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) return IMAGE_HOST + img;
  return IMAGE_HOST + '/' + img;
};

export default getImageUrl;



const formatNumber = (num) => {
  const rounded = Math.round(num);
  if (Math.abs(rounded) >= 10000) {
    return rounded.toLocaleString('en-IN');
  }
  return rounded.toString();
};

export default formatNumber;

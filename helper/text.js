exports.handleText = (value) => {
  value = value.trim();
  value = value[0].toUpperCase() + value.slice(1);
  return value;
};

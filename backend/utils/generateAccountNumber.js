const generateAccountNumber = () => {
  const digits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  return `VX${digits}`;
};

module.exports = generateAccountNumber;

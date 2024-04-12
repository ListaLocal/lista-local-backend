const validateUserRegistration = [
  check("email").isEmail({}),
  check("password").isLength({ min: 6 }),
];
module.exports = validateUserRegistration;
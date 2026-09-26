const validator = require('validatorjs');

const Validator = (body, rules, customMessages, callback) => {
  const validation = new validator(body, rules, customMessages);
  validation.passes(() => {
    callback(null, true);
  });
  validation.fails(() => {
    callback(validation.errors, false);
  });
};

module.exports = Validator;

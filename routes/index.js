const router = require('express').Router();
const passport = require('passport');

router.get('/login', (req, res, next) => {
  //#swagger.ignore = true
  passport.authenticate('github')(req, res, next);
});

router.get('/logout', (req, res, next) => {
  //#swagger.ignore = true
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => res.redirect('/'));
  });
});

// Daniel Paulino
router.use('/users', require('./users'));
router.use('/production-orders', require('./productionOrders'));
router.use('/customer-orders', require('./customerOrders'));


// Martha y Emerald add your routes here:
// router.use('/materials', require('./materials'));
// router.use('/suppliers', require('./suppliers'));
// router.use('/products', require('./products'));

module.exports = router;

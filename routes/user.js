var validator = require('validator');
var apiHelpers = require('./api_helpers');
var errors = require('./errors');
var models = require('../models/models');
var passport = require('passport');

function bootstrap(user, callback) {
  user.load(['organization', 'organization.users', 'organization.tags',
    'organization.tags.users', 'tags'])
    .then(function(model) {
      callback(model);
    });
}

exports.auth = function(req, res, callback) {
  if (req.isAuthenticated()) {
    callback(req.user);
  } else {
    return res.json({
      error: 'Please log in.'
    });
  }
};

exports.config = function(app) {
  app.post('/api/get_user_data', function(req, res) {
    exports.auth(req, res, function(user) {
      bootstrap(user, function(model) {
        return res.json({
          error: null,
          user: model
        });
      });
    });
  });

  // Logs the user in through Google
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

  // After the user logs in through Google
  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      const email = req.user.emails[0].value;

      models.User.where({ email: email })
      .fetch()
      .then(function(user) {
        // Create a new user if this user doesn't exist.
        if (!user) {
          console.log('user does not exist');
          const domain = email.split('@')[1];
          models.Organization.where({ domain: domain })
            .fetch()
            .then(function(org) {
              if (!org) {
                return res.json({
                  error: 'This organization is not registered.'
                });
              }

              models.User.forge({
                email: email,
                organization_id: org.get('id')
              })
                .save()
                .then(function(user) {
                  bootstrap(user, function(model) {
                    return res.json({
                      error: null,
                      user: model
                    });
                  });
                })
                .catch(function(err) {
                  return errors.render500(req, res, err);
                });
            })
            .catch(function(err) {
              return errors.render500(req, res, err);
            });
        } else {
          res.redirect('/');
        }
      });
    });

  // Logs out the current user.
  app.post('/api/log_out', function(req, res) {
    req.logout();
    return res.json({
      error: null
    });
  });
};

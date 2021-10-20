//imports
const admin = require("firebase-admin");
const { config } = require("../../config");
const { firebase } = config;

//initialize  firebase

admin.initializeApp({
  credential: admin.credential.cert(firebase.certConfig),
});

const auth = admin.auth();

module.exports = {
  admin: admin,
  auth: auth,
};

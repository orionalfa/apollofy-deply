const { auth } = require("../services/firebase/firebase");

async function authMiddleware(req, res, next) {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const token = req.headers.authorization.substr(7);
    try {
      const userClaims = await auth.verifyIdToken(token);
      console.log(userClaims);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    res.status(401).send({
      data: null,
      error: "unauthorized",
    });
  }
}

module.exports = authMiddleware;

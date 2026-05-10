const jwt = require('jsonwebtoken')
require('dotenv').config()
const isLoggined = (req, res, next) => {
  const token = req.cookies.login;

  if (!token) {
    return res.redirect('/admin/login');
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.redirect('/admin/login');
  }
};
module.exports=isLoggined
const jwt = require("jsonwebtoken");
const { RefreshToken } = require("../Models");

const generateRefreshToken = async (userId) => {
  const refreshToken = await RefreshToken.create({
    user: userId, // for db usage
    token: jwt.sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET),
  });

  return refreshToken.token;
};

const generateAccessToken = (userId) => {
  const accessToken = jwt.sign(
    { userId: userId },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_LIFE,
    }
  );

  return accessToken;
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) return res.sendStatus(403); // Need get a new token

    req.userId = data.userId;
    return next();
  });
};

module.exports = { verifyToken, generateAccessToken, generateRefreshToken };

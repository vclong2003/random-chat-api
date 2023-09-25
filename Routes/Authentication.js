const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, RefreshToken } = require("../Models");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../Utils/JWT");

const router = express.Router();

// GET: /auth
// Verify Token
router.get("/", verifyToken, async (req, res) => {
  return res.sendStatus(200);
});

// GET: /auth/token
// Get Access token
router.get("/token", async (req, res) => {
  const refreshToken = req.cookies["refreshToken"];

  // Check if refresh token exists in the database
  const dbRefreshToken = await RefreshToken.findOne({ token: refreshToken });
  if (!dbRefreshToken) return res.sendStatus(401);

  jwt.verify(
    dbRefreshToken.token,
    process.env.REFRESH_TOKEN_SECRET,
    (err, data) => {
      if (err) {
        RefreshToken.deleteOne(dbRefreshToken.id);
        return res.sendStatus(401);
      }

      return res
        .status(200)
        .json({ accessToken: generateAccessToken(data.userId) });
    }
  );
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username: username });
  if (!existingUser) return res.sendStatus(404);

  const passwordFlag = bcrypt.compareSync(password, existingUser.password);

  if (passwordFlag) {
    return res
      .cookie("refreshToken", await generateRefreshToken(existingUser.id))
      .status(200);
  }

  return res.sendStatus(403);
});

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username: username });
  if (existingUser) return res.sendStatus(400);

  const hashedPassword = bcrypt.hashSync(password, 10);

  let newUser;
  try {
    newUser = await User.create({
      username: username,
      password: hashedPassword,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res
    .cookie("refreshToken", await generateRefreshToken(newUser.id))
    .status(200)
    .json({
      accessToken: generateAccessToken(newUser.id),
    });
});

module.exports = router;

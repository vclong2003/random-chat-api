const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, RefreshToken } = require("../Models");
const { generateAccessToken, generateRefreshToken } = require("../Utils/JWT");

const router = express.Router();

// Get Access token
router.post("/token", async (req, res) => {
  const refreshToken = req.cookies["refreshToken"];

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
        .json({ access_token: generateAccessToken(data.userId) });
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
      .status(200)
      .json({
        accessToken: generateAccessToken(existingUser.id),
      });
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

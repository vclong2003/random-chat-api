const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, RefreshToken } = require("../Models");
const { generateAccessToken, generateRefreshToken } = require("../Utils/JWT");

const router = express.Router();

// Get Access token
router.post("/token", async (req, res) => {
  const refreshToken = req.body.refresh_token;

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
  const { phone, password } = req.body;

  const existingUser = await User.findOne({ phone: phone });
  if (!existingUser) return res.sendStatus(404);

  const passwordFlag = bcrypt.compareSync(password, existingUser.password);

  if (passwordFlag) {
    return res.status(200).json({
      accessToken: generateAccessToken(existingUser.id),
      refreshToken: await generateRefreshToken(existingUser.id),
    });
  }

  return res.sendStatus(403);
});

// Register
router.post("/register", async (req, res) => {
  const { phone, password } = req.body;

  const existingUser = await User.findOne({ phone: phone });
  if (existingUser) return res.sendStatus(400);

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    await User.create({
      phone: phone,
      password: hashedPassword,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
});

module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { readData, writeData } = require("../utils/jsonStore");
const { isStrongPassword } = require("../utils/passwordPolicy");

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// POST /api/auth/signup - { name, email, password }
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required." });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "A valid email is required." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message: "This password is too weak. Avoid simple ones like 123456 or 111111 — use a mix of letters and numbers.",
    });
  }

  const users = readData("users.json");
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeData("users.json", users);

  const { passwordHash: _omit, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser });
});

// POST /api/auth/login - { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = readData("users.json");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const { passwordHash: _omit, ...safeUser } = user;
  res.json({ user: safeUser });
});

module.exports = router;

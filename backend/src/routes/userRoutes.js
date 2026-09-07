const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Authenticated successfully",
    user: req.user,
  });
});

module.exports = router;
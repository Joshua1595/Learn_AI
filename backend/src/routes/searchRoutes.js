const express = require("express");

const {
  searchDocument,
} = require("../controllers/searchController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/documents/:documentId/search",
  protect,
  searchDocument
);

module.exports = router;
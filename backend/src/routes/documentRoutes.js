const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


const {
  uploadDocument,
  getMyDocuments,
  deleteDocument,
} = require("../controllers/documentController");


const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("document"),
  uploadDocument
);
router.get(
  "/",
  protect,
  getMyDocuments
);
router.delete(
  "/:documentId",
  protect,
  deleteDocument
);
 

module.exports = router;
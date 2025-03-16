const express = require("express");

const {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

const { isLoggedIn } = require("../middleware/auth");

const noteRouter = express.Router();

noteRouter.post("/", isLoggedIn, createNote);
noteRouter.get("/", isLoggedIn, getAllNotes);
noteRouter.get("/:id", isLoggedIn, getSingleNote);
noteRouter.put("/:id", isLoggedIn, updateNote);
noteRouter.delete("/:id", isLoggedIn, deleteNote);

module.exports = noteRouter;

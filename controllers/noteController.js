const createError = require("http-errors");
const { successResponse } = require("../controllers/responseController");
const Note = require("../models/noteModel");

// Create a new note
const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;


    console.log('dfsdfdsf',  title, content);
    

    if (!title || !content) {
      throw createError(400, "Title and content are required");
    }

    const newNote = new Note({ author: req.user._id, title, content });
    await newNote.save();

    console.log("🔄 Emitting socket event: noteCreated", newNote);
    req.io.emit("noteCreated", { _id: newNote._id, title, content }); // Send only required data

    return successResponse(res, {
      statusCode: 201,
      message: "Note successfully created",
      payload: newNote,
    });
  } catch (error) {
    next(error);
  }
};

// Get all notes for the authenticated user
const getAllNotes = async (req, res, next) => {
  try {
    const notes = await Note.find({ author: req.user._id });

    return successResponse(res, {
      statusCode: 200,
      message: "Notes successfully retrieved",
      payload: notes,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single note by ID
const getSingleNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await Note.findOne({ _id: id, author: req.user._id });

    if (!note) {
      throw createError(404, "Note not found");
    }

    return successResponse(res, {
      statusCode: 200,
      message: "Note successfully retrieved",
      payload: note,
    });
  } catch (error) {
    next(error);
  }
};

// Update a note
const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, author: req.user._id },
      { title, content },
      { new: true }
    );

    if (!updatedNote) {
      throw createError(404, "Note not found");
    }

    console.log("🔄 Emitting socket event: noteUpdated", updatedNote);
    req.io.emit("noteUpdated", { _id: updatedNote._id, title, content });

    return successResponse(res, {
      statusCode: 200,
      message: "Note successfully updated",
      payload: updatedNote,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a note
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedNote = await Note.findOneAndDelete({ _id: id, author: req.user._id });

    if (!deletedNote) {
      throw createError(404, "Note not found");
    }

    console.log("🗑️ Emitting socket event: noteDeleted", deletedNote);
    req.io.emit("noteDeleted", { _id: id });

    return successResponse(res, {
      statusCode: 200,
      message: "Note successfully deleted",
      payload: { _id: id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
};

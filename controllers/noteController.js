
const Note = require("../models/noteModel");
const User = require("../models/userModel");
const createError = require("http-errors");
const { successResponse } = require("../controllers/responseController");


// Create a new note
const createNote = async (req, res, next) => {
  try {
    const { title, content, isPublic } = req.body;

    if (!req.user || !req.user._id) {
      throw createError(401, "Unauthorized");
    }

    const newNote = await Note.create({
      title,
      content,
      author: req.user._id,
      isPublic,
      editHistory: [],
    });

    // Populate the newly created note
    const populatedNote = await Note.findById(newNote._id)
      .populate("author", "name email")
      .lean();

    // Emit WebSocket event to notify clients
    if (req.io) {
      console.log("🆕 Emitting socket event: noteCreated", populatedNote);
      req.io.emit("noteCreated", populatedNote);

      // Fetch all notes again and emit `notesUpdated` for real-time update
      const allNotes = await Note.find()
        .populate("author", "name email")
        .populate("editHistory.userId", "name email")
        .lean();

      console.log("📢 Emitting socket event: notesUpdated", allNotes);
      req.io.emit("notesUpdated", allNotes);
    }

    return res.status(201).json({
      success: true,
      message: "Note successfully created",
      payload: populatedNote,
    });
  } catch (error) {
    next(error);
  }
};


// Get all notes (user's own notes + public notes)
const getAllNotes = async (req, res, next) => {
  try {
    const notes = await Note.find()
      .populate("author", "name email")
      .populate("editHistory.userId", "name email")
      .lean();

    // Emit a WebSocket event to update clients with the latest notes
    if (req.io) {
      console.log("📢 Emitting socket event: notesUpdated", notes);
      req.io.emit("notesUpdated", notes);
    }

    return res.status(200).json({
      success: true,
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
    const note = await Note.findOne({
      _id: id,
      $or: [{ author: req.user._id }, { isPublic: true }],
    }).populate("author", "name email");

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

// Update a note (Author & Public users can update)
const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    // Ensure user is authenticated
    if (!req.user) {
      throw createError(401, "User not found.");
    }

    const note = await Note.findById({_id: req.params.id}); 

    if (!note) {
   throw createError(401, "Note not found.");
    }

    // Update note fields if provided
    if (title) note.title = title;
    if (content) note.content = content;

    // Push edit history entry with both userId and userName
    note.editHistory.push({
      userId: req.user._id,
      userName:  req.user.name,
      editedAt: new Date(),
    });

    await note.save(); // Save changes

    // Emit socket event for real-time updates (check if `req.io` exists)
    if (req.io) {
      req.io.emit("noteUpdated", {
        _id: note._id,
        title: note.title,
        content: note.content,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note successfully updated",
      payload: note,
    });
  } catch (error) {
    next(error);
  }
};

//deleeted
const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return next(createError(401, "Unauthorized"));
    }

    // Find and delete note only if the author matches the logged-in user
    const deletedNote = await Note.findOneAndDelete({ _id: id, author: req.user._id });

    if (!deletedNote) {
      return next(createError(404, "Note not found or not authorized to delete"));
    }

    // Emit socket event (if `req.io` exists)
    if (req.io) {
      console.log("🗑️ Emitting socket event: noteDeleted", deletedNote);
      req.io.emit("noteDeleted", { _id: id });
    }

    return res.status(200).json({
      success: true,
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



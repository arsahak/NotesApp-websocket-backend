

const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPublic: { type: Boolean, default: false },
    editHistory: [
      {
        userName: { type: String, required: true },
        userId: { type: String, required: true },
        editedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // Apply timestamps to the whole schema
);

const Note = mongoose.model("Note", NoteSchema);
module.exports = Note;

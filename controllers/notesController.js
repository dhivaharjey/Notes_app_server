import mongoose from "mongoose";
import Notes from "../models/notesSchema.js";

///-------- Add New Note -----------///
export const AddNewNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const user = req.user;

    // console.log(user);

    if (!title || !content || !tags) {
      return res
        .status(400)
        .json({ message: "Title ,Content and tags are requird" });
    }
    const note = new Notes({
      title,
      content,
      isPinned: false,
      tags: tags || [],
      userId: user?._id,
    });

    await note.save();

    return res.status(201).json({ message: "New Note Created", note });
  } catch (error) {
    res.status(500).json({ message: error?.message });
  }
};

///-------- Update Note -----------///
export const updateNote = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;

    const user = req.user;
    // console.log(user?._id);

    if (!title && !content && !tags && isPinned === undefined) {
      return res.status(400).json({ message: "No changes !!!!" });
    }
    // console.log(noteId);

    // const note = await Notes.findByIdAndUpdate(
    //   noteId,
    //   {
    //     title,
    //     content,
    //     isPinned,
    //     tags,
    //     userId: user?._id,
    //   },
    //   {
    //     new: true,
    //     runValidators: true,
    //   }
    // );
    const note = await Notes.findOne({ _id: noteId, userId: user?._id });

    if (!note) {
      return res.status(404).json({ message: "Note Not Found !!!!" });
    }
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.status(201).json({ message: "Note updated!!!", note });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error?.message || "Internal Server Error" });
  }
};
///-------- Get All Notes -----------///
export const getAllNotes = async (req, res) => {
  try {
    const user = req.user;

    // const getAllNotes = await Notes.aggregate([
    //   { $match: { userId: user._id } }, // Find only the logged-in user's notes

    //   { $sort: { createdAt: -1, updatedAt: -1 } }, //  Sort before `$lookup`

    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "userId",
    //       foreignField: "_id",
    //       as: "user",
    //     },
    //   },

    //   // { $unwind: "$user" }, //  Convert `user` array to object

    //   {
    //     $project: {
    //       //  Select only required fields
    //       title: 1,
    //       content: 1,
    //       isPinned: 1,
    //       tags: 1,
    //       "user._id": 1,
    //       "user.email": 1,
    //       "user.userName": 1,
    //     },
    //   },
    // ]);
    // console.log(user._id);
    // const userId = mongoose.Types.ObjectId(user._id);
    const getAllNotes = await Notes.find({ userId: user._id }).sort({
      isPinned: -1,
      updatedAt: -1,
    });
    // .populate("userId", " userName email")
    // .lean();

    return res.status(200).json(getAllNotes);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

///-------- Delete Note -----------///
export const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const user = req.user;

    const note = await Notes.findOneAndDelete({
      _id: noteId,
      userId: user._id,
    });
    if (!note) {
      return res.status(404).json({ message: "Note Not Found !!!!" });
    }
    return res.status(200).json({ message: "Note Deleted Successfully!!" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

///-----isPinned ------- ///

export const toggleIsPinned = async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    // console.log(isPinned);

    const user = req.user;

    if (isPinned === undefined) {
      return res
        .status(400)
        .json({ message: "Error in updating.. value requied" });
    }
    const note = await Notes.findOne({
      _id: noteId,
      userId: user._id,
    });
    if (!note) {
      return res.status(404).json({ message: "Note Not Found !!!!" });
    }
    if (isPinned !== undefined) note.isPinned = isPinned;
    await note.save();
    const msg = isPinned ? "Note is Pinned!!" : "Note is Unpinned";
    return res.status(200).json({ message: msg });
  } catch (error) {
    return res
      .status(400)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

export const searchNote = async (req, res) => {
  try {
    const searchQuery = req.query?.search;
    const user = req.user;
    if (!searchQuery) {
      return res.status(404).json({ message: "Search query required" });
    }

    const matchingNotes = await Notes.find({
      userId: user._id,
      $or: [
        { title: new RegExp(searchQuery, "i") },
        { content: new RegExp(searchQuery, "i") },
      ],
    });
    if (!matchingNotes) {
      return res.status(404).json({ message: "Note Not Found !!!!" });
    }
    return res.status(200).json(matchingNotes);
  } catch (error) {
    return res
      .status(400)
      .json({ message: error?.message || "Internal Server Error" });
  }
};

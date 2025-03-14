import express from "express";
import {
  AddNewNote,
  deleteNote,
  getAllNotes,
  searchNote,
  toggleIsPinned,
  updateNote,
} from "../controllers/notesController.js";
import { authentication } from "../middleware/authentication.js";

const notesRoute = express.Router();

notesRoute
  .route("/")
  .post(authentication, AddNewNote)
  .get(authentication, getAllNotes);
notesRoute
  .route("/:noteId")
  .put(authentication, updateNote)
  .delete(authentication, deleteNote);

notesRoute.route("/:noteId/pin").put(authentication, toggleIsPinned);
notesRoute.route("/search").get(authentication, searchNote);
export default notesRoute;

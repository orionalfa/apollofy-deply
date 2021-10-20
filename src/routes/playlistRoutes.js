const Router = require("express").Router;
const playlistRouter = Router();
const { playlistController } = require("../controllers");
const { authMiddleware } = require("../middlewares");

//end point routes:
//POST
playlistRouter.post(
  "/create-playlist",
  authMiddleware,
  playlistController.createPlaylist,
);

//PATCH
playlistRouter.patch(
  "/update-playlist/:id",
  authMiddleware,
  playlistController.updatePlaylistById,
);
playlistRouter.patch(
  "/add-playlist-track/",
  authMiddleware,
  playlistController.addTrackToPlaylist,
);
playlistRouter.patch(
  "/delete-playlist-track/:playlistId",
  authMiddleware,
  playlistController.deleteTrackFromPlaylist,
);
playlistRouter.patch(
  "/handle-playlist-like",
  authMiddleware,
  playlistController.handlePlaylistLike,
);
playlistRouter.patch(
  "/set-playlist-genres/:id",
  authMiddleware,
  playlistController.setPlaylistGenres,
);

//DELETE
playlistRouter.delete(
  "/delete-playlist/:id",
  authMiddleware,
  playlistController.deletePlaylistById,
);

//GET
playlistRouter.get("/", authMiddleware, playlistController.getAllPlaylists);
playlistRouter.get(
  "/get-playlist/:id",
  authMiddleware,
  playlistController.getPlaylistById,
);
playlistRouter.get(
  "/get-playlist-by-title/:title",
  authMiddleware,
  playlistController.getPlaylistByTitle,
);
playlistRouter.get(
  "/get-playlist-by-owner/:username",
  authMiddleware,
  playlistController.getPlaylistsByUsername,
);
playlistRouter.get(
  "/get-playlist-genres/:id",
  authMiddleware,
  playlistController.getPlaylistGenres,
);
playlistRouter.get(
  "/get-playlist-by-track/:title",
  authMiddleware,
  playlistController.getPlayListsByTrackTitle,
);
playlistRouter.get(
  "/get-playlist-by-genre/:genre",
  authMiddleware,
  playlistController.getPlayListsByGenre,
);
playlistRouter.get(
  "/get-playlist/:id/liked/:userId",
  authMiddleware,
  playlistController.isLikedByUser,
);
playlistRouter.get(
  "/get-most-liked",
  authMiddleware,
  playlistController.getMostLiked,
);

//exports
module.exports = playlistRouter;

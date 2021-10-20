const Router = require("express").Router;
const trackRouter = Router();
const { trackController } = require("../controllers");
const { authMiddleware } = require("../middlewares");

//end points routes:
//POST
trackRouter.post("/upload-track", authMiddleware, trackController.uploadTrack);

//PATCH
trackRouter.patch(
  "/update-track/:id",
  authMiddleware,
  trackController.updateTrack,
);
trackRouter.patch(
  "/handle-track-like/",
  authMiddleware,
  trackController.handleTrackLike,
);
trackRouter.patch(
  "/increment-total-plays/:id",
  authMiddleware,
  trackController.incrementTotalPlays,
);

//DELETE
trackRouter.delete(
  "/delete-track/:id",
  authMiddleware,
  trackController.deleteTrack,
);

//GET
trackRouter.get("/", authMiddleware, trackController.getAllTracks);
trackRouter.get("/get-track/:id", 
authMiddleware, 
trackController.getTrackById);
trackRouter.get(
  "/get-track-by-title/:title",
  authMiddleware,
  trackController.getTracksByTitle,
);
trackRouter.get(
  "/get-track-by-author/:author",
  authMiddleware,
  trackController.getTracksByAuthor,
);
trackRouter.get(
  "/get-track-by-album/:album",
  authMiddleware,
  trackController.getTracksByAlbum,
);
trackRouter.get(
  "/get-track-by-genre/:genre",
  authMiddleware,
  trackController.getTracksByGenre,
);
trackRouter.get(
  "/get-track/:id/liked",
  authMiddleware,
  trackController.isLikedByUser,
);
trackRouter.get(
  "/get-track/last-updated",
  authMiddleware,
  trackController.isLikedByUser,
);
trackRouter.get(
  "/get-most-played",
  authMiddleware,
  trackController.getMostPlayed,
);
trackRouter.get(
  "/get-most-liked",
  authMiddleware,
  trackController.getMostLiked,
);

module.exports = trackRouter;

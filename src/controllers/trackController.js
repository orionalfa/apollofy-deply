const { Tracks, Users, Playlists } = require("../models");

//POST
async function uploadTrack(req, res) {
  const { owner } = req.body;
  try {
    //Creating new track
    const { _id } = await Tracks.create(req.body);
    //Finding the user to update myTracks property and saving the document
    const userFound = await Users.findById(owner);
    userFound.myTracks.push(_id);
    await userFound.save();
    //Returning statuts after track upload and user document update
    return res.status(200).send({
      message: "Track created very successfully",
      data: {
        trackId: _id,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      error: error.message,
    });
  }
}

//PATCH
async function updateTrack(req, res) {
  const { id } = req.params;
  try {
    const dbResponse = await Tracks.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!dbResponse) {
      return res.status(400).send({
        data: null,
        error: "Track ID doesn't exist",
      });
    } else {
      res.status(200).send({
        message: "Track updated successfully",
        updatedTrack: dbResponse,
      });
    }
  } catch (error) {
    res.status(500).send({
      data: req.params.id,
      error: error.message,
    });
  }
}

async function handleTrackLike(req, res) {
  const { trackId, userId } = req.body;
  let messageResponse = "";
  try {
    // Collect both documents: trackDoc and userDoc by id's
    const trackDoc = await Tracks.findById(trackId);
    const userDoc = await Users.findById(userId);

    // Check if the like is registered in both docs
    const userIndex = trackDoc.totalLikes.indexOf(userId);
    const trackIndex = userDoc.favTracks.indexOf(trackId);

    // Do handling action
    if (userIndex >= 0 && trackIndex >= 0) {
      messageResponse = "Track like removed";
      trackDoc.totalLikes.splice(userIndex, 1);
      userDoc.favTracks.splice(trackIndex, 1);
    } else {
      messageResponse = "Track like added";
      trackDoc.totalLikes.push(userId);
      userDoc.favTracks.push(trackId);
    }

    // Update the docs
    await trackDoc.save();
    await userDoc.save();

    return res.status(200).send({
      message: messageResponse,
      trackId: trackId,
      userId: userId,
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function incrementTotalPlays(req, res) {
  const { id: trackId } = req.params;
  console.log(trackId);
  try {
    const trackDoc = await Tracks.findById(trackId);
    trackDoc.totalPlays += 1;
    trackDoc.save();
    return res.status(200).send({
      message: "Track total plays incremented",
      trackId: trackId,
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
}

//DELETE
async function deleteTrack(req, res) {
  const { id } = req.params;
  try {
    //Deleting existing track
    const { owner } = await Tracks.findByIdAndRemove(id);
    //Finding the owner user to update myTracks property and saving the document
    const userFound = await Users.findById(owner);
    const trackToRemove = userFound.myTracks.indexOf(id);
    userFound.myTracks.splice(trackToRemove, 1);
    await userFound.save();
    //Finding all user documents to update their favTracks and trackHistory properties
    //and saving them
    const users = await Users.find({});
    for (const user of users) {
      userFavTrackToRemove = user.favTracks.indexOf(id);
      if (userFavTrackToRemove >= 0) {
        user.favTracks.splice(userFavTrackToRemove, 1);
        await user.save();
      }
      userHistoryTrackToRemove = user.trackHistory.indexOf(id);
      if (userHistoryTrackToRemove >= 0) {
        user.trackHistory.splice(userHistoryTrackToRemove, 1);
        await user.save();
      }
    }
    //Finding the playlist documents to update their tracks property and saving them
    const playlists = await Playlists.find({});
    for (const playlist of playlists) {
      let playlistTrackToRemove = playlist.tracks.indexOf(id);
      if (playlistTrackToRemove >= 0) {
        playlist.tracks.splice(playlistTrackToRemove, 1);
        await playlist.save();
      }
    }
    //Returning statuts after track delete and user document update
    return res.status(200).send({
      message: "Track deleted very successfully",
      data: {
        trackId: id,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      data: req.params.id,
      error: error.message,
    });
  }
}

//GET
async function getAllTracks(req, res) {
  //Receive the limitation by req.body, by default 20
  const { limit = 31 } = req.body;
  try {
    const tracks = await Tracks.find({}).sort({ createdAt: -1 }).limit(limit);
    return res.status(200).send({
      tracksSize: limit,
      tracks: tracks,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function getTrackById(req, res) {
  const { id } = req.params;
  try {
    const foundTrack = await Tracks.findOne({
      _id: id,
    });
    return res.status(200).send({
      message: "Track found",
      currentTrack: foundTrack,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      data: req.params.id,
      error: error.message,
    });
  }
}

// Filter function for string type filters
function filterTracks(allTracks, stringFilter, filter) {
  //Turn stringFilter criteria to lowercase
  //and initialize filtered tracks
  const lwcStringFilter = stringFilter.toLowerCase();
  let filteredTracks = [];

  //Check if filter is contained inside allTracks
  //and adding it to filtered tracks
  for (const track of allTracks) {
    let trackDocFilter = track[filter].toLowerCase();
    if (trackDocFilter.includes(lwcStringFilter)) {
      filteredTracks.push(track);
    }
  }
  //Return filtered tracks
  return filteredTracks;
}

async function getTracksByTitle(req, res) {
  const { title } = req.params;
  try {
    //Collect all tracks and filter them by title
    const allTracks = await Tracks.find({});
    let tracksToReturn = filterTracks(allTracks, title, "title");

    //Return tracks found
    return res.status(200).send({
      message: "Tracks found",
      tracks: tracksToReturn,
    });
  } catch (error) {
    return res.status(500).send({
      data: title,
      error: error.message,
    });
  }
}

async function getTracksByAuthor(req, res) {
  const { author } = req.params;
  console.log(author);
  try {
    //Collect all tracks and filter them by author
    const allTracks = await Tracks.find({});
    let tracksToReturn = filterTracks(allTracks, author, "author");

    //Return tracks found
    return res.status(200).send({
      message: "Tracks found",
      tracks: tracksToReturn,
    });
  } catch (error) {
    return res.status(500).send({
      data: author,
      error: error.message,
    });
  }
}

async function getTracksByAlbum(req, res) {
  const { album } = req.params;
  try {
    //Collect all tracks and filter them by album
    const allTracks = await Tracks.find({});
    let tracksToReturn = filterTracks(allTracks, album, "album");

    //Return tracks found
    return res.status(200).send({
      message: "Tracks found",
      tracks: tracksToReturn,
    });
  } catch (error) {
    return res.status(500).send({
      data: album,
      error: error.message,
    });
  }
}
async function getTracksByReleaseYear(req, res) {}

async function getTracksByGenre(req, res) {
  const { genre } = req.params;
  try {
    //Collect all tracks and filter them by genre
    const allTracks = await Tracks.find({});
    let tracksToReturn = filterTracks(allTracks, genre, "genre");

    //Return tracks found
    return res.status(200).send({
      message: "Tracks found",
      tracks: tracksToReturn,
    });
  } catch (error) {
    return res.status(500).send({
      data: genre,
      error: error.message,
    });
  }
}

async function isLikedByUser(req, res) {
  const { id: trackId } = req.params;
  const { userId } = req.body;

  try {
    const trackDoc = await Tracks.findById(trackId);
    const userInLikesArray = trackDoc.totalLikes.indexOf(userId);

    if (userInLikesArray >= 0) {
      return res.status(200).send({
        message: `User: ${userId} likes track: ${trackId}`,
        isLiked: true,
      });
    } else {
      return res.status(200).send({
        message: `User: ${userId} doesn't like track: ${trackId}`,
        isLiked: false,
      });
    }
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function getMostPlayed(req, res) {
  //Receive the limitation by req.body, by default 20
  const { limit = 5 } = req.body;
  try {
    // const tracks = await Tracks.find({}).sort({ totalPlays: -1 }).limit(limit);
    const tracks = await Tracks.find({}).sort({ totalPlays: -1 });
    return res.status(200).send({
      tracksSize: limit,
      tracks: tracks,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function getMostLiked(req, res) {
  //Receive the limitation by req.body, by default 20
  const { limit = 14 } = req.body;
  try {
    const tracks = await Tracks.find({}).sort({ totalLikes: -1 }).limit(limit);
    return res.status(200).send({
      tracksSize: limit,
      tracks: tracks,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      error: error.message,
    });
  }
}

module.exports = {
  uploadTrack: uploadTrack,
  updateTrack: updateTrack,
  handleTrackLike: handleTrackLike,
  incrementTotalPlays: incrementTotalPlays,
  deleteTrack: deleteTrack,
  getAllTracks: getAllTracks,
  getTrackById: getTrackById,
  getTracksByTitle: getTracksByTitle,
  getTracksByAuthor: getTracksByAuthor,
  getTracksByAlbum: getTracksByAlbum,
  getTracksByReleaseYear: getTracksByReleaseYear,
  getTracksByGenre: getTracksByGenre,
  isLikedByUser: isLikedByUser,
  getMostPlayed: getMostPlayed,
  getMostLiked: getMostLiked,
};

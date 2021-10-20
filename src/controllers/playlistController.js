// imports
const { Users, Playlists } = require("../models");

// functions

//POST
async function createPlaylist(req, res) {
  const { title, owner, ...bodyReq } = req.body;
  try {
    const foundPlaylist = await Playlists.findOne({ title: title });
    if (!foundPlaylist) {
      //Create playlist
      const { _id } = await Playlists.create({
        title: title,
        owner: owner,
        ...bodyReq,
      });

      //Finding the user to update myPlaylists property and saving the document
      const userFound = await Users.findById(owner);
      userFound.myPlaylists.push(_id);
      await userFound.save();

      //Returning status after playlist creation and user document update
      return res.status(200).send({
        message: "Playlist created very successfully",
        playlistId: _id,
      });
    } else {
      return res.status(201).send({
        message: "This playlist already exists",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      error: error.message,
    });
  }
}

//UPDATE
async function updatePlaylistById(req, res) {
  const { id } = req.params;
  try {
    const dbResponse = await Playlists.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!dbResponse) {
      return res.status(400).send({
        data: null,
        error: "Playlist ID doesn't exist",
      });
    } else {
      return res.status(200).send({
        message: "Playlist updated successfully",
        updatedPlaylist: dbResponse,
      });
    }
  } catch (error) {
    return res.status(500).send({
      data: req.params.id,
      error: error.message,
    });
  }
}

async function handlePlaylistLike(req, res) {
  const { playlistId, userId } = req.body;
  let messageResponse = "";
  try {
    // Collect both documents: playListDoc and userDoc by id's
    const playListDoc = await Playlists.findById(playlistId);
    const userDoc = await Users.findById(userId);

    // Check if the like is registered in both documents
    const userIndex = playListDoc.totalLikes.indexOf(userId);
    const playlistIndex = userDoc.favPlaylists.indexOf(playlistId);

    // Do handling action
    if (userIndex >= 0 && playlistIndex >= 0) {
      messageResponse = "Playlist like removed";
      playListDoc.totalLikes.splice(userIndex, 1);
      userDoc.favPlaylists.splice(playlistIndex, 1);
    } else {
      messageResponse = "Playlist like added";
      playListDoc.totalLikes.push(userId);
      userDoc.favPlaylists.push(playlistId);
    }

    // Update the documents
    await playListDoc.save();
    await userDoc.save();

    return res.status(200).send({
      message: messageResponse,
      playlistId: playlistId,
      userId: userId,
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function addTrackToPlaylist(req, res) {
  console.log(" req.body", req.body);

  const { title, trackId } = req.body;
  let messageResponse = "Track already in playlist";
  try {
    //Collect playlist document
    const playlistDoc = await Playlists.findOne({ title: title });
    const trackContainedIndex = playlistDoc.tracks.indexOf(trackId);

    //Checking if index exists and if not, adding it to
    //the playlist and updating the playlist document
    if (trackContainedIndex === -1) {
      messageResponse = "Track added successfully";
      playlistDoc.tracks.push(trackId);
      playlistDoc.save();
    }
    return res.status(200).send({
      messageResponse: messageResponse,
      tracks: playlistDoc.tracks,
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function deleteTrackFromPlaylist(req, res) {
  const { playlistId } = req.params;
  const { trackId } = req.body;
  let messageResponse = "Track not found";
  try {
    //Collect playlist document and track to delete index
    const playlistDoc = await Playlists.findOne({ _id: playlistId });
    const trackIndexToDelete = playlistDoc.tracks.indexOf(trackId);

    //Checking if index exists, removing it from playlist and updating playlistDoc
    if (trackIndexToDelete >= 0) {
      messageResponse = "Track removed";
      playlistDoc.tracks.splice(trackIndexToDelete, 1);
      playlistDoc.save();
    }
    return res.status(200).send({
      message: messageResponse,
      trackId: trackId,
      playListId: playlistId,
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function setPlaylistGenres(req, res) {
  const { id } = req.params;
  try {
    //Collect playlist document, populate its tracks
    //and initialize playlist genres array
    const playlistDoc = await Playlists.findById({ _id: id }).populate(
      "tracks",
    );
    const playlistTracks = playlistDoc.tracks;
    let playlistGenres = [];

    //Check if genres existed and add them
    //to playlistGenres array if they didn't
    for (const track of playlistTracks) {
      let trackGenre = track.genre;
      let genreIndexCheck = playlistGenres.indexOf(trackGenre);
      if (genreIndexCheck === -1 && trackGenre !== "--") {
        playlistGenres.push(trackGenre);
      }
    }

    //Update playlist genres and playlistDoc
    playlistDoc.genres = playlistGenres;
    playlistDoc.save();

    //Return genres found
    return res.status(200).send({
      message: "Genres set",
      playlistGenres: playlistDoc.genres,
    });
  } catch (error) {
    return res.status(500).send({
      data: id,
      error: error.message,
    });
  }
}

//DELETE
async function deletePlaylistById(req, res) {
  const { id } = req.params;
  try {
    //Deleting existing playlist
    const { owner } = await Playlists.findByIdAndDelete(id);
    //Finding the user to update myPlaylists property and saving the document
    const userFound = await Users.findById(owner);
    const playlistToRemove = userFound.myPlaylists.indexOf(id);
    userFound.myPlaylists.splice(playlistToRemove, 1);
    await userFound.save();
    //Finding all user documents to update their favPlaylists property and saving them
    const users = await Users.find({});
    for (const user of users) {
      userFavPlaylistToRemove = user.favPlaylists.indexOf(id);
      if (userFavPlaylistToRemove >= 0) {
        user.favPlaylists.splice(userFavPlaylistToRemove, 1);
        await user.save();
      }
    }

    //Returning statuts after playlist delete and user document update
    return res.status(200).send({
      message: "Playlist deleted very successfully",
      data: {
        playlistId: id,
      },
    });
  } catch (error) {
    return res.status(500).send({
      data: req.params.id,
      error: error.message,
    });
  }
}

//GET
async function getAllPlaylists(req, res) {
  //Receive the limitation by req.body, by default 20
  const { limit = 20 } = req.body;
  try {
    const playlists = await Playlists.find({})
      .populate("tracks")
      .populate("owner")
      .sort({ createdAt: -1 })
      .limit(limit);
    return res.status(200).send({
      playlistsSize: limit,
      playlists: playlists,
    });
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function getPlaylistById(req, res) {
  const { id } = req.params;

  try {
    const foundPlaylist = await Playlists.findOne({
      _id: id,
    })
      .populate("owner")
      .populate("tracks");
    return res.status(200).send({
      message: "Playlist found",
      currentPlaylist: foundPlaylist,
    });
  } catch (error) {
    return res.status(500).send({
      data: req.params.id,
      error: error.message,
    });
  }
}

// Filter function for string type filters
function filterPlaylists(allPlaylists, stringFilter, filter) {
  //Turn stringFilter criteria to lowercase
  //and initialize filtered playlists
  const lwcStringFilter = stringFilter.toLowerCase();
  let filteredPlaylists = [];

  //Check if filter is contained inside allPlaylists and
  //adding it to filteredPlaylists
  for (const playlist of allPlaylists) {
    let playlistDocFilter = playlist[filter].toLowerCase();
    if (playlistDocFilter.includes(lwcStringFilter)) {
      filteredPlaylists.push(playlist);
    }
  }

  //Return filtered playlists
  return filteredPlaylists;
}

async function getPlaylistByTitle(req, res) {
  const { title } = req.params;
  try {
    //Collect all playlists and filter them by title
    const allPlaylists = await Playlists.find({})
      .populate("tracks")
      .populate("owner");
    const playlistsToReturn = filterPlaylists(allPlaylists, title, "title");

    //Return found playlists
    return res.status(200).send({
      message: "Playlists found",
      playlists: playlistsToReturn,
    });
  } catch (error) {
    return res.status(500).send({
      data: title,
      error: error.message,
    });
  }
}

async function getPlaylistsByUsername(req, res) {
  const { username } = req.params;
  try {
    //Collect all playlists
    const allPlaylists = await Playlists.find({})
      .populate("tracks")
      .populate("owner");

    //Turn username to lowercase
    //and initialize playlists to return 
    const lwcUsername = username.toLowerCase();
    let playlistsToReturn = [];

    //Check if lwcUsername is contained inside allPlaylists and
    //adding it to playlistsToReturn
    for (const playlist of allPlaylists) {
      let playlistDocFilter = playlist["owner"]["username"].toLowerCase();
      console.log(playlistDocFilter);
      if (playlistDocFilter.includes(lwcUsername)) {
        playlistsToReturn.push(playlist);
      }
    }

    //Return found playlists
    return res.status(200).send({
      message: "Playlists found",
      playlists: playlistsToReturn,
    });
  } catch (error) {
    return res.status(500).send({
      data: title,
      error: error.message,
    });
  }
}

async function getPlayListsByTrackTitle(req, res) {
  const { title } = req.params;
  try {
    //Collect all playlists and populate tracks.
    //Initialize playlists to return
    const allPlaylists = await Playlists.find({})
      .populate("tracks")
      .populate("owner");
    let playlistsToReturn = [];

    //Add playlists that contain the specific track
    //to playlistsToReturn
    for (const playlist of allPlaylists) {
      for (const track of playlist.tracks) {
        if (track.title === title) {
          playlistsToReturn.push(playlist);
          break;
        }
      }
    }
    //Return found playlists
    return res.status(200).send({
      message: "Found playlists",
      playlists: playlistsToReturn,
    });
  } catch (error) {
    return res.status(500).send({
      data: title,
      error: error.message,
    });
  }
}

async function getPlayListsByGenre(req, res) {
  const { genre } = req.params;
  try {
    //Collect all playlists and initialize playlists to return
    const allPlaylists = await Playlists.find({})
      .populate("tracks")
      .populate("owner");
    let playlistsToReturn = [];

    //Add playlists that contain the specific track
    //to playlistsToReturn
    for (const playlist of allPlaylists) {
      if (playlist.genres.indexOf(genre) > -1) {
        playlistsToReturn.push(playlist);
      }
    }
    //Return found playlists
    return res.status(200).send({
      message: "Found playlists",
      playlists: playlistsToReturn,
    });
  } catch (error) {
    return res.status(500).send({
      data: genre,
      error: error.message,
    });
  }
}

async function isLikedByUser(req, res) {
  const { id: playlistId, userId } = req.params;

  try {
    const playlistDoc = await Playlists.findById(playlistId);
    const userInLikesArray = playlistDoc.totalLikes.indexOf(userId);

    if (userInLikesArray >= 0) {
      return res.status(200).send({
        message: `User: ${userId} likes playlist: ${playlistId}`,
        isLiked: true,
      });
    } else {
      return res.status(200).send({
        message: `User: ${userId} doesn't like playlist: ${playlistId}`,
        isLiked: false,
      });
    }
  } catch (error) {
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function getMostLiked(req, res) {
  //Receive the limitation by req.body, by default 20
  const { limit = 6 } = req.body;
  try {
    const playlists = await Playlists.find({})
      .populate("tracks")
      .populate("owner")
      .sort({ totalLikes: -1 })
      .limit(limit);
    return res.status(200).send({
      playlistsSize: limit,
      playlists: playlists,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({
      error: error.message,
    });
  }
}

async function getPlaylistGenres(req, res) {
  const { id } = req.params;
  try {
    //Collect playlist document and initialize playlist genres
    const playListDoc = await Playlists.findById({ _id: id });
    let playlistGenres = playListDoc.genres;

    //Return genres found
    return res.status(200).send({
      message: "Genres found",
      playlistGenres: playlistGenres,
    });
  } catch (error) {
    return res.status(500).send({
      data: id,
      error: error.message,
    });
  }
}

//exports
module.exports = {
  createPlaylist: createPlaylist,
  updatePlaylistById: updatePlaylistById,
  handlePlaylistLike: handlePlaylistLike,
  addTrackToPlaylist: addTrackToPlaylist,
  deleteTrackFromPlaylist: deleteTrackFromPlaylist,
  setPlaylistGenres: setPlaylistGenres,
  deletePlaylistById: deletePlaylistById,
  getAllPlaylists: getAllPlaylists,
  getPlaylistById: getPlaylistById,
  getPlaylistByTitle: getPlaylistByTitle,
  getPlaylistsByUsername: getPlaylistsByUsername,
  getPlaylistGenres: getPlaylistGenres,
  getPlayListsByTrackTitle: getPlayListsByTrackTitle,
  getPlayListsByGenre: getPlayListsByGenre,
  isLikedByUser: isLikedByUser,
  getMostLiked: getMostLiked,
};

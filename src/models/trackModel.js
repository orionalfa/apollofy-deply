const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const TrackSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      required: [true, "Please input an owner"],
      ref: "users",
    },
    totalPlays: {
      type: Number,
      default: 0,
    },
    totalLikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    author: {
      type: String,
      default: "",
    },
    album: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      required: [true, "Please input a title"],
    },
    releaseYear: {
      type: String,
      default: "",
    },
    urlCover: {
      type: String,
      default: "",
    },
    urlTrack: {
      type: String,
      required: [true, "Please input a song URL"],
    },
    genre: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Tracks = mongoose.model("tracks", TrackSchema);

module.exports = Tracks;

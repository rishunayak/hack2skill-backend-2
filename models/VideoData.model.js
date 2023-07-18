const mongoose = require("mongoose");

const videoDataSchema = mongoose.Schema({
  title: String,
  description: String,
  publishedDate: Date,
  thumbnails: Object,
});

const VideoData = mongoose.model("Video", videoDataSchema);

module.exports = VideoData
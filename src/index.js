"use strict";
const path = require("path");
module.exports = {
    "Readable": require(path.join(__dirname, "readable")),
    "BlockingReadable": require(path.join(__dirname, "blocking-readable")),
    "Writable": require(path.join(__dirname, "writable")),
    "Fifo": require(path.join(__dirname, "fifo"))
};

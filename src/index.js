"use strict";
const path = require("path");
module.exports = {
    "Readable": require(path.join(__dirname, "readable")),
    "Writable": require(path.join(__dirname, "writable"))
};

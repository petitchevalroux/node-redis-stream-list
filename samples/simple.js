"use strict";
const path = require("path"),
    {Readable, Writable} = require(path.join(__dirname, "..")),
    {PassThrough} = require("stream"),
    redis = require("redis"),
    redisClient = redis.createClient(),
    process = require("process");

const writeStream = new Writable({
    "redisClient": redisClient,
    "listKey": "sample-list-key",
    "objectMode": true
});
const input = new PassThrough({"objectMode": true});
input.write({"data": "data1"});
input.write({"data": "data1"});
input.push(null);
input.pipe(writeStream).on("finish", () => {
    process.stdout.write("write finish\n");
    const readStream = new Readable({
        "redisClient": redisClient,
        "objectMode": true,
        "listKey": "sample-list-key"
    });
    readStream.on("data", (data) => {
        process.stdout.write("data: " + JSON.stringify(data) + "\n");
    });
    readStream.on("end", () => {
        process.stdout.write("read end\n");
        redisClient.quit();
    });
});
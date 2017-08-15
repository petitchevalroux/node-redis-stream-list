"use strict";
const redis = require("redis"),
    assert = require("assert"),
    client = redis.createClient(),
    {
        PassThrough
    } = require("stream"),
    path = require("path"),
    {
        Fifo
    } = require(path.join(__dirname, ".."));

// Client.duplicate is not available in redis-mock
if (!client.duplicate) {
    client.duplicate = (cb) => {
        const client = redis.createClient();
        if (!cb) {
            return client;
        }
        cb(null, client);
    };
}

describe("Fifo stream", () => {
    const input = new PassThrough(),
        readData = [];
    const fifo = new Fifo({
        redisClient: client,
        listKey: "fifo",
        timeout: 1
    });
    fifo.on("data", (data) => {
        readData.push(data.toString());
    });
    it("emit finish event when write end", (done) => {
        fifo.on("finish", () => {
            done();
        });
    });
    it("emit written data", (done) => {
        fifo.on("end", () => {
            assert.deepEqual(readData, ["1", "2", "3"]);
            done();
        });
    });
    input.write("1");
    input.write("2");
    input.write("3");
    input.end();
    input.pipe(fifo);
});

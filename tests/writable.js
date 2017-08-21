"use strict";
const redis = require("redis-mock"),
    assert = require("assert"),
    {
        PassThrough
    } = require("stream"),
    client = redis.createClient(),
    path = require("path"),
    {
        Writable
    } = require(path.join(__dirname, "..")),
    sinon = require("sinon");
describe("Writable stream", () => {
    let toRestore = [];
    beforeEach(() => {
        toRestore.forEach((restore) => {
            restore.restore();
        });
    });

    it("rpush string data to list in non objectMode", (done) => {
        const rPushSpy = sinon.spy(client, "rpush");
        toRestore.push(rPushSpy);
        const writable = new Writable({
            "redisClient": client,
            "listKey": "list"
        });
        const input = new PassThrough();
        input.pipe(writable)
            .on("finish", () => {
                assert(rPushSpy.calledWith("list",
                    "element 1"));
                assert(rPushSpy.calledWith("list",
                    "element 2"));
                done();
            });
        input.write("element 1");
        input.write("element 2");
        input.push(null);
    });

    it("rpush object data to list", (done) => {
        const rPushSpy = sinon.spy(client, "rpush");
        toRestore.push(rPushSpy);
        const writable = new Writable({
            "redisClient": client,
            "listKey": "list",
            "objectMode": true
        });
        const input = new PassThrough({
            objectMode: true
        });
        input.pipe(writable)
            .on("finish", () => {
                assert(rPushSpy.calledWith("list",
                    "{\"prop\":\"element 1\"}"));
                assert(rPushSpy.calledWith("list",
                    "{\"prop\":\"element 2\"}"));
                done();
            });
        input.write({
            "prop": "element 1"
        });
        input.write({
            "prop": "element 2"
        });
        input.push(null);
    });

    it("rpush string data to list in objectMode", (done) => {
        const rPushSpy = sinon.spy(client, "rpush");
        toRestore.push(rPushSpy);
        const writable = new Writable({
            "redisClient": client,
            "listKey": "list",
            "objectMode": true
        });
        const input = new PassThrough({
            objectMode: true
        });
        input.pipe(writable)
            .on("finish", () => {
                assert(rPushSpy.calledWith("list",
                    JSON.stringify("element 1")));
                assert(rPushSpy.calledWith("list",
                    JSON.stringify("element 2")));
                done();
            });
        input.write("element 1");
        input.write("element 2");
        input.push(null);
    });
});

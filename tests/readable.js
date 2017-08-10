"use strict";
const redis = require("redis-mock"),
    assert = require("assert"),
    client = redis.createClient(),
    path = require("path"),
    {
        Readable
    } = require(path.join(__dirname, "..")),
    sinon = require("sinon");

describe("Readable stream", () => {
    let toRestore = [];
    beforeEach(() => {
        toRestore.forEach((restore) => {
            restore.restore();
        });
    });

    it("pop buffer data from list in non objectMode", (done) => {
        const inData = ["data 1", "data 2"];
        const outData = [];
        const lPopSpy = sinon.stub(client, "lpop")
            .callsFake((key, callback) => {
                if (inData.length < 1) {
                    callback(null, null);
                } else {
                    callback(null, inData.shift());
                }
            });
        toRestore.push(lPopSpy);

        const readable = new Readable({
            "redisClient": client,
            "listKey": "list"
        });
        readable
            .on("data", (data) => {
                outData.push(data);
            })
            .on("end", () => {
                assert.equal(outData.length, 2);
                assert.deepEqual(outData.map((data) => {
                    return data.toString();
                }), ["data 1", "data 2"]);
                done();
            });

    });

    it("pop string data from list in objectMode", (done) => {
        const inData = ["data 3", "data 4"];
        const outData = [];
        const lPopSpy = sinon.stub(client, "lpop")
            .callsFake((key, callback) => {
                if (inData.length < 1) {
                    callback(null, null);
                } else {
                    callback(null, inData.shift());
                }
            });
        toRestore.push(lPopSpy);

        const readable = new Readable({
            "redisClient": client,
            "listKey": "list",
            "objectMode": true
        });
        readable
            .on("data", (data) => {
                outData.push(data);
            })
            .on("end", () => {
                assert.equal(outData.length, 2);
                assert.deepEqual(outData, ["data 3",
                    "data 4"
                ]);
                done();
            });

    });
});

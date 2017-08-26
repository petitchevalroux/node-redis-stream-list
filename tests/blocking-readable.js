"use strict";
const redis = require("redis-mock"),
    assert = require("assert"),
    path = require("path"),
    {
        BlockingReadable
    } = require(path.join(__dirname, "..")),
    sinon = require("sinon");

describe("Blocking readable stream", () => {
    let toRestore = [];
    beforeEach(() => {
        toRestore.forEach((restore) => {
            restore.restore();
        });
    });

    it("Does not throw an error when using prefixed client", (done) => {
        const inData = [
                ["prefix:blocking-list", "value"]
            ],
            options = {
                "prefix": "prefix:"
            },
            outData = [],
            client = redis.createClient(options);
        // Redis mock does not save client options
        client.options = options;
        toRestore.push(sinon.stub(client, "blpop")
            .callsFake((key, timeout, callback) => {
                if (inData.length < 1) {
                    callback(null, null);
                } else {
                    callback(null, inData.shift());
                }
            }));

        const readable = new BlockingReadable({
            "redisClient": client,
            "listKey": "blocking-list"
        });
        readable
            .on("data", (data) => {
                outData.push(data);
            })
            .on("end", () => {
                assert.equal(outData.length, 1);
                assert.deepEqual(outData.map((data) => {
                    return data.toString();
                }), ["value"]);
                done();
            });

    });
});

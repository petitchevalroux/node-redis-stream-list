"use strict";
const {
    Writable
} = require("stream");

class RedisWritableListStream extends Writable {
    constructor(options) {
        super(options);
        this.objectMode = options.objectMode;
        this.redisClient = options.redisClient;
        this.listKey = options.listKey;
    }
    _write(chunk, encoding, callback) {
        if (Buffer.isBuffer(chunk)) {
            chunk = chunk.toString();
        } else if (this.objectMode || typeof(chunk) === "object") {
            chunk = JSON.stringify(chunk);
        }
        this.redisClient.rpush(this.listKey, chunk, callback);
    }
}

module.exports = RedisWritableListStream;

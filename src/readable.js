"use strict";
const {
    Readable
} = require("stream");

class RedisReadableListStream extends Readable {
    constructor(options) {
        options.objectMode = options.objectMode || false;
        super(options);
        this.redisClient = options.redisClient;
        this.objectMode = options.objectMode;
        this.listKey = options.listKey;
    }

    pop() {
        const self = this;
        this.redisClient.lpop(this.listKey, function(err, value) {
            if (self.push(value)) {
                self.pop();
            }
        });
    }

    _read() {
        this.pop();
    }
}

module.exports = RedisReadableListStream;

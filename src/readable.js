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

    pushDataToBuffer() {
        const self = this;
        this.redisClient.lpop(this.listKey, (err, value) => {
            if (err) {
                self.emit("error", err);
                return;
            }
            if (self.push(value) && value !== null) {
                self.pushDataToBuffer();
            } else {
                delete self.buffering;
            }
        });
    }

    _read() {
        if (!this.buffering) {
            this.buffering = true;
            this.pushDataToBuffer();
        }
    }
}

module.exports = RedisReadableListStream;

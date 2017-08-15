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

    pop(callback) {
        const self = this;
        this.getRedisClient((err, client) => {
            if (err) {
                return callback(err);
            }
            client.lpop(self.listKey, callback);
        });
    }

    getRedisClient(callback) {
        callback(null, this.redisClient);
    }

    pushDataToBuffer() {
        const self = this;
        this.pop((err, value) => {
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

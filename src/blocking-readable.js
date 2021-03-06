"use strict";
const path = require("path"),
    Readable = require(path.join(__dirname, "readable.js"));
class RedisBlockingReadableListStream extends Readable {
    constructor(options) {
        super(options);
        this.timeout = options.timeout || 0;
    }

    pop(callback) {
        const self = this;
        this.getRedisClient((err, client) => {
            if (err) {
                return callback(err);
            }
            client.blpop(self.listKey, self.timeout, (err, value) => {
                if (err) {
                    return callback(err);
                }
                // value must be an array of 2 elements, first is key, second is value
                // otherwise we end the stream
                if (!value || !value.length || value.length !==
                    2) {
                    return callback(null, null);
                }
                const expectedKey = (client.options &&
                    client.options.prefix ?
                    client.options.prefix : "") + self.listKey;
                if (value[0] !== expectedKey) {
                    return callback(new Error(
                        "Wrong list name when poping element"
                    ));
                }
                self.unserializeObject(value[1], callback);
            });
        });
    }

}

module.exports = RedisBlockingReadableListStream;

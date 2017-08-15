"use strict";
const path = require("path"),
    Readable = require(path.join(__dirname, "blocking-readable.js")),
    Writable = require(path.join(__dirname, "writable.js"));

class RedisFifoListStream extends Readable {
    constructor(options) {
        super({
            timeout: options.timeout || 0,
            objectMode: options.readableObjectMode || false,
            listKey: options.listKey
        });
        this.readRedisClient = options.readRedisClient || false;
        this.writeRedisClient = options.writeRedisClient || options.redisClient;
        this.listKey = options.listKey;
        this.readableObjectMode = options.readableObjectMode || false;
        this.writable = new Writable({
            redisClient: this.writeRedisClient,
            objectMode: options.writableObjectMode || false,
            listKey: this.listKey
        });
        this.writable.on("close", () => {
            this.emit("close");
        });
        this.writable.on("drain", () => {
            this.emit("drain");
        });
        this.writable.on("error", (err) => {
            this.emit("error", err);
        });
        this.writable.on("finish", () => {
            this.emit("finish");
        });
        this.writable.on("pipe", (src) => {
            this.emit("pipe", src);
        });
        this.writable.on("unpipe", (src) => {
            this.emit("unpipe", src);
        });
    }
    end(chunk, encoding, callback) {
        return this.writable.end(chunk, encoding, callback);
    }
    write(chunk, encoding, callback) {
        return this.writable.write(chunk, encoding, callback);
    }
    cork() {
        return this.writable.cork();
    }
    uncork() {
        return this.writable.cork();
    }
    setDefaultEncoding(encoding) {
        super.setDefaultEncoding(encoding);
        this.writable.setDefaultEncoding(encoding);
    }
    destroy(error) {
        super.destroy(error);
        this.writable.destroy(error);
    }

    getRedisClient(callback) {
        if (this.readRedisClient) {
            return callback(null, this.readRedisClient);
        }
        // if any read client is given in construct we duplicate write client
        // to avoid blocking it
        const self = this;
        this.writeRedisClient.duplicate((err, client) => {
            if (err) {
                return callback(err);
            }
            self.readRedisClient = client;
            callback(null, self.readRedisClient);
        });
    }
}

module.exports = RedisFifoListStream;

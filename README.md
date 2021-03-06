# node-redis-stream-list

Node readable and writable streams for redis list

## Readable
Readable stream read all list elements using redis [lpop](https://redis.io/commands/lpop).
When there is no more elements in the list, stream emits an end event.

## Writable
Writable stream push elements at the end of the list using redis [rpush](https://redis.io/commands/rpush).
When all elements are pushed, stream emit a finish event.

## Usage
In this sample you will see how to write object and read object from a list
```javascript
const writeStream = new Writable({
    "redisClient": redisClient,
    "listKey": "sample-list-key",
    "objectMode": true
});
const input = new PassThrough({"objectMode": true});
input.write({"data": "data1"});
input.write({"data": "data1"});
input.push(null);
input.pipe(writeStream).on("finish", () => {
    process.stdout.write("write finish\n");
    const readStream = new Readable({
        "redisClient": redisClient,
        "objectMode": true,
        "listKey": "sample-list-key"
    });
    readStream.on("data", (data) => {
        process.stdout.write("data: " + JSON.stringify(data) + "\n");
    });
    readStream.on("end", () => {
        process.stdout.write("read end\n");
        redisClient.quit();
    });
});
```

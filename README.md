# PTRun

## Generating protobuf

Command used to generate client protobuf messages used for communication
between client and server. It must be re-run after every proto update:

```sh
protoc --proto_path=messages --js_out=import_style=commonjs,binary:./client/src messages/*.proto
```

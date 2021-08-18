# PTRun

## Generating protobuf

Command used to generate client protobuf messages used for communication
between client and server. It must be re-run after every proto update.

**Client**
```sh
protoc --proto_path=messages --js_out=import_style=commonjs,binary:./client/src messages/*.proto
```

**Server**
Make sure you have installed `protoc-gen-go` plugin by using:
```sh
go install google.golang.org/protobuf/cmd/protoc-gen-go
```

Then compile with:

```sh
protoc --proto_path=./messages --go_out=./ messages/*.proto
```

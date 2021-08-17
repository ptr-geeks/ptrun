# Here we download Go image & name it as builder
FROM golang:1.16-alpine AS builder

# We set our workdir
WORKDIR /app

# This is ultra necessary command...
COPY . .

# RUN echo $(ls)

# Let's build it :tada:
RUN go build -o ptrun-server ./server/cmd/ptrun-server/main.go

# -----------------------------------------------------------------------------

# Here we install latest Alpine image, that runs everything
FROM alpine:latest

# I guess, that we install certificates here...
RUN apk --no-cache add ca-certificates

# Set workdir to root
WORKDIR /root/

# Now we copy executable file from builder
COPY --from=builder /app/ptrun-server ./ptrun-server

# Here we expose 8080 to public
EXPOSE 8080

# Here we run PTRun server
CMD [ "./ptrun-server" ]
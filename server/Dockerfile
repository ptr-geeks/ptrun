# Here we download Go image & name it as builder
FROM golang:1.16 AS builder

# We set our workdir
WORKDIR /app

#RUN ls

# Copy stuff to ./
# I really don't know why, but in tutorial, it was written that way...
COPY go.mod ./
COPY cmd/ptrun-server/*.go ./

# Download all dependedncies
RUN go mod download

# Let's build it :tada:
RUN go build -o /ptrun-server

# -----------------------------------------------------------------------------

# Here we install latest alpine image, that runs everything
FROM alpine:latest AS runner

# I guess, that we install certificates here...
RUN apk --no-cache add ca-certificates

# Set workdir to root
WORKDIR /root/

# Now we copy executable file from builder
COPY --from=builder /ptrun-server ./ptrun-server

# Here we expose 8080 to public
EXPOSE 8080

# Here we run PTRun server
RUN [ "./ptrun-server"] 

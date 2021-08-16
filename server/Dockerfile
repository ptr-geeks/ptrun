# Here we download Go image
FROM golang:1.16-alpine

# We set our workdir
WORKDIR /app

# Copy stuff to ./
# I really don't know why, but in tutorial, it was written that way...
COPY go.mod ./
COPY cmd/ptrun-server/*.go ./

# Download all dependedncies
RUN go mod download

# Let's build it :tada:
RUN go build -o /ptrun-server

# Here we expose 8080 to public
EXPOSE 8080

# Here we run PTRun server
RUN [ "/ptrun-server"] 

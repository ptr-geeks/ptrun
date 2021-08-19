package ws

import (
	"net"
	"net/http"

	"github.com/ptr-geeks/ptrun/server/internal/messages"
)

//Server starts the Run connect and disconnect methods
type Server interface {
	Run()

	Connect(w http.ResponseWriter, r *http.Request) Client
	Disconnect(client Client)
	Broadcast(excludeClient int32, msg *messages.Message)
}

//Client contains all the methods we need for recognising and working with the Client
type Client interface {
	GetID() int32
	GetRemoteAddr() net.Addr

	Send(msg *messages.Message)
	Close()

	ReadPump()
	SendPump()
}

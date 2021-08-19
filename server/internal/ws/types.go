package ws

import (
	"net"
	"net/http"

	"github.com/ptr-geeks/ptrun/server/internal/messages"
)

type Server interface {
	Run()

	Connect(w http.ResponseWriter, r *http.Request) Client
	Disconnect(client Client)
}

type Client interface {
	GetID() int32
	GetRemoteAddr() net.Addr

	Send(msg *messages.Message)
	Close()

	ReadPump()
	SendPump()
}

package ws

import (
	"net"
	"net/http"
)

type Server interface {
	Run()

	Connect(w http.ResponseWriter, r *http.Request) Client
	Disconnect(client Client)
}

type Client interface {
	GetID() int32
	GetRemoteAddr() net.Addr

	Send(msg []byte)
	Close()

	ReadPump()
	SendPump()
}

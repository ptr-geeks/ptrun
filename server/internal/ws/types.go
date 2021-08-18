package ws

import (
	"net"
	"net/http"
)

type Server interface {
	Run()

	Connect(w http.ResponseWriter, r *http.Request) Client
	Disconnect(client Client)

	GetID() int
}

type Client interface {
	GetID() int32
	GetRemoteAddr() net.Addr

	Send(msg []byte)
	Close()

	ReadPump()
	SendPump()
}

type Servers interface {
	GetServerByID(ServerID int) Server
	AddServer(server Server)
	GetAll() []Server
}

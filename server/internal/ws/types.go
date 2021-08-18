package ws

import (
	"net"
	"net/http"
)

type Server interface {
	Run(game Game)

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

type Game interface {
	GetAllClients() []Client
	GetID() int
	NotifyAllClients()
	AddServer(server Server)
	AddClient(client Client)
	GetServerFromID(id int) Server
}

type Games interface {
	GetGameFromID(id int) Game
	AddGame(game Game)
	GetGames() []Game
}

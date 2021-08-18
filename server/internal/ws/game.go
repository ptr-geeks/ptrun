package ws

import (
	"math/rand"
	"time"
)

type gameImpl struct {
	id      int
	clients []Client
	servers Servers
}

func NewGame() Game {
	rand.Seed(time.Now().UnixNano())
	return &gameImpl{
		id:      rand.Int(),
		servers: NewServersList(),
	}
}

func (g *gameImpl) GetAllClients() []Client {
	return g.clients
}

func (g *gameImpl) GetID() int {
	return g.id
}

func (g *gameImpl) NotifyAllClients() {
}

func (g *gameImpl) GetServerFromID(id int) Server {
	servers := g.servers.GetAll()
	for i := 0; i < len(servers); i++ {
		if servers[i].GetID() == id {
			return servers[i]
		}
	}
	return nil
}

func (g *gameImpl) AddServer(server Server) {
	g.servers.AddServer(server)
}

func (g *gameImpl) AddClient(client Client) {
	g.clients = append(g.clients, client)
}

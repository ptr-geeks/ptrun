package ws

type serversImpl struct {
	servers []Server
}

func NewServersList() Servers {
	return &serversImpl{}
}

func (s *serversImpl) GetServerByID(serverid int) Server {
	for i := 0; i < len(s.servers); i++ {
		var server Server = s.servers[i]
		if server.GetID() == serverid {
			return s.servers[i]
		}
	}
	return nil
}

func (s *serversImpl) AddServer(server Server) {
	s.servers = append(s.servers, server)
}

func (s *serversImpl) GetAll() []Server {
	return s.servers
}

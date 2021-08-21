package ws

import (
	"net/http"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"

	"github.com/ptr-geeks/ptrun/server/internal/consts"
	"github.com/ptr-geeks/ptrun/server/internal/events"
	"github.com/ptr-geeks/ptrun/server/internal/messages"
)

var (
	socketUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		// TODO: For now we don't really check origin
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			return origin == "https://ptrun.develop.cloud.ptr.si"
		},
	}
)

// serevrImpl has data about all clients
// and sends the connect and disconnect messages
type serverImpl struct {
	logger  *zap.SugaredLogger
	clients map[int32]Client //slovar
	// Channels so we can process request async
	connect    chan connectMessage
	disconnect chan Client
	broadcast  chan broadcastMessage
}

// connectMessage is used to send the connect message
type connectMessage struct {
	conn *websocket.Conn
	done chan Client
}

type broadcastMessage struct {
	msg           *messages.Message
	excludeClient int32
}

//NewServer return all the data for the server
func NewServer(logger *zap.Logger) Server {
	return &serverImpl{
		logger:  logger.Sugar(),
		clients: make(map[int32]Client),

		// Make buffered channels
		connect:    make(chan connectMessage, consts.ChanBufferSize),
		broadcast:  make(chan broadcastMessage, consts.ChanBufferSize),
		disconnect: make(chan Client, consts.ChanBufferSize),
	}
}

//Run is used for connecting and disconnetcing clients from the server
func (s *serverImpl) Run() {
	s.logger.Debug("server started and listening for events")
	s.handleBroadcast()
	for {
		select {
		case connect := <-s.connect:
			s.logger.Infow("new connection", "remoteAddr", connect.conn.RemoteAddr())
			client := NewClient(connect.conn, s, s.logger.Desugar())
			s.clients[client.GetID()] = client

			connect.done <- client
			s.sendPlayers(client)

		case disconnect := <-s.disconnect:
			s.logger.Infow("disconnect", "id", disconnect.GetID(), "remoteAddr", disconnect.GetRemoteAddr())
			_, exists := s.clients[disconnect.GetID()]
			if exists {
				delete(s.clients, disconnect.GetID())
				disconnect.Close()
			} else {
				s.logger.Warnw("cannot find client internally", "id", disconnect.GetID(), "remoteAddr", disconnect.GetRemoteAddr())
			}

			// Notify all other players
			var playerid int32 = disconnect.GetID()
			msg := messages.Message{
				PlayerId: &playerid,
				Data: &messages.Message_Leave{
					Leave: &messages.Leave{},
				},
			}

			s.Broadcast(playerid, &msg)

		case broadcast := <-s.broadcast:
			s.logger.Debugw("Broadcasting", "id", broadcast.excludeClient)
			broadcast.msg.PlayerId = &broadcast.excludeClient
			for clientID, client := range s.clients {
				if broadcast.excludeClient == clientID {
					continue
				}

				client.Send(broadcast.msg)
			}
		}
	}
}

//Connect gives Run the data to connect the client and starts functions ReadPump and SendPump
func (s *serverImpl) Connect(w http.ResponseWriter, r *http.Request) Client {
	conn, err := socketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		s.logger.Errorw("error while upgrading connection", zap.Error(err))
		return nil
	}

	done := make(chan Client)
	s.connect <- connectMessage{conn: conn, done: done}

	client := <-done
	go client.ReadPump()
	go client.SendPump()

	return client
}

//Disconnect gives Run the data to disconnect client from the server
func (s *serverImpl) Disconnect(client Client) {
	s.disconnect <- client
}

func (s *serverImpl) Broadcast(excludeClient int32, msg *messages.Message) {
	s.broadcast <- broadcastMessage{msg: msg, excludeClient: excludeClient}
}

func (s *serverImpl) handleBroadcast() {
	err := events.Subscribe("server.broadcast", s.Broadcast)
	if err != nil {
		s.logger.Warnw("cannot read from the client")
	}
}

func (s *serverImpl) sendPlayers(client Client) {
	s.logger.Debugw("sending client existing player list", "id", client.GetID())
	for id := range s.clients {
		if client.GetID() == id {
			continue
		}

		msg := &messages.Message{
			PlayerId: &id,
			Data: &messages.Message_Join{
				Join: &messages.Join{
					Username: "",
				},
			},
		}

		client.Send(msg)
	}
}

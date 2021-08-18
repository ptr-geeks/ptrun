package ws

import (
	"net/http"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"

	"github.com/ptr-geeks/ptrun/server/internal/consts"
)

var (
	socketUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		// TODO: For now we don't really check origin
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
)

type serverImpl struct {
	logger *zap.SugaredLogger
	clients map[int32]*Client

	// Channels so we can process request async
	connect chan connectMessage
}

type connectMessage struct {
	conn *websocket.Conn
	done chan Client
}

func NewServer(logger *zap.Logger) Server {
	return &serverImpl{
		logger: logger.Sugar(),

		// Make buffered channels
		connect: make(chan connectMessage, consts.ChanBufferSize),
	}
}

func (s *serverImpl) Run() {
	s.logger.Debug("server started and listening for events")

	for {
		select {
		case connect := <-s.connect:
			s.logger.Infow("new connection", "remoteAddr", connect.conn.RemoteAddr())
			client := NewClient(connect.conn, s, s.logger.Desugar())

			connect.done <- client
		}
	}
}

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

func (s *serverImpl) Disconnect(client Client) {

}

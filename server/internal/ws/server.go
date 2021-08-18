package ws

import (
	"math/rand"
	"net/http"
	"time"

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

	// Channels so we can process request async
	connect chan connectMessage
	id      int
	gameId  int
}

type connectMessage struct {
	conn *websocket.Conn
	done chan Client
}

func NewServer(logger *zap.Logger, gameId int) Server {
	// Here we generate a new seed, so that it's more secure
	rand.Seed(time.Now().UnixNano())

	return &serverImpl{
		logger: logger.Sugar(),

		// Make buffered channels
		connect: make(chan connectMessage, consts.ChanBufferSize),
		id:      rand.Int(),
		gameId:  gameId,
	}
}

func (s *serverImpl) GetID() int {
	return s.id
}

func (s *serverImpl) Run(game Game) {
	s.logger.Debug("server started and listening for events")

	for {
		select {
		case connect := <-s.connect:
			s.logger.Infow("new connection", "remoteAddr", connect.conn.RemoteAddr())
			client := NewClient(connect.conn, s, s.logger.Desugar())
			game.AddClient(client)

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

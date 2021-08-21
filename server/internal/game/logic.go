package game

import (
	"go.uber.org/zap"

	"github.com/ptr-geeks/ptrun/server/internal/events"
	"github.com/ptr-geeks/ptrun/server/internal/messages"
)

type GameLogic struct {
	Logger *zap.SugaredLogger
}

func (logic *GameLogic) handleJoin(from int32, msg *messages.Join) {
	// TODO: Handle join message
}

func (logic *GameLogic) handleMove(from int32, msg *messages.Move) {
	// TODO: Handle move message
}

func (logic *GameLogic) handleMsg(from int32, msg *messages.Message) {
	logic.Logger.Debugw("received message", "from", from, "msg", msg)

	switch msgTyped := msg.Data.(type) {
	case *messages.Message_Join:
		logic.handleJoin(from, msgTyped.Join)
	case *messages.Message_Move:
		logic.handleMove(from, msgTyped.Move)
	default:
		logic.Logger.Warn("unknown message type")
	}
}

func (logic *GameLogic) Subscribe() {
	events.Subscribe("server.broadcast", logic.handleMsg)
}

package ws

import (
	"fmt"
	"math/rand"
	"net"
	"time"

	"github.com/gorilla/websocket"

	"google.golang.org/protobuf/proto"

	"go.uber.org/zap"

	"github.com/ptr-geeks/ptrun/server/internal/messages"
)

const (
	writeTimeout = 10 * time.Second
)

type clientImpl struct {
	id   int32
	addr net.Addr
	conn *websocket.Conn

	logger *zap.SugaredLogger

	send chan *messages.Message
}

func NewClient(conn *websocket.Conn, serv Server, logger *zap.Logger) Client {
	return &clientImpl{
		// Just randomly generate
		id:     rand.Int31(),
		addr:   conn.RemoteAddr(),
		conn:   conn,
		logger: logger.Sugar(),

		send: make(chan *messages.Message),
	}
}

func (c *clientImpl) GetID() int32 {
	return c.id
}

func (c *clientImpl) GetRemoteAddr() net.Addr {
	return c.addr
}

func (c *clientImpl) Close() {
	close(c.send)
	c.conn.Close()
	// TODO: Server needs to be aware that we disconnected as well
}

func (c *clientImpl) Send(msg *messages.Message) {
	c.send <- msg
}

// Checks if our ReadMessage error is a normal disconnect event
func isUnexpectedClose(err error) bool {
	return websocket.IsUnexpectedCloseError(err,
		websocket.CloseNormalClosure,
		websocket.CloseAbnormalClosure,
		websocket.CloseGoingAway)
}

// We will receive messages here and forward everything to server
func (c *clientImpl) ReadPump() {
	c.logger.Debugw("started read pump for client",
		"id", c.id, "remoteAddr", c.addr)

	defer close(c.send)
	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			// We will handle disconnects here since websocket will
			// error on this call when we receive it
			if isUnexpectedClose(err) {
				c.logger.Errorw("unexpected close on client socket",
					"id", c.id, "remoteAddr", c.addr, zap.Error(err))
			}

			c.logger.Debugw("exiting client read pump", "id", c.id, "remoteAddr", c.addr)
			break
		}

		// Everything seems fine, just forward
		message := messages.Message{}
		proto.Unmarshal(msg, &message)

		c.logger.Debugw("revided messege", "id", c.id, "remoteAddr", c.addr)

		// TODO: We will need to do something with this
		fmt.Println(msg)
	}
}

func (c *clientImpl) SendPump() {
	c.logger.Debugw("started send pump for client",
		"id", c.id, "remoteAddr", c.addr)

	defer c.conn.Close()
	for message := range c.send {
		// So we don't wait for too long before we send
		c.conn.SetWriteDeadline(time.Now().Add(writeTimeout))

		writer, err := c.conn.NextWriter(websocket.BinaryMessage)
		if err != nil {
			c.logger.Warnw("error while getting NextWriter for client",
				"id", c.id, "remoteAddr", c.addr, zap.Error(err))
			return
		}

		rawMessage, _ := proto.Marshal(message)
		writer.Write(rawMessage)
		// We need to close the writer so that our message
		// gets flushed to the client
		if err = writer.Close(); err != nil {
			c.logger.Warnw("error while closing client writer",
				"id", c.id, "remoteAddr", c.addr, zap.Error(err))
		}
	}

	c.logger.Debugw("exiting client send pump", "id", c.id, "remoteAddr", c.addr)
	c.conn.WriteMessage(websocket.CloseMessage, []byte{})
}

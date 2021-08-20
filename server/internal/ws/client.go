package ws

import (
	"math/rand"
	"net"
	"time"

	"github.com/gorilla/websocket"

	"google.golang.org/protobuf/proto"

	"go.uber.org/zap"

	"github.com/ptr-geeks/ptrun/server/internal/events"
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

	server Server
}

// NewClient creates new instance of client with randomly generated id and remote adres, it also connects him to server with websocket
//and allows server to comunicate with him
func NewClient(conn *websocket.Conn, serv Server, logger *zap.Logger) Client {
	return &clientImpl{
		// Just randomly generate
		id:     rand.Int31(),
		addr:   conn.RemoteAddr(),
		conn:   conn,
		logger: logger.Sugar(),
		server: serv,

		send: make(chan *messages.Message),
	}
}

//function GetID returns id of the client
func (c *clientImpl) GetID() int32 {
	return c.id
}

//retruns remote addres of the client
func (c *clientImpl) GetRemoteAddr() net.Addr {
	return c.addr
}

//closes the client
func (c *clientImpl) Close() {
	close(c.send)
	c.conn.Close()
	// TODO: Server needs to be aware that we disconnected as well
}

//Send sends messages
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

//reads the messages sended from the client and returns error if needed
func (c *clientImpl) ReadPump() {
	c.logger.Debugw("started read pump for client",
		"id", c.id, "remoteAddr", c.addr)

	//defer c.Close() //
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
		//tu je ta message bus
		// Everything seems fine, just unmarshal & forward
		c.logger.Debugw("recieved message", "id", c.id, "remoteAdr", c.addr)
		message := &messages.Message{}
		proto.Unmarshal(msg, message)

		events.Publish("server.broadcast", c.id, message)
	}

	c.server.Disconnect(c)
	//events.Publish("server.disconnect", c.id)
}

// SendPump sends messages to client and checks if there is an error and returns it
func (c *clientImpl) SendPump() {
	c.logger.Debugw("started send pump for client",
		"id", c.id, "remoteAddr", c.addr)

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

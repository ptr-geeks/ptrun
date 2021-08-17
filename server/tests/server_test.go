package ws

import (
	"fmt"
	"github.com/ptr-geeks/ptrun/server/internal/ws"
	"go.uber.org/zap"
	"testing"
)

func TestNewServer(t *testing.T) {
	// Generate a new logger
	logger, err := zap.NewDevelopment()
	if err != nil {
		panic(err)
	}
	server := ws.NewServer(logger)
	if server == nil {
		panic("Panic")
	}
	//go server.Run()
	//fmt.Println("Ok")

	//mux := goji.NewMux()
	//mux.HandleFunc(pat.Get("/ws"), func(w http.ResponseWriter, r *http.Request) {
	//	server.Connect(w, r)
	//})

	//defer server.Disconnect()

	//ws.NewClient(_, server, logger)
	fmt.Println("Test executed successfully")
}

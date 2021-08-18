package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"go.uber.org/zap"
	"goji.io"
	"goji.io/pat"

	"github.com/ptr-geeks/ptrun/server/internal/ws"
)

var (
	server ws.Server
)

func main() {
	// Switch with zap.NewProduction() when needed
	// or even better, add a flag to switch this as needed.
	// Example: ./ptrun-server --debug
	logger, err := zap.NewDevelopment()
	if err != nil {
		panic(err)
	}

	sugared := logger.Sugar()

	games := ws.NewGamesList()

	//server = ws.NewServer(logger)
	//go server.Run()

	// TODO: We should allow some overrides by passing parameters to our executable
	// Example: ./ptr-server --port 8080 --path "/ws"
	sugared.Infow("starting websocket endpoint",
		"addr", "0.0.0.0",
		"port", 8080,
		"path", "/ws")

	mux := goji.NewMux()

	mux.HandleFunc(pat.Get("/ws"), func(w http.ResponseWriter, r *http.Request) {
		// Here get Server ID & Game ID
		serverid, _ := strconv.Atoi(r.URL.Query()["serverid"][0])
		gameid, _ := strconv.Atoi(r.URL.Query()["gameid"][0])

		// Here we get the Server from all available games
		game := games.GetGameFromID(gameid)
		serv := game.GetServerFromID(serverid)

		// And, we connect to it
		serv.Connect(w, r)
	})
	mux.HandleFunc(pat.Get("/server/new"), func(w http.ResponseWriter, r *http.Request) {
		// Here we get Game ID from parameters (/server/new?gameid=gameid)
		gameid, _ := strconv.Atoi(r.URL.Query()["gameid"][0])

		// Here we get Game interface from all available games
		game := games.GetGameFromID(gameid)

		// We generate a new server for our client & run it
		server = ws.NewServer(logger, gameid)
		go server.Run(game)

		// We add this generated server to our server list in our game
		game.AddServer(server)

		// Some tests....
		fmt.Println(game.GetAllClients())
		fmt.Println(server.GetID())

		// Here we write back status code 200 & server ID, so that client can join
		w.WriteHeader(200)
		w.Write([]byte(strconv.Itoa(server.GetID())))
	})
	mux.HandleFunc(pat.Get("/game/new"), func(w http.ResponseWriter, r *http.Request) {
		// Here we generate a new Game & add it to games list
		game := ws.NewGame()
		games.AddGame(game)

		// Here we just write back the ID of game, so that client can generate a new
		// Server & afterwards join to it
		w.Write([]byte(strconv.Itoa(game.GetID())))

		// Just some tests...
		fmt.Println(games.GetGames())
	})

	srv := &http.Server{
		Handler: mux,
		Addr:    "0.0.0.0:8080",
		// These should probably be moved under internal/const
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
		IdleTimeout:  15 * time.Second,
	}

	done := make(chan os.Signal, 1)
	signal.Notify(done, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			sugared.Errorw("error starting http server", zap.Error(err))
		}
	}()

	<-done
	sugared.Debug("stopping")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer func() {
		// If we need any more cleanup, it should go here

		// We should probably check and gracefully shutdown everything at this
		// point and also disconnect all our clients
		cancel()
	}()

	if err := srv.Shutdown(ctx); err != nil {
		sugared.Errorw("error shutting down http server", zap.Error(err))
	}
}

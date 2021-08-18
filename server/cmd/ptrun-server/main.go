package main

import (
	"context"
	"flag"
	"net/http"
	"os"
	"os/signal"
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
	var debug = flag.Bool("debug", false, "enable debug mode")
	var host = flag.String("host", "0.0.0.0", "set server host")
	var port = flag.String("port", "8080", "set server port")
	var path = flag.String("path", "/ws", "set server WS path")
	flag.Parse()

	var logger *zap.Logger
	var err error

	if *debug {
		logger, err = zap.NewDevelopment()
	} else {
		logger, err = zap.NewProduction()
	}

	if err != nil {
		panic(err)
	}

	sugared := logger.Sugar()

	server = ws.NewServer(logger)
	go server.Run()

	sugared.Infow("starting websocket endpoint",
		"host", host,
		"port", port,
		"path", path)

	mux := goji.NewMux()
	mux.HandleFunc(pat.Get(*path), func(w http.ResponseWriter, r *http.Request) {
		server.Connect(w, r)
	})

	srv := &http.Server{
		Handler: mux,
		Addr:    *host + ":" + *port,
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

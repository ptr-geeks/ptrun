package consts

import (
	"time"
)

const (
	ChanBufferSize = 200
	WriteTimeout   = 15 * time.Second
	ReadTimeout    = 15 * time.Second
	IdleTimeout    = 15 * time.Second
)

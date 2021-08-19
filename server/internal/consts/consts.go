package consts

import (
	"time"
)

const (
	ChanBufferSize   = 200
	HttpWriteTimeout = 15 * time.Second
	HttpReadTimeout  = 15 * time.Second
	HttpIdleTimeout  = 15 * time.Second
)

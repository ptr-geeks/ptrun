package ws

type gamesImpl struct {
	games []Game
}

func NewGamesList() Games {
	return &gamesImpl{}
}

func (g *gamesImpl) GetGameFromID(id int) Game {
	for i := 0; i < len(g.games); i++ {
		if g.games[i].GetID() == id {
			return g.games[i]
		}
	}
	return nil
}

func (g *gamesImpl) AddGame(game Game) {
	g.games = append(g.games, game)
}

func (g *gamesImpl) GetGames() []Game {
	return g.games
}

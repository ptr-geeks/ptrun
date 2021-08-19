import messages from '../messages_pb';

export class Websocket {
    constructor() {
        // Create WebSocket connection.
        this.socket = new WebSocket('ws://localhost:8080/ws');

        // Connection opened
        this.socket.addEventListener('open', (event) => {
            var message = new messages.Message();
            var join = new messages.Join();
            message.setJoin(join);
            join.setUsername('spela in lara');
            this.sendMessage(message);
        });



        // Listen for messages
        this.socket.addEventListener('message', (event) => {
            var message = messages.Message().deserializeBinary(event.data);
            switch (message.getDataCase()) {
                case 4:
                    this.joinRecieve(message.getPlayerId());
                    break;
                case 5:
                    const move = message.getMove();
                    this.playerMoveRecieve(message.getPlayerId(), move.getX(), move.getY(), move.getDx(), move.getDy());
                    break;
            
                default:
                    break;
            }
            console.log('Message from server ', event.data);
        });

    }

    sendMessage(message) {
        var bytes = message.serializeBinary();
        this.socket.send(bytes);
    }

    playerMoveSend(x, y, dx, dy) {
        var message = new messages.Message();
        var move = new messages.Move();
        message.setMove(move);
        move.setX(x);
        move.setY(y);
        move.setDx(dx);
        move.setDy(dy);
        this.sendMessage(message);
    }

    playerMoveRecieve(player_id, x, y, dx, dy) {
        console.log(player_id, x, y);

    }

    joinRecieve(player_id) {
        console.log(player_id);

    }
}

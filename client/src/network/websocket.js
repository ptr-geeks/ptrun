import messages from '../messages_pb';

export class Websocket {
    constructor(receiveCallback) {
        this.receiveCallback = receiveCallback;

        // Create WebSocket connection.
        //this.socket = new WebSocket('ws://localhost:8080/ws');
        this.socket = new WebSocket('wss://ptrun-server.develop.cloud.ptr.si/ws');
        this.socket.binaryType = 'arraybuffer';

        // Connection opened
        this.socket.addEventListener('open', (event) => {
            var message = new messages.Message();
            var join = new messages.Join();
            message.setJoin(join);
            join.setNickname(this.getInitialNickname());
            this.sendMessage(message);
        });

        // Listen for messages
        this.socket.addEventListener('message', (event) => {
            if (this.receiveCallback == null ||
                !event.data) {
                return;
            }

            const message = messages.Message.deserializeBinary(new Uint8Array(event.data));
            this.receiveCallback(message);
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

    playerNameSend(nickname) {
        window.localStorage.setItem('playerName', nickname);

        const changeName = new messages.ChangeName();
        changeName.setNickname(nickname);
        const message = new messages.Message();
        message.setChangeName(changeName);
        this.sendMessage(message);
    }

    getInitialNickname() {
        const storedName = window.localStorage.getItem('playerName');
        if (storedName) return storedName;

        return `Player ${Math.floor(Math.random() * 100)}`;
    }
}

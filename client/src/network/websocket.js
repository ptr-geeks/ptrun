import messages from '../messages_pb.js';

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
            join.setUsername('spela in lara');
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
}

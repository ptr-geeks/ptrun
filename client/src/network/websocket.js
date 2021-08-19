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
            console.log('username:', join.getUsername);
            this.sendMessage(message);
        });

        // Listen for messages
        this.socket.addEventListener('message', (event) => {
            var message2 = messages.Message().deserializeBinary(event.data);
            console.log(message2);
            console.log('Message from server ', event.data);
        });

    }

    sendMessage(message) {
        var bytes = message.serializeBinary();
        this.socket.send(bytes);
    }
}

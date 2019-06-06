import { SessionPreparator } from '../Session/SessionPreparator';
import { Server } from 'http';
import socketIo from 'socket.io';
import { SocketRoomController } from './SocketRoomController';


export class ConnectionHandler {
    private rooms: Map<number, SessionPreparator> = new Map<number, SessionPreparator>();
    private sockets: Map<number, SocketRoomController> = new Map<number, SocketRoomController>();
    private io: socketIo.Server | null = null;

    public register(server: Server): void {
        // サーバのイベントを設定した後にsocketIoを作らなければいけないためコンストラクタにしない
        this.io = socketIo(server);
        this.io.path('/g');
    }

    public createNewRoom(id: number): number {
        this.sockets.set(id, new SocketRoomController(this.io!.of(`/session/${id}`)));
        return id;
    }
}

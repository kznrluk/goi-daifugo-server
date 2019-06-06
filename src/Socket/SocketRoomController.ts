import { Namespace, Socket } from 'socket.io';
import { SessionPreparator } from '../Session/SessionPreparator';
import { Option } from '../Session/Option';
import { SessionLogic } from '../Session/SessionLogic';

export class SocketRoomController {
    private sessionPreparator: SessionPreparator = new SessionPreparator();
    private session: SessionLogic | null = null;

    constructor(private room: Namespace) {
        room.on('connection', (socket) => {
            socket.use((packet, next) => {
                console.log(packet[0]);
                if (packet[0] !== 'joinSession' && !this.sessionPreparator.isPlayerJoined(socket.id)) {
                    this.emitOnErrorReload('IDが存在しません。再度入室してください');
                    return false;
                }
                if (this[packet[0]] && toString.call(this[packet[0]]) === '[object Function]')  {
                    const args = [...packet];
                    args.shift();
                    this[packet[0]](socket, ...args); // index:1 以降の値を渡す
                    next();
                } else {
                    console.log('不明なAPIが呼び出されました。: ', packet);
                }
                return true;
            });

            // Disconnectはuseで取れない
            socket.on('disconnect', () => this.disconnect(socket));
        });
    }

    private functionTest(socket: Socket, message: string) {
        socket.emit('functionTest', message);
    }

    private joinSession(socket: Socket): void {
        this.sessionPreparator.joinPlayer(socket.id);
        this.emitPlayerList();
    }

    private changeOwnName(socket: Socket, name: string): void {
        this.sessionPreparator.changePlayerName(socket.id, name);
        this.emitPlayerList();
    }

    private changeOptions(socket: Socket, options: Option): void {
        this.sessionPreparator.changeSessionOpt(options);
        this.room.emit('onSessionOptChanged', options);
    }

    private changeOwnWordSets(socket: Socket, words: string[]): void {
        this.sessionPreparator.changePlayerWordSet(socket.id, words);
    }

    private changeOwnReadyStatus(socket: Socket, isReady: boolean): void {
        this.sessionPreparator.changePlayerReady(socket.id, isReady);
        this.emitPlayerList();
    }

    private disconnect(socket: Socket): void {
        this.sessionPreparator.removePlayer(socket.id);
        this.emitPlayerList();
    }

    private startSession(socket: Socket): void {
        if (!this.sessionPreparator.isAllPlayerReadied()) {
            this.emitOnErrorReload('プレイヤー全員が準備完了していません。');
        }

        // 要リファクタ
        this.room.emit('startSession');
        this.session = this.sessionPreparator.createSession();
        this.emitSessionDetails();
        const detail = this.session!.createSessionStatus();
        this.room.to(detail.currentPlayerId!).emit('setFirstWord');
        this.emitSessionDetails();
    }

    private setWordByIndex(socket: Socket): void {
        if (!this.session || !this.session.canIdSetWord(socket.id)) {
            this.emitOnErrorReload('現在セットできません。');
            return;
        }
    }

    private skipOwnTurn(socket: Socket): void {
        this.session!.skipOwnTurn(socket.id);
        this.emitSessionDetails();
    }

    private insertWordByIndex(socket: Socket, index: number): void {
        if (!this.session || !this.session.canIdSetWord(socket.id)) {
            this.emitOnErrorReload('現在セットできません。');
            return;
        }

        const stagingWord = this.session.stagingWordFromIndex(socket.id, index);
        this.room.emit('insertWordByIndex', stagingWord);
        this.emitSessionDetails();
    }

    public emitJudgedStagingWord(socket: Socket): Function {
        return (result: boolean) => {
            this.room.emit('judgedStagingWord', result);
        };
    }

    private setWordByInput(socket: Socket, word: string): void {
        if (!this.session || !this.session.canIdSetWord(socket.id)) {
            this.emitOnErrorReload('現在セットできません。');
            return;
        }
        this.session.setFirstWord(socket.id, word);
        this.emitSessionDetails();
    }

    private setJudgeForStagingWord(socket: Socket, isApplove: boolean): void {
        if (this.session) {
            const data = this.session!.setJudgeForStagingWord(socket.id, isApplove);
            this.session.checkStagingWordApproved();
            this.room.emit('setJudgeForStagingWord', data);
        }
        this.emitSessionDetails();
    }

    private emitPlayerList(): void {
        this.room.emit('playerList', this.sessionPreparator.createCurrentPlayerList());
    }

    private emitSessionDetails(): void {
        if (this.session) {
            this.room.emit('sessionDetail', this.session.createSessionStatus());
        } else {
            this.emitOnErrorReload('hoge');
        }
    }

    private emitOnErrorReload(message?: string): void {
        this.room.emit('onErrorReload', message);
    }
}

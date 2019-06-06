import { Player } from '../Player/Player';
import { Option } from './Option';
import { SessionLogic } from './SessionLogic';
import { Socket } from 'socket.io';
import { PlayerStatus } from '../Player/PlayerStatus';

export class SessionPreparator {
    public players: Map<string, Player> = new Map();
    public option: Option = { cardNumber: 5 };

    public createSession() {
        return new SessionLogic(this.option, this.getPlayerArray());
    }

    public joinPlayer(id: string): void {
        const isMaster = this.players.size === 0;
        this.players.set(id, new Player(id, isMaster));
    }

    public changePlayerName(id: string, name: string): void {
        this.players.get(id)!.setName(name);
    }

    public isPlayerJoined(id: string): boolean {
        return this.players.has(id);
    }

    public changePlayerWordSet(id: string, words: string[]): void {
        this.players.get(id)!.setWords(words);
    }

    public changeSessionOpt(option: Option): void {
        this.option = option;
    }

    public changePlayerReady(id: string, bool: boolean): void {
        this.players.get(id)!.setStatus(bool);
    }

    public isAllPlayerReadied(): boolean {
        return !this.getPlayerArray().some(p => !p.createPlayerStatus().readyForStart);
    }

    public createCurrentPlayerList(): PlayerStatus[] {
        return this.getPlayerArray().map(value => value.createPlayerStatus());
    }

    public removePlayer(id: string): void {
        const removedPlayer = this.players.get(id);
        this.players.delete(id);
        if (removedPlayer && removedPlayer.getIsMaster()) {
            // もっといいやり方があるかも
            const ids: string[] = [];
            this.players.forEach((_, key) => ids.push(key));
            if (ids.length !== 0) {
                this.players.get(ids[0])!.changeMasterStatus(true);
            }
        }
    }

    public isMaster(id: string): boolean {
        return this.players.has(id) ? this.players.get(id)!.getIsMaster() : false;
    }

    public getPlayerArray(): Player[] {
        const result: Player[] = [];
        this.players.forEach(v => result.push(v));
        return result;
    }
}

interface PlayerList {
    id: string;
    name: string;
    isMaster: boolean;
    readyForStart: boolean;
}

import { Word } from '../Word/Word';
import { PlayerStatus } from './PlayerStatus';

export class Player {
    private name: string = '';
    private words: Word[] = [];
    private readyForStart: boolean = false;
    private isMaster: boolean = false;

    constructor(private id: string, isMaster:boolean) {
        this.changeMasterStatus(isMaster);
    }

    public checkSomeId(id: string): boolean {
        return this.id === id;
    }

    public changeMasterStatus(isMaster: boolean): void {
        this.isMaster = isMaster;
        this.readyForStart = this.readyForStart || isMaster;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public setWords(words: string[]): void {
        this.words = words.map((word) => new Word(word));
    }

    public getWordObjectByIndex(index: number): Word {
        return this.words[index];
    }

    public setStatus(bool: boolean): void {
        this.readyForStart = bool;
    }

    public getIsMaster(): boolean {
        return this.isMaster;
    }

    public createPlayerStatus(): PlayerStatus {
        return {
            id: this.id,
            name: this.name,
            isMaster: this.isMaster,
            readyForStart: this.readyForStart,
        };
    }
}

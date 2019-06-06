import { Word } from './Word';
import { Player } from '../Player/Player';
import { PlayerStatus } from '../Player/PlayerStatus';

export class WordHistory {
    constructor(public readonly word: Word, public readonly player: Player) { }
    public serialize(): SerializedWordHistory { return { word: this.word.word, player: this.player.createPlayerStatus() }; }
}

export interface SerializedWordHistory {
    word: string,
    player: PlayerStatus,
}

import { Option } from './Option';
import { Player } from '../Player/Player';
import { SessionStatus } from './SessionStatus';
import { ActionList } from './ActionList';
import { Word } from '../Word/Word';
import { SerializedWordHistory, WordHistory } from '../Word/WordHistory';
import { PlayerStatus } from '../Player/PlayerStatus';
import { WordBattle } from '../Word/WordBattle';

export class SessionLogic {
    private currentAction: ActionList = ActionList.CLEAR_LAYOUT;
    private currentPlayer: Player;
    private layout: WordBattle[] = [];
    private history: WordBattle[][] = [];
    private staging: WordHistory | null = null;
    private approved: { isApproved: boolean, player: PlayerStatus }[] = [];

    constructor(private option: Option, private player: Player[]) {
        this.currentPlayer = player[0];
    }

    public canIdSetWord(id: string) {
        return this.currentPlayer.checkSomeId(id);
    }

    public setFirstWord(id: string, name: string) {
        const player = this.getPlayerFromId(id);
        this.layout.push(new WordBattle(new WordHistory(new Word(name), player)));
        this.nextPlayer();
    }

    public checkStagingWordApproved(): void {
        if (!this.staging) {
            throw new Error('ステージングされていません');
        }
        if (this.approved.length === this.player.length - 1) {
            const approvedData = this.approved.filter(a => a.isApproved);
            const isApproved = approvedData.length <= Math.ceil(this.approved.length / 2);

            const currentBattleHistory = this.layout[this.layout.length - 1];
            currentBattleHistory.setResult(this.staging, isApproved);
            this.layout.push(currentBattleHistory.createNextWordBattle());
            this.approved = [];
            this.staging = null;
            this.nextPlayer();
        }
    }

    public skipOwnTurn(id: string) {
        if (this.currentPlayer.checkSomeId(id)) {
            this.nextPlayer();
            if (this.layout[this.layout.length - 1].precedingWord.player.checkSomeId(id)) {
                console.log('フラッシュ！');
                this.flushLayout();
            }
        }
    }

    public flushLayout() {
        this.history.push(this.layout);
        this.layout = [];
    }

    public setJudgeForStagingWord(id: string, isApproved: boolean): { isApproved: boolean, player: PlayerStatus } {
        const player = this.getPlayerFromId(id);
        const alreadyJudge = this.approved.find(d => d.player.id === id);
        if (alreadyJudge) {
            // 連打対策
            return alreadyJudge;
        }
        const isApprovedData = { isApproved, player: player.createPlayerStatus() };
        this.approved.push(isApprovedData);
        return isApprovedData;
    }

    public stagingWordFromIndex(id: string, index: number): SerializedWordHistory {
        const player = this.getPlayerFromId(id);
        const word = player.getWordObjectByIndex(index);
        this.staging = new WordHistory(word, player);
        return this.staging.serialize();
    }

    public createSessionStatus(): SessionStatus {
        return {
            currentPlayerId: this.currentPlayer.createPlayerStatus().id,
            layout: this.layout.map(history => history.serialize()),
            history: this.history.map(harray => harray.map(h => h.serialize())),
            currentAction: this.currentAction,
        };
    }

    private getPlayerFromId(id: string) {
        const player = this.player.find(player => player.checkSomeId(id));
        if (!player) {
            throw new Error('存在しないIDです。');
        }
        return player;
    }

    private nextPlayer() {
        const index = this.player.indexOf(this.currentPlayer);
        this.currentPlayer = this.player[index + 1] || this.player[0];
    }
}

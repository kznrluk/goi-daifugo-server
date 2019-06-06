import { SerializedWordHistory, WordHistory } from './WordHistory';

export class WordBattle {
    public readonly precedingWord: WordHistory;
    public stagingWord: WordHistory | null = null;
    public isStagingWordWin: boolean | null = null;

    constructor(precedingWord: WordHistory) {
        this.precedingWord = precedingWord;
    }

    public setResult(stagingWord: WordHistory, result: boolean): void {
        this.stagingWord = stagingWord;
        this.isStagingWordWin = result;
    }

    public createNextWordBattle() {
        if (!this.isStagingWordWin || !this.stagingWord) {
            throw new Error('呼び出しタイミングが不正です');
        }
        const winWord = this.isStagingWordWin ? this.stagingWord : this.precedingWord;
        return new WordBattle(winWord);
    }

    public serialize(): SerializedWordBattleHistory {
        return {
            precedingWord: this.precedingWord.serialize(),
            stagingWord: this.stagingWord ? this.stagingWord.serialize() : null,
            isStagingWordWin: this.isStagingWordWin,
        };
    }
}

export interface SerializedWordBattleHistory {
    precedingWord: SerializedWordHistory,
    stagingWord: SerializedWordHistory | null,
    isStagingWordWin: boolean | null
}

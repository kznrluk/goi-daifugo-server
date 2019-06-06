import { ActionList } from './ActionList';
import { SerializedWordHistory, WordHistory } from '../Word/WordHistory';
import { SerializedWordBattleHistory } from '../Word/WordBattle';

export interface SessionStatus {
    currentPlayerId: string | null,
    layout: SerializedWordBattleHistory[],
    history: SerializedWordBattleHistory[][],
    currentAction: ActionList,
}

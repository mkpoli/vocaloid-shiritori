export const GAME_MODES = [
	// play with yourself
	'single',
	// play with computer
	'computer',
	// play with others (realtime)
	'multi',
	// play with others (non-realtime)
	'public'
] as const;
export type Gamemode = (typeof GAME_MODES)[number];

export type Score = {
	username: string;
	score: number;
	timestamp: number;
	gamemode: Gamemode;
};

export type SenderType = 'user' | 'computer';
// type Sender = {
// 	sender: SenderType;
// 	username?: string;
// };
export type Sender =
	| {
			type: 'user';
			username: string;
		}
	| {
			type: 'computer';
		};

export type Word = {
	vocaloid: string;
	yomigana: string;
	sender: Sender;
};

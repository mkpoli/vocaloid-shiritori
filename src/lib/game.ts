export const GAME_MODES = [
	// play with yourself
	'single',
	// play with computer
	'computer',
	// play with others (realtime)
	'multi',
	// play with others (non-realtime)
	'together'
] as const;
export type Gamemode = (typeof GAME_MODES)[number];

export type Score = {
	username: string;
	score: number;
	timestamp: number;
	gamemode: Gamemode;
};

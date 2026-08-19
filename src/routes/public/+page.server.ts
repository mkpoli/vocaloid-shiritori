import type { publicGameRecords, publicGames } from '$lib/db/schema';
import type { PageServerLoad } from './$types';

export type Game = typeof publicGames.$inferSelect;
export type GameRecord = typeof publicGameRecords.$inferSelect;
export type GameWithRecords = Game & {
	records: { first: GameRecord; last: GameRecord };
};

type GameRow = {
	game_id: number;
	ended: number;
	game_created_at: number;
	created_by: string;
	first_id: number;
	first_username: string;
	first_song_name: string;
	first_created_at: number;
	last_id: number;
	last_username: string;
	last_song_name: string;
	last_created_at: number;
};

const MAX_PUBLIC_GAMES = 100;

export const load: PageServerLoad = async ({ platform, setHeaders }) => {
	const DB = platform?.env?.DB;
	if (!DB) throw new Error('DB not found');

	const { results } = await DB.prepare(
		`WITH recent_games AS MATERIALIZED (
		   SELECT id, ended, created_at, created_by
		   FROM public_games
		   ORDER BY created_at DESC, id DESC
		   LIMIT ?
		 ), edges AS (
		   SELECT recent_games.*,
		     (SELECT id FROM public_game_records
		      WHERE game_id = recent_games.id
		      ORDER BY created_at ASC, id ASC LIMIT 1) AS first_id,
		     (SELECT id FROM public_game_records
		      WHERE game_id = recent_games.id
		      ORDER BY created_at DESC, id DESC LIMIT 1) AS last_id
		   FROM recent_games
		 )
		 SELECT
		   edges.id AS game_id,
		   edges.ended,
		   edges.created_at AS game_created_at,
		   edges.created_by,
		   first_record.id AS first_id,
		   first_record.username AS first_username,
		   first_record.song_name AS first_song_name,
		   first_record.created_at AS first_created_at,
		   last_record.id AS last_id,
		   last_record.username AS last_username,
		   last_record.song_name AS last_song_name,
		   last_record.created_at AS last_created_at
		 FROM edges
		 JOIN public_game_records AS first_record ON first_record.id = edges.first_id
		 JOIN public_game_records AS last_record ON last_record.id = edges.last_id
		 ORDER BY edges.created_at DESC, edges.id DESC`
	)
		.bind(MAX_PUBLIC_GAMES)
		.all<GameRow>();

	const games: GameWithRecords[] = results.map((row) => ({
		id: row.game_id,
		ended: row.ended,
		createdAt: row.game_created_at,
		createdBy: row.created_by,
		records: {
			first: {
				id: row.first_id,
				gameId: row.game_id,
				username: row.first_username,
				songName: row.first_song_name,
				createdAt: row.first_created_at
			},
			last: {
				id: row.last_id,
				gameId: row.game_id,
				username: row.last_username,
				songName: row.last_song_name,
				createdAt: row.last_created_at
			}
		}
	}));

	setHeaders({ 'cache-control': 'public, max-age=5, s-maxage=30' });
	return { games };
};

import { load as loadVocaloids } from '$lib/vocaloid';
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ data }) => {
	return {
		game: data.game,
		records: data.records,
		vocaloids: new Map(await loadVocaloids()),
	};
};
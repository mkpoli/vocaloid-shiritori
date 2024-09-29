import { load as loadVocaloids } from '$lib/vocaloid';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => {
	return {
		vocaloids: new Map(await loadVocaloids()),
		scores: data.scores
	};
};

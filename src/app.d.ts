// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}
declare global {
	function check(a: string, b: string, options?: Partial<ShiritoriOptions>): ShiritoriValidity;
	function find(map: Map<string, string>, word: string): [string, string] | undefined;
	var vocaloids: Map<string, string>;
}

export {};

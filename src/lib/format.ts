const DAY = 86_400_000;

export const fmtDate = (d: Date) =>
	d.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	});

export const fmtShort = (d: Date) =>
	d.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		timeZone: "UTC",
	});

export const weekday = (d: Date) =>
	d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });

export const daysBetween = (from: Date, to: Date) =>
	Math.round((to.getTime() - from.getTime()) / DAY);

export const ratio = (dose: number, water: number) =>
	`1:${(water / dose).toFixed(1)}`;

/** Small stable number from a string, so each page gets its own stains and tilts. */
export const seed = (s: string) => {
	let h = 7;
	for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
	return h;
};

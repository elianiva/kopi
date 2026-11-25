import { getCollection, type CollectionEntry } from "astro:content";

export async function load() {
	const [roasteries, beans, brews] = await Promise.all([
		getCollection("roasteries"),
		getCollection("beans"),
		getCollection("brews"),
	]);
	brews.sort(
		(a, b) =>
			b.data.date.getTime() - a.data.date.getTime() ||
			Number(b.id) - Number(a.id),
	);

	const roasteryById = new Map(roasteries.map((r) => [r.id, r]));
	const beanById = new Map(beans.map((b) => [b.id, b]));
	const brewsOf = (beanId: string) =>
		brews.filter((b) => b.data.bean.id === beanId);
	const lastBrewed = (bean: CollectionEntry<"beans">) =>
		brewsOf(bean.id)[0]?.data.date.getTime() ?? 0;

	// Most recently brewed first, so the catalog reads newest to oldest.
	beans.sort((a, b) => lastBrewed(b) - lastBrewed(a));
	const beansOf = (roasteryId: string) =>
		beans.filter((b) => b.data.roastery.id === roasteryId);
	roasteries.sort(
		(a, b) => lastBrewed(beansOf(b.id)[0]) - lastBrewed(beansOf(a.id)[0]),
	);

	return {
		roasteries,
		beans,
		brews,
		roasteryById,
		beanById,
		brewsOf,
		beansOf,
	};
}

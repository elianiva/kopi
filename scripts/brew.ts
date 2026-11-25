/// <reference types="bun" />
// Log a brew: `bun run brew`. Every answer defaults to the last brew's value,
// so repeating a recipe is mostly Enter. Appends to src/data/brews.yaml.
import { appendFile } from "node:fs/promises";
import { createInterface } from "node:readline";

const BREWS = "src/data/brews.yaml";
const BEANS = "src/data/beans.yaml";

type Brew = Record<string, any> & { id: string; bean: string; date: string };
type Bean = { id: string; name: string };

const brews = Bun.YAML.parse(await Bun.file(BREWS).text()) as Brew[];
const beans = Bun.YAML.parse(await Bun.file(BEANS).text()) as Bean[];
const last = brews.reduce(
	(a, b) => (String(b.date) >= String(a.date) ? b : a),
	brews[0],
);

// Read answers line by line so piped input works as well as a terminal.
const rl = createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: process.stdin.isTTY,
});
const lines = rl[Symbol.asyncIterator]();
async function ask(label: string, fallback?: string | number): Promise<string> {
	const hint =
		fallback === undefined || fallback === "" ? "" : ` [${fallback}]`;
	process.stdout.write(`${label}${hint}: `);
	const { value, done } = await lines.next();
	const answer = done ? "" : String(value).trim();
	if (!process.stdin.isTTY) process.stdout.write(`${answer}\n`);
	return answer || (fallback === undefined ? "" : String(fallback));
}
async function num(
	label: string,
	fallback?: number,
): Promise<number | undefined> {
	for (;;) {
		const a = await ask(label, fallback);
		if (a === "") return undefined;
		if (!Number.isNaN(Number(a))) return Number(a);
		console.log("  Enter a number.");
	}
}

// Beans you brewed most recently come first.
const recent = [
	...new Set(
		[...brews]
			.sort((a, b) => String(b.date).localeCompare(String(a.date)))
			.map((b) => b.bean),
	),
];
const order = [
	...recent,
	...beans.map((b) => b.id).filter((id) => !recent.includes(id)),
];
order.forEach((id, i) =>
	console.log(`  ${i + 1}. ${beans.find((b) => b.id === id)?.name ?? id}`),
);
let bean = "";
while (!bean) {
	const a = await ask("Bean (number or id)", 1);
	bean = order[Number(a) - 1] ?? order.find((id) => id === a) ?? "";
	if (!bean)
		console.log("  No such bean. Add it to src/data/beans.yaml first.");
}
const prev = [...brews].reverse().find((b) => b.bean === bean) ?? last;

const today = new Date().toLocaleDateString("en-CA");
const date = await ask("Date", today);
const method = await ask("Method", prev.method);
const gear = await ask("Gear", prev.gear);
const dose = await num("Dose (g)", prev.dose);
const water = await num("Water (g)", prev.water);
const waterTemp = await num("Water temp (°C)", prev.waterTemp);
const brewTime = await ask("Brew time", prev.brewTime);
const grinder = await ask("Grinder", prev.grinder);
const grindSize = await ask("Grind size", prev.grindSize);
const filter = await ask("Filter", prev.filter);
const waterBrand = await ask("Water brand", prev.waterBrand);
const waterPpm = await num("Water ppm", prev.waterPpm);
const pourSpeed = await num("Pour speed (g/s)", prev.pourSpeed);

const prevPours = (prev.pours as { at: string; to: number }[])
	.map((p) => `${p.at} ${p.to}`)
	.join(", ");
let pours: { at: string; to: number }[] = [];
for (;;) {
	const raw = await ask("Pours as time grams, comma separated", prevPours);
	pours = raw.split(",").map((p) => {
		const [at, to] = p.trim().split(/\s+/);
		return { at, to: Number(to) };
	});
	if (!pours.every((p) => /^\d{2}:\d{2}$/.test(p.at) && p.to > 0)) {
		console.log("  Write each pour like 00:40 120.");
		continue;
	}
	if (pours.at(-1)!.to === water) break;
	console.log(`  The last pour should reach the water weight, ${water} g.`);
}

const note = await ask("Note", prev.note);
const fragrance = await ask("Fragrance, dry");
const aroma = await ask("Aroma, wet");
const hot = await ask("Taste hot");
const warm = await ask("Taste warm");
const aftertaste = await ask("Aftertaste");
const mouthfeel = await ask("Mouthfeel");
const nextTime = await ask("Next time");
rl.close();

if (
	!dose ||
	!water ||
	!waterTemp ||
	!brewTime ||
	!grinder ||
	!grindSize ||
	!gear ||
	!method
) {
	console.error(
		"Dose, water, temp, brew time, grinder, grind size, gear, and method are required.",
	);
	process.exit(1);
}

const id = String(Math.max(0, ...brews.map((b) => Number(b.id) || 0)) + 1);
const hasTaste = Boolean(
	fragrance || aroma || hot || warm || aftertaste || mouthfeel,
);
// JSON strings are valid YAML, so quoting through JSON escapes anything odd.
const q = (s: string) => JSON.stringify(s);
const opt = (key: string, v: string | number | undefined, indent = "  ") =>
	v === undefined || v === ""
		? ""
		: `${indent}${key}: ${typeof v === "number" ? v : q(v)}\n`;
const entry =
	`\n- id: ${q(id)}\n  bean: ${bean}\n  date: ${date}\n` +
	opt("method", method) +
	opt("gear", gear) +
	opt("dose", dose) +
	opt("water", water) +
	opt("waterBrand", waterBrand) +
	opt("waterPpm", waterPpm) +
	opt("waterTemp", waterTemp) +
	opt("brewTime", brewTime) +
	opt("grinder", grinder) +
	opt("grindSize", grindSize) +
	opt("filter", filter) +
	opt("pourSpeed", pourSpeed) +
	`  pours:\n${pours.map((p) => `    - { at: ${q(p.at)}, to: ${p.to} }\n`).join("")}` +
	opt("note", note) +
	`  taste:${hasTaste ? "\n" : " {}\n"}` +
	opt("fragrance", fragrance, "    ") +
	opt("aroma", aroma, "    ") +
	opt("hot", hot, "    ") +
	opt("warm", warm, "    ") +
	opt("aftertaste", aftertaste, "    ") +
	opt("mouthfeel", mouthfeel, "    ") +
	opt("nextTime", nextTime);

await appendFile(BREWS, entry);
console.log(
	`\nLogged brew ${id}. Check it with bun dev, then commit and push to publish.`,
);

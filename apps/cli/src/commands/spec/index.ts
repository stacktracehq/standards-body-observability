import { match } from "ts-pattern";
import type { InferValue } from "../../stdlib.ts";
import { command, message, or, sealCommand } from "../../stdlib.ts";
import { specCheck, specCheckParser } from "./check.ts";
import { specInfo, specInfoParser } from "./info.ts";
import { specList, specListParser } from "./list.ts";

type SpecListResult = InferValue<typeof specListParser>;
type SpecCheckResult = InferValue<typeof specCheckParser>;
type SpecInfoResult = InferValue<typeof specInfoParser>;
type SpecResult = SpecListResult | SpecCheckResult | SpecInfoResult;

const specParser = command(
	"spec",
	or(
		command("list", specListParser, {
			description: message`List specifications`,
		}),
		command("check", specCheckParser, {
			description: message`Check conformance with specifications`,
		}),
		command("info", specInfoParser, {
			description: message`Show detailed information about a specification`,
		}),
	),
);

export const specCommand = sealCommand<SpecResult>({
	parser: specParser,
	execute: (result) =>
		match(result)
			.with({ type: "spec-list" }, specList)
			.with({ type: "spec-check" }, specCheck)
			.with({ type: "spec-info" }, specInfo)
			.exhaustive(),
});

import { $ } from "bun";
import { config } from "./build.config.mts";

export async function clean() {
  await $`rm -rf generated/${config.xcframework}`;
  // await $`rm -rf generated/${config.xcframeworkDebug}`;
  await $`rm -rf generated/simulator_fat`;
  await $`mkdir -p generated/simulator_fat`;
}

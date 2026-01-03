import { $ } from "bun";
import { notify } from "./build.notify.mts";
import { config } from "./build.config.mts";
import assert from "assert";

const IPHONEOS_DEPLOYMENT_TARGET = "15.0";

export async function buildIOS(
  profile: string,
  targetArchs: string[],
  features?: string
) {
  console.log(
    `\x1b[34mBuilding profile: ${profile} and target archs:\n${targetArchs.join(
      "\n"
    )}\x1b[0m`
  );

  for (const arch of targetArchs) {
    const command = [
      "cargo",
      "build",
      "--lib",
      "-p",
      config.crate,
      ...(profile === "release" ? ["--profile", "lib"] : []),
      "--target",
      arch,
      "--color=always",
    ].filter(Boolean);

    if (features) {
      command.push("--features", features);
    }

    console.log(`\x1b[35m${command.join(" ")}\x1b[0m`);

    await $`${command}`.env({
      ...process.env,
      IPHONEOS_DEPLOYMENT_TARGET: IPHONEOS_DEPLOYMENT_TARGET,
    });
  }

  await packageXcframework(profile, targetArchs);

  await copyToFinalDestination();


  console.log(`\x1b[32mDONE!\x1b[0m`);

  await notify("Opacity SDK compiled for IOS");
}

async function packageXcframework(profile: string, targetArchs: string[]) {
  let finalProfile = profile === "release" ? "lib" : "debug";
  // Copy template to generated folder
  await $`cp -r scripts/templates/sdk.xcframework generated/${config.xcframework}`;

  if (
    targetArchs.includes("aarch64-apple-ios-sim") &&
    targetArchs.includes("x86_64-apple-ios")
  ) {
    // Generate a fat binary
    await $`lipo -create target/x86_64-apple-ios/${finalProfile}/${config.iosLibName} target/aarch64-apple-ios-sim/${finalProfile}/${config.iosLibName} -output generated/simulator_fat/${config.iosLibTargetName}`;

    // Put all generated dylibs into the correct places
    // First the fat binary
    await $`cp generated/simulator_fat/${config.iosLibTargetName} generated/${config.xcframework}/ios-arm64_x86_64-simulator/sdk.framework/`;

    // set @rpath for simulator binary
    await $`install_name_tool -id @rpath/sdk.framework/${config.iosLibTargetName} generated/${config.xcframework}/ios-arm64_x86_64-simulator/sdk.framework/${config.iosLibTargetName}`;

    // Then the iOS relase binary
    await $`cp target/aarch64-apple-ios/${finalProfile}/${config.iosLibName} generated/${config.xcframework}/ios-arm64/sdk.framework/${config.iosLibTargetName}`;

    // set @rpath for release binary
    await $`install_name_tool -id @rpath/sdk.framework/${config.iosLibTargetName} generated/${config.xcframework}/ios-arm64/sdk.framework/${config.iosLibTargetName}`;
  } else {
    assert(
      "Either all archs must be built or only one arch, the technology of our time limits us!"
    );
    // If only one arch, just copy the one binary to all the places to trick Xcode to compile without errors
    await $`cp target/${targetArchs[0]}/${finalProfile}/${config.iosLibName} generated/${config.xcframework}/ios-arm64/sdk.framework/${config.iosLibTargetName}`;
    await $`install_name_tool -id @rpath/sdk.framework/${config.iosLibTargetName} generated/${config.xcframework}/ios-arm64/sdk.framework/${config.iosLibTargetName}`;

    await $`cp target/${targetArchs[0]}/${finalProfile}/${config.iosLibName} generated/${config.xcframework}/ios-arm64_x86_64-simulator/sdk.framework/${config.iosLibTargetName}`;
    await $`install_name_tool -id @rpath/sdk.framework/${config.iosLibTargetName} generated/${config.xcframework}/ios-arm64_x86_64-simulator/sdk.framework/${config.iosLibTargetName}`;
  }

  console.log(`\x1b[32mPackaging Done!\x1b[0m`);
}

async function copyToFinalDestination() {
  await $`cp -r generated/include/${config.header} opacity-ios/src/objc/`;
  await $`rm -rf opacity-ios/${config.xcframework}`;
  await $`cp -r generated/${config.xcframework} opacity-ios/`;
}

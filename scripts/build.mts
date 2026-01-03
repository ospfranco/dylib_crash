import { buildIOS } from "./build.ios.mts";
import { buildAndroid } from "./build.android.mts";
import { clean } from "./build.clean.mts";
import { Command } from "commander";

// Create a new command instance
const program = new Command();

program
  .name("build")
  .description("Build the Opacity SDK for target platforms")
  .version("1.0.0")
  .argument("<targetOS>", "Target OS: ios or android")
  .argument("<profile>", "Build profile: debug or release")
  .option(
    "-a, --archs <architectures>",
    "Target architectures (comma-separated)"
  )
  .option(
    "-f, --features <features>",
    "Cargo features to enable (comma-separated)"
  )
  .action(
    async (
      targetOS: string,
      profile: string,
      options: { archs?: string; features?: string }
    ) => {
      // Validate target OS
      if (targetOS !== "ios" && targetOS !== "android") {
        console.error("Invalid target OS. Please provide 'ios' or 'android'");
        process.exit(1);
      }

      // Validate profile
      if (profile !== "debug" && profile !== "release") {
        console.error("Invalid profile. Please provide 'debug' or 'release'");
        process.exit(1);
      }

      console.log(`targetOS: ${targetOS}`);

      // Get target architectures
      let targetArch = options.archs;
      if (!targetArch) {
        if (targetOS === "ios") {
          targetArch =
            "x86_64-apple-ios,aarch64-apple-ios,aarch64-apple-ios-sim";
        } else {
          targetArch =
            "aarch64-linux-android,armv7-linux-androideabi,x86_64-linux-android,i686-linux-android";
        }
      }

      // Parse the target architectures as a comma separated string
      const targetArchs = targetArch.split(",");

      // Validate architectures for iOS
      if (targetOS === "ios") {
        for (const arch of targetArchs) {
          if (
            arch !== "x86_64-apple-ios" &&
            arch !== "aarch64-apple-ios" &&
            arch !== "aarch64-apple-ios-sim"
          ) {
            console.error("Invalid target architecture for iOS");
            process.exit(1);
          }
        }
      }

      // Validate architectures for Android
      if (targetOS === "android") {
        for (const arch of targetArchs) {
          if (
            arch !== "aarch64-linux-android" &&
            arch !== "armv7-linux-androideabi" &&
            arch !== "x86_64-linux-android" &&
            arch !== "i686-linux-android"
          ) {
            console.error("Invalid target architecture for Android");
            process.exit(1);
          }
        }
      }

      await clean();

      // Get features parameter
      const features = options.features;

      if (targetOS === "ios") {
        await buildIOS(profile, targetArchs);
      } else if (targetOS === "android") {
        await buildAndroid(profile, targetArchs, features);
      }
    }
  );

// Parse command line arguments
program.parse();

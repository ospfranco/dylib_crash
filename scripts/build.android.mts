import { $ } from "bun";
import { config } from "./build.config.mts";
import { notify } from "./build.notify.mts";

function mapCargoArchToAndroidArch(arch: string) {
  switch (arch) {
    case "aarch64-linux-android":
      return "arm64-v8a";
    case "armv7-linux-androideabi":
      return "armeabi-v7a";
    case "x86_64-linux-android":
      return "x86_64";
    case "i686-linux-android":
      return "x86";
    default:
      throw new Error(`Unsupported arch: ${arch}`);
  }
}

export async function buildAndroid(
  profile: string,
  targetArchs: string[],
  features?: string
) {
  console.log(
    `🟦 Profile: ${profile} and target archs: ${targetArchs}${
      features ? ` and features: ${features}` : ""
    }`
  );
  const isLinux = process.platform === "linux";
  const ndkArch = isLinux ? "linux-x86_64" : "darwin-x86_64";
  const rustFlags = `-Clink-arg=-Wl,-zmax-page-size=16384`;

  // Get the actual NDK path from environment
  const androidNdkHome = process.env.ANDROID_NDK_HOME;
  if (!androidNdkHome) {
    throw new Error("ANDROID_NDK_HOME environment variable is not set");
  }

  const bindgenArgs = `--sysroot=${androidNdkHome}/toolchains/llvm/prebuilt/${ndkArch}/sysroot`;

  for (const arch of targetArchs) {
    const command = [
      "cargo",
      "ndk",
      "--target",
      arch,
      "--platform=31",
      "build",
      "--lib",
      "-p",
      config.crate,
      "--color=always",
      ...(profile === "release" ? ["--profile", "lib"] : []),
    ];

    // Add features as separate arguments if provided
    if (features) {
      command.push("--features", features);
    }

    await $`${command}`.env({
      ...process.env,
      RUSTFLAGS: rustFlags,
      BINDGEN_EXTRA_CLANG_ARGS: bindgenArgs,
    });
  }

  console.log(`🟩 Crate compilation done! Packaging SDK for Android`);

  await copyToFinalDestination(profile, targetArchs);

  await notify("Opacity SDK compiled for Android");
}

export async function copyToFinalDestination(
  profile: string,
  targetArchs: string[]
) {
  await $`mkdir -p opacity-android/OpacityCore/src/main/jni/include`;
  await $`cp -f generated/include/${config.header} opacity-android/OpacityCore/src/main/jni/include/${config.header}`;
  // clear old folder
  await $`rm -rf opacity-android/OpacityCore/src/main/jniLibs`;
  for (const arch of targetArchs) {
    const rustArch = mapCargoArchToAndroidArch(arch);
    await $`mkdir -p opacity-android/OpacityCore/src/main/jniLibs/${rustArch}`;
    await $`cp -f target/${arch}/${profile == "release" ? "lib" : "debug"}/${
      config.androidLibName
    } opacity-android/OpacityCore/src/main/jniLibs/${rustArch}/${
      config.androidLibName
    }`;
  }

  console.log(`🟩 Copying done!`);
}

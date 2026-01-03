import { $ } from "bun";

export async function notify(message: string) {
  if (process.env.CI) {
    // Don't notify in CI environments
    return;
  }

  // Check if running on macOS
  const platform = process.platform;
  if (platform === "darwin") {
    // Use osascript to show a notification
    await $`osascript -e 'display notification "${message}" with title "Opacity SDK" sound name "Glass"'`;
  } else {
    // Fallback for other platforms
    $`echo 🟦 ${message}`;
  }
}

# Reproducible example for symbol crash

The purpose of this example is to show how xcode strips a global C function exposed in library code even though it is marked as visible and used via C attribute tags. Then a dylib loads on runtime and tries to call this function and promptly crashes.

```c
#ifdef __cplusplus
#define DYLIB_EXPORT                                                           \
  extern "C" __attribute__((visibility("default"))) __attribute__((used))
#else
#define DYLIB_EXPORT                                                           \
  __attribute__((visibility("default"))) __attribute__((used))
#endif

DYLIB_EXPORT bool say_hello_world();
```

# Running

I would suggest to use mise to install the deps:

You need:
```
mise // install the necessary toolchains
bun // Typescript is used a build scripts
rust // Builds the dylib, doesn't really do anything just replicates our production env
xcode
```

Then build the iOS dylib:

```
mise trust
mise install
bun i
mise build ios debug
```

This scripts will put all the correct binaries, .xcframeworks and .frameworks in the correct locations inside the `opacity-ios/spm_example` folder. If you have installed manually then calling the build script via bun should work:

```
bun ./scripts/build.mts ios debug
```

Then in Xcode, you can just run the app via Xcode. You should see a success message on the simulator and on the console a message that says:

```
Hello WORLD 🟢!
```

Then `archive` the app, then export for `debugging` and install on a real device via drag and drop. The app will now crash because it cannot call the `say_hello_world` C function. Some sort of stripping happens only when creating a distributable executable.

# Relevant notes

There is a `exported_symbols.txt` in the `opacity-ios` folder that is supposed to specify all the exported symbols from the ios library code. I did not find any way to specify this file in the compilation process of the app.

On the Rust compilation no dynamic lookup is used and this file is read to let the lib compile:

```rust
// on build.rs
 let symbols_path = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/../opacity-ios/exported_symbols.txt"
);
let symbols =
    std::fs::read_to_string(symbols_path).expect("Failed to read iOS exported symbols");
for symbol in symbols.lines().filter(|s| !s.is_empty()) {
    println!("cargo:rustc-link-arg=-Wl,-U,{}", symbol.trim());
}
```

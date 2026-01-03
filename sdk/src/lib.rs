unsafe extern "C" {
    fn say_hello_world() -> bool;
}

#[unsafe(no_mangle)]
extern "C" fn opacity_init() -> i32 {
    unsafe {
        say_hello_world();
    }
    return 0;
}

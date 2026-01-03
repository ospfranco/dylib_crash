#ifdef __cplusplus
#define DYLIB_EXPORT                                                           \
  extern "C" __attribute__((visibility("default"))) __attribute__((used))
#else
#define DYLIB_EXPORT                                                           \
  __attribute__((visibility("default"))) __attribute__((used))
#endif

DYLIB_EXPORT bool say_hello_world();

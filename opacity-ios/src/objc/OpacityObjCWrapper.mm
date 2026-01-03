#import "OpacityObjCWrapper.h"
#import "helper_functions.h"
#import "sdk.h"

@implementation OpacityObjCWrapper

+ (int)initialize {
  NSBundle *frameworkBundle =
      [NSBundle bundleWithIdentifier:@"com.opacitylabs.sdk"];
  if (![frameworkBundle isLoaded]) {
    BOOL success = [frameworkBundle load];
    if (!success) {
      return -1;
    }

    int status = opacity_core::opacity_init();
    return status;
  }

  return 0;
}

@end

#if SWIFT_PACKAGE
  import OpacityCoreObjc
#endif

public class OpacitySwiftWrapper {

  public static func initialize() throws {
    let status = OpacityObjCWrapper.initialize()

    if status != 0 {
      throw OpacityError(code: "UnkownError", message: "Unknown Error Initializing Opacity SDK")
    }
  }

}

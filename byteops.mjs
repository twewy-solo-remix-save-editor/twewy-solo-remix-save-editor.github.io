export function getTypeByteLength(type) {
  switch (type.toLowerCase()) {
    case "uint8": case "int8": return 1;
    case "uint16": case "int16": return 2;
    case "uint32": case "int32": case "float32": return 4;
    case "float64": return 8;
    default: throw new Error("Unknown type: " + type);
  }
}

export function byteArrayAsHexString(byteArray /*Uint8Array*/) {
  const byteToHex = Array(256);
  for (let n = 0; n <= 255; ++n) byteToHex[n] = n.toString(16).padStart(2, "0");
  const hexBytes = Array(byteArray.length).map((e,i)=>byteToHex[byteArray[i]])
  // for (let i = 0; i < byteArray.length; ++i) hexBytes[i] = byteToHex[byteArray[i]]
  // hexBytes.map((e,i) => byteToHex[byteArray[i])
  return hexBytes.join("")
}

export function byteArraysAreEqual(byteArrayA, byteArrayB) {
  return byteArrayA.every((e,i) => e == byteArrayB[i])
}
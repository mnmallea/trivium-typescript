import { UInt8 } from "bitwise/types";
import * as trivium from "./trivium";
import bitwise, { buffer, string } from "bitwise";
import * as utils from "./utils";

export function cipher(data: Buffer, key: string, iv: string): Buffer {
  if (key.length !== 10 || iv.length !== 10) {
    throw new TypeError("Key and IV length should be 10");
  }

  const keyBitarray = utils.toBitarray(key);
  const ivBitarray = utils.toBitarray(iv);

  let state = trivium.initializeInternalState(keyBitarray, ivBitarray);

  const cipherBuffer = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i++) {
    const dataByte = data.readUInt8(i) as UInt8;
    const { state: newState, byte: cipherByte } = trivium.nextByte(state);
    state = newState;
    cipherBuffer.writeUInt8(cipherByte ^ dataByte, i);
  }

  return cipherBuffer;
}
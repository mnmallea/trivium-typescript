import { UInt8, Bit } from "bitwise/types";
import * as trivium from "./trivium";
import * as utils from "./utils";

export function encryptBuffer(buffer: Buffer, state: trivium.Bitarray, length: number = buffer.length): void {
  for (let i = 0; i < length; i++) {
    const dataByte = buffer.readUInt8(i) as UInt8;
    const cipherByte = trivium.nextByte(state);
    buffer.writeUInt8(cipherByte ^ dataByte, i);
  }
}

export function buildInternalState(key: string, iv: string): trivium.Bitarray {
  if (key.length !== 10 || iv.length !== 10) {
    throw new TypeError("Key and IV length should be 10");
  }

  const keyBitarray = utils.toBitarray(key);
  const ivBitarray = utils.toBitarray(iv);

  return trivium.initializeInternalState(keyBitarray, ivBitarray);
}
import { UInt8, Bit } from "bitwise/types";
import * as trivium from "./trivium";
import * as utils from "./utils";

export function encryptBuffer(data: Buffer, state: trivium.Bitarray): Buffer {
  const cipherBuffer = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i++) {
    const dataByte = data.readUInt8(i) as UInt8;
    const cipherByte = trivium.nextByte(state);
    cipherBuffer.writeUInt8(cipherByte ^ dataByte, i);
  }

  return cipherBuffer;
}

export function buildInternalState(key: string, iv: string): trivium.Bitarray {
  if (key.length !== 10 || iv.length !== 10) {
    throw new TypeError("Key and IV length should be 10");
  }

  const keyBitarray = utils.toBitarray(key);
  const ivBitarray = utils.toBitarray(iv);

  return trivium.initializeInternalState(keyBitarray, ivBitarray);
}
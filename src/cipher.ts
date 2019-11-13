import { UInt8, Bit } from "bitwise/types";
import * as trivium from "./trivium";
import * as utils from "./utils";
import stream from "stream";

export function encryptChunkToStream(chunk: Buffer, output: stream.Writable, state: trivium.Bitarray, length: number = chunk.length): void {
  for (let i = 0; i < length; i++) {
    const dataByte = chunk.readUInt8(i) as UInt8;
    const cipherByte = trivium.nextByte(state);
    output.write(Uint8Array.of(cipherByte ^ dataByte));
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
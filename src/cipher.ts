import { UInt8 } from "bitwise/types";
import * as trivium from "./trivium";
import bitwise, { buffer, string } from "bitwise";

function toBitarray(string: string): trivium.Bitarray {
  const buffer = Buffer.from(string);
  return bitwise.buffer.read(buffer, 80);
}

export function cipher(data: Buffer, key: string, iv: string): Buffer {
  if (key.length !== 10 && iv.length !== 10) {
    throw new TypeError("Key and IV length should be 10");
  }
  let state = trivium.initializeInternalState(toBitarray(key), toBitarray(iv));

  const cipherBuffer = new Buffer(data.length);

  for (let i = 0; i < data.length; i++) {
    const dataByte = data.readUInt8(i) as UInt8;
    const { state: newState, byte } = trivium.nextByte(state);
    state = newState;
    const dataArray = bitwise.byte.read(dataByte as UInt8);
    const byteArray = bitwise.byte.read(byte);

    const number = bitwise.bits.xor(dataArray, byteArray);

    cipherBuffer.writeUInt8(bitwise.byte.write(number as any), i);
  }

  return cipherBuffer;
}
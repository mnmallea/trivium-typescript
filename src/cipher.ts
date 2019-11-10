import { UInt8 } from "bitwise/types";
import * as trivium from './trivium';
import bitwise, { buffer, string } from "bitwise";

function toBitarray(string: string): trivium.Bitarray {
  const buffer = Buffer.from(string);
  return bitwise.buffer.read(buffer, 80);
}

export function cipher(data: Buffer, key: string, iv: string): Buffer {
  if (key.length !== 80 && iv.length !== 80) {
    throw new TypeError('Key and IV length should be 80');
  }
  var state = trivium.initializeInternalState(toBitarray(key), toBitarray(iv));

  const cipherBuffer = new Buffer(data.length);

  for (let i = 0; i < data.length; i++) {
    let dataByte = data.readUInt8(i) as UInt8;
    let { state: newState, byte } = trivium.nextByte(state);
    state = newState;
    let dataArray = bitwise.byte.read(dataByte as UInt8);
    let byteArray = bitwise.byte.read(byte);

    let number = bitwise.bits.xor(dataArray, byteArray);

    cipherBuffer.writeUInt8(bitwise.byte.write(number as any), i);
  }

  return cipherBuffer;
}
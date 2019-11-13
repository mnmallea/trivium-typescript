import * as bitwise from "bitwise";
import { Bitarray } from "./trivium";

export function toBitarray(string: string): Bitarray {
  const buffer = Buffer.from(string);
  return bitwise.buffer.read(buffer);
}
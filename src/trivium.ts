import bitwise from "bitwise";
import { UInt8 } from "bitwise/types";

export type Bitarray = Array<Bit>;
export type Bit = 0 | 1;

export function fillInternalState(key: Bitarray, initializationVector: Bitarray): Bitarray {
  const state: Bitarray = [];

  for (let i = 0; i < 80; i++) {
    state.push(key[i]);
  }

  for (let i = 80; i < 93; i++) {
    state.push(0);
  }

  for (let i = 93, j = 0; i < 177; i++ , j++) {
    if (j < 80) {
      state.push(initializationVector[j]);
    } else {
      state.push(0);
    }
  }

  for (let i = 177; i < 285; i++) {
    state.push(0);
  }

  for (let i = 285; i < 288; i++) {
    state.push(1);
  }

  return state;
}

export function shiftAndReplace(state: Bitarray, replace: Bit, start: number, end: number) {
  for (let i = end - 1; i >= start; i--) {
    if (i == start) {
      state[i] = replace;
    } else {
      state[i] = state[i - 1];
    }
  }
}

export function initializeInternalState(key: Bitarray, initializationVector: Bitarray): Bitarray {
  const state: Bitarray = fillInternalState(key, initializationVector);

  for (let i = 1; i < 4 * 288; i++) {
    const t1 = state[65] ^ (state[90] & state[91]) ^ state[92] ^ state[170];
    const t2 = state[161] ^ (state[174] & state[175]) ^ state[176] ^ state[263];
    const t3 = state[242] ^ (state[285] & state[286]) ^ state[287] ^ state[68];

    shiftAndReplace(state, t3 as Bit, 0, 93);
    shiftAndReplace(state, t1 as Bit, 93, 177);
    shiftAndReplace(state, t2 as Bit, 177, 288);
  }

  return state;
}

function nextState(state: Bitarray): Bit {
  let t1 = state[65] ^ state[92];
  let t2 = state[161] ^ state[176];
  let t3 = state[242] ^ state[287];

  const key = (t1 ^ t2 ^ t3) as Bit;

  t1 = t1 ^ (state[90] & state[91]) ^ state[170];
  t2 = t2 ^ (state[174] & state[175]) ^ state[263];
  t3 = t3 ^ (state[285] & state[286]) ^ state[68];

  shiftAndReplace(state, t3 as Bit, 0, 93);
  shiftAndReplace(state, t1 as Bit, 93, 177);
  shiftAndReplace(state, t2 as Bit, 177, 288);

  return key;
}

export function nextByte(state: Bitarray): UInt8 {
  const byte: Bitarray = new Array(8);

  for (let i = 1; i < 8; i++) {
    const key = nextState(state);
    byte[i] = key;
  }

  return bitwise.byte.write(byte as any);
}
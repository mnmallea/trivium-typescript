import bitwise from "bitwise";
import { UInt8 } from "bitwise/types";

export type Bitarray = Array<Bit>;
export type Bit = 0 | 1;

function xor(...bits: Bitarray): Bit {
  return bitwise.bits.reduceXor(bits);
}

function and(...bits: Bitarray): Bit {
  return bitwise.bits.reduceAnd(bits);
}

function fillInternalState(key: Bitarray, initializationVector: Bitarray): Bitarray {
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

  const ret = state;

  return ret;
}

function shiftAndReplace(state: Bitarray, replace: Bit, start: number, end: number) {
  for (let i = start; i < end; i++) {
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
    const t1 = xor(state[65], and(state[90], state[91]), state[92], state[170]);
    const t2 = xor(state[161], and(state[174], state[175]), state[176], state[263]);
    const t3 = xor(state[242], and(state[285], state[286]), state[287], state[68]);

    shiftAndReplace(state, t3, 0, 93);
    shiftAndReplace(state, t1, 93, 177);
    shiftAndReplace(state, t2, 177, 288);
  }

  return state;
}

function nextState(state: Bitarray): { state: Bitarray; key: Bit } {
  const newState = Array.from(state);

  let t1 = xor(state[65], state[92]);
  let t2 = xor(state[161], state[176]);
  let t3 = xor(state[242], state[287]);

  const key = xor(t1, t2, t3);

  t1 = xor(t1, and(state[90], state[91]), state[170]);
  t2 = xor(t2, and(state[174], state[175]), state[263]);
  t3 = xor(t3, and(state[285], state[286]), state[68]);

  shiftAndReplace(newState, t3, 0, 93);
  shiftAndReplace(newState, t1, 93, 177);
  shiftAndReplace(newState, t2, 177, 288);

  return { key, state: newState };
}

export function nextByte(state: Bitarray): { state: Bitarray; byte: UInt8 } {
  let current = state;
  const byte: Bitarray = new Array(8);

  for (let i = 1; i < 8; i++) {
    const { state: newState, key } = nextState(current);
    current = newState;
    byte[i] = key;
  }

  return { byte: bitwise.byte.write(byte as any), state: current };
}
import * as bitwise from "bitwise";

type Bitarray = Array<Bit>;
type Bit = 0 | 1;

export function xor(...bits: Bitarray): Bit {
  return bits.reduce((previous, current) => {
    return bitwise.bits.xor([previous], [current])[0];
  });
}

export function and(...bits: Bitarray): Bit {
  return bits.every((b) => b === 1) ? 1 : 0;
}

function fillInternalState(key: Bitarray, initializationVector: Bitarray, state: Bitarray): void {
  for (let i = 0; i < 93; i++) {
    if (i < 80) {
      state.push(key[i]);
    } else {
      state.push(0);
    }
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
  const state: Bitarray = [];

  fillInternalState(key, initializationVector, state);

  console.log(state.length);

  for (let i = 1; i < 4 * 288; i++) {
    const t1 = xor(state[65], and(state[90], state[91]), state[92], state[170]);
    const t2 = xor(state[161], and(state[174], state[175]), state[176], state[263]);
    const t3 = xor(state[242], and(state[285], state[286]), state[287], state[68]);

    shiftAndReplace(state, t3, 0, 93);
    shiftAndReplace(state, t1, 93, 177);
    shiftAndReplace(state, t2, 177, 288);
  }

  state.forEach(console.log);
  return state;
}

export function encrypt(data: Buffer, key: Bitarray, initializationVector: Bitarray): Buffer {
  const internalState = initializeInternalState(key, initializationVector);
  throw ":(";
}

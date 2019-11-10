import * as trivium from "../src/trivium";
import * as utils from "../src/utils";
import * as faker from "faker";
import { Bit } from "bitwise/types";

describe("trivium tests", () => {
  describe("#fillInternalState", () => {
    const key = faker.random.uuid().slice(0, 10);
    const iv = faker.random.uuid().slice(0, 10);

    const keyArray = utils.toBitarray(key);
    const ivArray = utils.toBitarray(iv);

    test("puts key in correct position", () => {
      const result = trivium.fillInternalState(keyArray, ivArray);
      expect(result.slice(0, 80)).toEqual(keyArray);
    });

    test("puts iv in correct position", () => {
      const result = trivium.fillInternalState(keyArray, ivArray);
      expect(result.slice(93, 173)).toEqual(ivArray);
    });

    test("ends with 1, 1, 1", () => {
      const result = trivium.fillInternalState(keyArray, ivArray);
      expect(result.slice(285, 288)).toEqual([1, 1, 1]);
    });

    test("fills expected sections with 0", () => {
      const result = trivium.fillInternalState(keyArray, ivArray);
      expect(result.slice(80, 92).every((b) => b == 0)).toBe(true);
      expect(result.slice(173, 177).every((b) => b == 0)).toBe(true);
    });

    test("returns an array with 288 elements", () => {
      const result = trivium.fillInternalState(keyArray, ivArray);
      expect(result.length).toBe(288);
    });
  });

  describe("#shiftAndReplace", () => {
    const initialState = Object.freeze(utils.toBitarray(faker.random.uuid().slice(0, 4)));
    const start = 10, end = 20;
    const replace = [0, 1][Math.floor(Math.random() * 2)] as Bit;

    test("replaces value at expected position", () => {
      const newState = Array.from(initialState);
      trivium.shiftAndReplace(newState, replace, start, end);
      expect(newState[start]).toBe(replace);
    });

    test("shifts expected items", () => {
      const newState = Array.from(initialState);
      const shiftItems = initialState.slice(10, 19);
      trivium.shiftAndReplace(newState, replace, start, end);
      expect(newState.slice(11, 20)).toEqual(shiftItems);
    });

    test("keeps rest of array untouched", () => {
      const newState = Array.from(initialState);
      trivium.shiftAndReplace(newState, replace, start, end);
      expect(newState.slice(0, 10)).toEqual(initialState.slice(0, 10));
      expect(newState.slice(20, 32)).toEqual(initialState.slice(20, 32));
    });
  });
});
import * as trivium from '../src/trivium';
import * as utils from '../src/utils';
import * as faker from 'faker';

describe('trivium tests', () => {
  describe('#fillInternalState', () => {
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
  })
});
import Constituent, { extendedDoodson, sortedDoodson } from '../constituent'
import astro from '../../astronomy'

const sampleTime = new Date()
sampleTime.setFullYear(2019)
sampleTime.setMonth(9)
sampleTime.setDate(4)
sampleTime.setHours(10)
sampleTime.setMinutes(15)
sampleTime.setSeconds(40)
sampleTime.setMilliseconds(10)

const testAstro = astro(sampleTime)

// This is a made-up doodson number for a test coefficient
const testConstituent = new Constituent('test', 'A AYZ ZZA')

describe('constituent', () => {
  test('it throws error if missing coefficients', () => {
    let errorMessage = false
    try {
      const a = new Constituent('fail') // eslint-disable-line
    } catch (error) {
      errorMessage = error
    }
    expect(errorMessage.message).toBe(
      'Doodson or coefficient must be defined for a constituent'
    )
  })

  test('it sorts Doodson numbers', () => {
    expect(extendedDoodson.K).toBe(11)
    expect(sortedDoodson[11]).toBe('K')
  })

  test('it converts Doodson numbers to cooeficient', () => {
    const testCooefficient = new Constituent('test', null, [])
    const coefficient = testCooefficient.doodsonNumberToCooeficient('A BZY ZZY')
    expect(coefficient).toEqual(expect.arrayContaining([1, 2, 0, -1, 0, 0, -1]))
  })

  test('it converts cooeficient to Doodson number', () => {
    const testCooefficient = new Constituent('test', null, [])
    const doodsonNumber = testCooefficient.cooeficientToDoodsonNumber([
      1,
      2,
      0,
      -1,
      0,
      0,
      -1
    ])
    expect(doodsonNumber).toEqual('ABZYZZY')
  })

  test('it creates cooeficient hashes', () => {
    const testCooefficient = new Constituent('test', null, [
      1,
      2,
      0,
      -1,
      0,
      0,
      -1
    ])
    const hash = testCooefficient.hash()
    expect(hash).toEqual('120m100m1')
  })

  test('it fetches astronimic Doodson Number values', () => {
    const values = testConstituent.astronimicDoodsonNumber(testAstro)
    expect(values[0].value).toBe(testAstro['T+h-s'].value)
  })

  test('it fetches astronimic speed', () => {
    const values = testConstituent.astronomicSpeed(testAstro)
    expect(values[0]).toBe(testAstro['T+h-s'].speed)
  })

  test('it fetches astronimic values', () => {
    const values = testConstituent.astronomicValues(testAstro)
    expect(values[0]).toBe(testAstro['T+h-s'].value)
  })

  test('it computes constituent value', () => {
    expect(testConstituent.value(testAstro)).toBeCloseTo(423.916666657, 4)
  })

  test('it compares different constituents', () => {
    const secondConstituent = new Constituent('test the same', 'A AYZ ZZA')
    const thirdConstituent = new Constituent('test different', 'A ZYZ ZZA')
    expect(testConstituent.isEqual(secondConstituent)).toBeTruthy()
    expect(testConstituent.isEqual(thirdConstituent)).toBeFalsy()
  })

  test('it computes constituent speed', () => {
    expect(testConstituent.speed(testAstro)).toBe(15)
  })

  test('it returns u correctly', () => {
    expect(testConstituent.u(testAstro)).toBe(0)
  })

  test('it returns f correctly', () => {
    expect(testConstituent.f(testAstro)).toBe(1)
  })
})

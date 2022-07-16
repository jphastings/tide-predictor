import assert from 'assert'
import closeTo from '../lib/close-to.js'
import compoundConstituent from '../../src/constituents/compound-constituent.js'
import Constituent from '../../src/constituents/constituent.js'
import astro from '../../src/astronomy/index.js'

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
const testConstituentA = Constituent('testa', [1, 1, -1, 0, 0, 0, 1])
const testConstituentB = Constituent('testb', [0, 1, -1, 0, 0, 0, 1])

const compoundTest = compoundConstituent('test compound', [
  { constituent: testConstituentA, factor: 1 },
  { constituent: testConstituentB, factor: -1 }
])
describe('compund constituent', () => {
  it('it calculates compound coefficients', () => {
    assert.deepStrictEqual(compoundTest.coefficients, [1, 0, 0, 0, 0, 0, 0])
  })

  it('it calculates speed', () => {
    closeTo(compoundTest.speed(testAstro), 14.4920521208, 4)
  })

  it('it calculates value', () => {
    closeTo(compoundTest.value(testAstro), 268.504355062, 4)
  })

  it('it returns u correctly', () => {
    assert.ok(compoundTest.u(testAstro) === 0)
  })

  it('it returns f correctly', () => {
    assert.ok(compoundTest.f(testAstro) === 1)
  })
})

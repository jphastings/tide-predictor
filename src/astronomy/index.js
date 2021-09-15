import { d2r, r2d } from './constants'
import coefficients from './coefficients'

// Evaluates a polynomial at argument
const polynomial = (coefficients, argument) => {
  const result = []
  coefficients.forEach((coefficient, index) => {
    result.push(coefficient * Math.pow(argument, index))
  })
  return result.reduce((a, b) => {
    return a + b
  })
}

// Evaluates a derivative polynomial at argument
const derivativePolynomial = (coefficients, argument) => {
  const result = []
  coefficients.forEach((coefficient, index) => {
    result.push(coefficient * index * Math.pow(argument, index - 1))
  })
  return result.reduce((a, b) => {
    return a + b
  })
}

// Meeus formula 11.1
const T = (t) => {
  return (JD(t) - 2451545.0) / 36525
}

// Meeus formula 7.1
const JD = (t) => {
  let Y = t.getFullYear()
  let M = t.getMonth() + 1
  const D =
    t.getDate() +
    t.getHours() / 24.0 +
    t.getMinutes() / (24.0 * 60.0) +
    t.getSeconds() / (24.0 * 60.0 * 60.0) +
    t.getMilliseconds() / (24.0 * 60.0 * 60.0 * 1e6)
  if (M <= 2) {
    Y = Y - 1
    M = M + 12
  }
  const A = Math.floor(Y / 100.0)
  const B = 2 - A + Math.floor(A / 4.0)
  return (
    Math.floor(365.25 * (Y + 4716)) +
    Math.floor(30.6001 * (M + 1)) +
    D +
    B -
    1524.5
  )
}

/**
 * @todo - What's  with the array returned from the arccos?
 * @param {*} N
 * @param {*} i
 * @param {*} omega
 */
const _I = (N, i, omega) => {
  N = d2r * N
  i = d2r * i
  omega = d2r * omega
  const cosI =
    Math.cos(i) * Math.cos(omega) - Math.sin(i) * Math.sin(omega) * Math.cos(N)
  return r2d * Math.acos(cosI)
}

const _xi = (N, i, omega) => {
  N = d2r * N
  i = d2r * i
  omega = d2r * omega
  let e1 =
    (Math.cos(0.5 * (omega - i)) / Math.cos(0.5 * (omega + i))) *
    Math.tan(0.5 * N)
  let e2 =
    (Math.sin(0.5 * (omega - i)) / Math.sin(0.5 * (omega + i))) *
    Math.tan(0.5 * N)
  e1 = Math.atan(e1)
  e2 = Math.atan(e2)
  e1 = e1 - 0.5 * N
  e2 = e2 - 0.5 * N
  return -(e1 + e2) * r2d
}

const _nu = (N, i, omega) => {
  N = d2r * N
  i = d2r * i
  omega = d2r * omega
  let e1 =
    (Math.cos(0.5 * (omega - i)) / Math.cos(0.5 * (omega + i))) *
    Math.tan(0.5 * N)
  let e2 =
    (Math.sin(0.5 * (omega - i)) / Math.sin(0.5 * (omega + i))) *
    Math.tan(0.5 * N)
  e1 = Math.atan(e1)
  e2 = Math.atan(e2)
  e1 = e1 - 0.5 * N
  e2 = e2 - 0.5 * N
  return (e1 - e2) * r2d
}

// Schureman equation 224
const _nup = (N, i, omega) => {
  const I = d2r * _I(N, i, omega)
  const nu = d2r * _nu(N, i, omega)
  return (
    r2d *
    Math.atan(
      (Math.sin(2 * I) * Math.sin(nu)) /
        (Math.sin(2 * I) * Math.cos(nu) + 0.3347)
    )
  )
}

// Schureman equation 232
const _nupp = (N, i, omega) => {
  const I = d2r * _I(N, i, omega)
  const nu = d2r * _nu(N, i, omega)
  const tan2nupp =
    (Math.sin(I) ** 2 * Math.sin(2 * nu)) /
    (Math.sin(I) ** 2 * Math.cos(2 * nu) + 0.0727)
  return r2d * 0.5 * Math.atan(tan2nupp)
}

const modulus = (a, b) => {
  return ((a % b) + b) % b
}

const astro = (time) => {
  const result = {}
  const polynomials = {
    s: coefficients.lunarLongitude,
    h: coefficients.solarLongitude,
    p: coefficients.lunarPerigee,
    N: coefficients.lunarNode,
    pp: coefficients.solarPerigee,
    90: [90.0],
    omega: coefficients.terrestrialObliquity,
    i: coefficients.lunarInclination,
  }

  // Polynomials are in T, that is Julian Centuries; we want our speeds to be
  // in the more convenient unit of degrees per hour.
  const dTdHour = 1 / (24 * 365.25 * 100)
  Object.keys(polynomials).forEach((name) => {
    result[name] = {
      value: modulus(polynomial(polynomials[name], T(time)), 360.0),
      speed: derivativePolynomial(polynomials[name], T(time)) * dTdHour,
    }
  })

  // Some other parameters defined by Schureman which are dependent on the
  // parameters N, i, omega for use in node factor calculations. We don't need
  // their speeds.
  const functions = {
    I: _I,
    xi: _xi,
    nu: _nu,
    nup: _nup,
    nupp: _nupp,
  }
  Object.keys(functions).forEach((name) => {
    const functionCall = functions[name]
    result[name] = {
      value: modulus(
        functionCall(result.N.value, result.i.value, result.omega.value),
        360.0
      ),
      speed: null,
    }
  })

  // We don't work directly with the T (hours) parameter, instead our spanning
  // set for equilibrium arguments #is given by T+h-s, s, h, p, N, pp, 90.
  // This is in line with convention.
  const hour = {
    value: (JD(time) - Math.floor(JD(time))) * 360.0,
    speed: 15.0,
  }

  result['T+h-s'] = {
    value: hour.value + result.h.value - result.s.value,
    speed: hour.speed + result.h.speed - result.s.speed,
  }

  // It is convenient to calculate Schureman's P here since several node
  // factors need it, although it could be argued that these
  // (along with I, xi, nu etc) belong somewhere else.
  result.P = {
    value: result.p.value - (result.xi.value % 360.0),
    speed: null,
  }

  return result
}

export default astro
export { polynomial, derivativePolynomial, T, JD, _I, _xi, _nu, _nup, _nupp }

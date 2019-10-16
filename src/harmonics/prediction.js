import astro from '../astronomy/index'
import { d2r } from '../astronomy/constants'

const modulus = (a, b) => {
  return ((a % b) + b) % b
}

const predictionFactory = ({
  timeline,
  constituents,
  start,
  extremeLabels
}) => {
  const getExtremeLabel = label => {
    if (
      typeof extremeLabels !== 'undefined' &&
      typeof extremeLabels[label] !== 'undefined'
    ) {
      return extremeLabels[label]
    }
    const labels = {
      high: 'High',
      low: 'Low'
    }
    return labels[label]
  }

  const getLevel = (hour, modelBaseSpeed, modelU, modelF, modelBaseValue) => {
    const amplitudes = []
    let result = 0

    constituents.forEach(constituent => {
      const amplitude = constituent.amplitude
      const phase = constituent._phase
      const f = modelF[constituent.name]
      const speed = modelBaseSpeed[constituent.name]
      const u = modelU[constituent.name]
      const V0 = modelBaseValue[constituent.name]
      amplitudes.push(amplitude * f * Math.cos(speed * hour + (V0 + u) - phase))
    })
    // sum up each row
    amplitudes.forEach(item => {
      result += item
    })
    return result
  }

  const prediction = {}

  prediction.getExtremesPrediction = () => {
    const results = []
    const { baseSpeed, u, f, baseValue } = prepare()
    let goingUp = false
    let goingDown = false
    let lastLevel = getLevel(0, baseSpeed, u[0], f[0], baseValue)
    timeline.items.forEach((time, index) => {
      const hour = timeline.hours[index]
      const level = getLevel(hour, baseSpeed, u[index], f[index], baseValue)
      // Compare this level to the last one, if we
      // are changing angle, then the last one was high or low
      if (level > lastLevel && goingDown) {
        results.push({
          time: timeline.items[index - 1],
          level: lastLevel,
          high: false,
          low: true,
          label: getExtremeLabel('low')
        })
      }
      if (level < lastLevel && goingUp) {
        results.push({
          time: timeline.items[index - 1],
          level: lastLevel,
          high: true,
          low: false,
          label: getExtremeLabel('high')
        })
      }
      if (level > lastLevel) {
        goingUp = true
        goingDown = false
      }
      if (level < lastLevel) {
        goingUp = false
        goingDown = true
      }
      lastLevel = level
    })
    return results
  }

  prediction.getTimelinePrediction = () => {
    const results = []
    const { baseSpeed, u, f, baseValue } = prepare()
    timeline.items.forEach((time, index) => {
      const hour = timeline.hours[index]
      const prediction = {
        time: time,
        hour: hour,
        level: getLevel(hour, baseSpeed, u[index], f[index], baseValue)
      }

      results.push(prediction)
    })
    return results
  }

  const prepare = radians => {
    radians = typeof radians !== 'undefined' ? radians : true
    const baseAstro = astro(start)

    const baseValue = {}
    const baseSpeed = {}
    const u = []
    const f = []
    constituents.forEach(constituent => {
      const value = constituent._model.value(baseAstro)
      const speed = constituent._model.speed(baseAstro)
      baseValue[constituent.name] = radians ? d2r * value : value
      baseSpeed[constituent.name] = radians ? d2r * speed : speed
    })
    timeline.items.forEach(time => {
      const uItem = {}
      const fItem = {}
      const itemAstro = astro(time)
      constituents.forEach(constituent => {
        const constituentU = modulus(constituent._model.u(itemAstro), 360)

        uItem[constituent.name] = radians ? d2r * constituentU : constituentU
        fItem[constituent.name] = modulus(constituent._model.f(itemAstro), 360)
      })
      u.push(uItem)
      f.push(fItem)
    })

    return {
      baseValue: baseValue,
      baseSpeed: baseSpeed,
      u: u,
      f: f
    }
  }

  return Object.freeze(prediction)
}

export default predictionFactory

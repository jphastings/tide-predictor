[![CircleCI](https://circleci.com/gh/neaps/tide-predictor.svg?style=svg)](https://circleci.com/gh/neaps/tide-predictor) [![Coverage Status](https://coveralls.io/repos/github/neaps/tide-predictor/badge.svg?branch=master)](https://coveralls.io/github/neaps/tide-predictor?branch=master) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fneaps%2Ftide-predictor.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fneaps%2Ftide-predictor?ref=badge_shield)

## Tide predictor

A Javascript tide harmonic calculator.

## Warning

**Do not use calculations from this project for navigation, or depend on them in any situation where inaccuracies could result to the harm of a person or property.**

This project is **very much** in-progress, and even when it is finished, it is provided with no warantee of accuracy.

Tide predictions are only as good as the harmonics data available, and these can be inconsistent and vary widely based on the accuracy of the source data and local conditions.

The tide predictions do not factor events such as storms, surge, wind waves, uplift, or sadly, climate change.

## Shout out

All the really hard math is based on the excellent [Xtide](https://flaterco.com/xtide) and [pytides](https://github.com/sam-cox/pytides).

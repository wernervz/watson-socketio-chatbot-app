'use strict'

const LOG = require('winston')

const request = require('request')
const moment = require('moment')

const whatFunctionMap = {
    'general': generalForecast,
    'precipitation': precipitationForecast,
    'thunder': thunderForecast,
    'wind': windForecast,
    'golf': golfForecast,
    'temperature': temperatureForecast,
    'outsideactivities': outsideActivitiesForecast
}

const WEATHER_URL = 'https://twcservice.mybluemix.net/api/weather/v1/geocode/'
const LOCATION_URL = 'http://twcservice.mybluemix.net/api/weather/v3/location/search'

function WeatherUtils() { }

WeatherUtils.prototype.theWeather = function (context) {

    context.weatherWhat = !context.weatherWhat ? 'general' : context.weatherWhat
    context.weatherWhen = !context.weatherWhen ? new Date() : context.weatherWhen

    if (context.weatherTime) {
        let tm = moment(context.weatherTime, 'HH:mm:ss')
        let sixpm = moment('06:00 PM', "HH:mm a")
        let noon = moment('12:00 PM', "HH:mm a")
        if (tm.isBefore(noon)) {
            context.weatherTime = 'Morning'
        } else if (tm.isBefore(sixpm)) {
            context.weatherTime = 'Afternoon'
        } else {
            context.weatherTime = null
        }
    }

    if (context.weatherActivity) {
        context.weatherWhat = 'outsideactivities'
    }

    LOG.debug('Where = ' + context.weatherWhere)
    LOG.debug('When = ' + context.weatherWhen)
    LOG.debug('What = ' + context.weatherWhat)
    LOG.debug('Time of Day = ' + context.weatherTime)

    return weatherConditionsPromise(context.weatherWhere, context.weatherWhen, context.weatherWhat, context.weatherTime).then((weather) => {
        return (weather)
    }).catch((err) => {
        LOG.error(err)
        // Respond with the error.
        return (err)
    })
}

function weatherConditionsPromise(where, when, what, time) {
    return new Promise((resolve, reject) => {
        weatherLocationPromise(where).then((geoCode) => {
            let forecastDays = getForecastDuration(when)
            let url = WEATHER_URL +
                geoCode.latitude +
                '/' +
                geoCode.longitude +
                '/forecast/daily/' + forecastDays + 'day.json'
            request.get(url, { json: true }, (err, http, weatherResponse) => {
                if (err) return reject(err)
                getMostRelevantForecast(weatherResponse.forecasts, when, time).then((forcast) => {
                    let location = geoCode.city + ', ' + geoCode.adminDistrict
                    if (whatFunctionMap[what]) {
                        whatFunctionMap[what](when, time, location, forcast).then((narrative) => resolve(narrative))
                    } else {
                        return reject('Looks like I dont know what ' + what + ' is.')
                    }
                })
            }).auth(process.env.WEATHER_API_USERNAME, process.env.WEATHER_API_PASSWORD, false)
        }, (err) => {
            LOG.error(err)
            reject(err)
        })
    })
}

function weatherLocationPromise(where) {
    return new Promise((resolve, reject) => {
        try {
            let url = LOCATION_URL +
                '?query=' + where + '&locationType=city&language=en-US'
            request.get(url, { json: true }, (err, http, locationResponse) => {
                if (err) {
                    LOG.error(err)
                    reject(err)
                } else {
                    if (locationResponse && locationResponse.location && locationResponse.location.address.length > 0) {
                        let geoLocation = {
                            latitude: locationResponse.location.latitude[0],
                            longitude: locationResponse.location.longitude[0],
                            address: locationResponse.location.address[0],
                            city: locationResponse.location.city[0],
                            adminDistrict: locationResponse.location.adminDistrict[0],
                            zipCode: locationResponse.location.postalKey[0].substr(0, (locationResponse.location.postalKey[0].indexOf(':')))
                        }
                        resolve(geoLocation)
                    } else {
                        reject('I\'m Having a problem finding the location you mentioned, can you try again please?')
                    }
                }
            }).auth(process.env.WEATHER_API_USERNAME, process.env.WEATHER_API_PASSWORD, false)
        } catch (err) {
            LOG.error(err)
            reject(err)
        }
    })
}

function generalForecast(when, time, where, forecast) {
    return new Promise((resolve, reject) => {
        try {
            let whenDt = moment(when)
            let narrative = 'You asked for weather on ' + whenDt.format('dddd, MMMM Do YYYY') + ' but I can only tell you weather for the next 10 days.'
            if (forecast) {
                narrative = 'Weather in ' + where + ' for ' + whenDt.format('dddd, MMMM Do YYYY') + ' is ' + forecast.narrative
            }
            resolve(narrative)
        } catch (err) {
            LOG.error(err)
            reject(err)
        }
    })
}

function precipitationForecast(when, time, where, forecast) {
    return new Promise((resolve, reject) => {
        try {
            let whenDt = moment(when)
            let narrative = 'You asked for weather on ' + whenDt.format('dddd, MMMM Do YYYY') + ' but I can only tell you weather for the next 10 days.'
            if (forecast) {
                if (forecast.qpf > 0) {
                    narrative = 'Looks like you might get some precipitation in ' + where + ' on ' + whenDt.format('dddd, MMMM Do YYYY')
                } else {
                    narrative = 'It looks like its going to be dry in ' + where + ' on ' + whenDt.format('dddd, MMMM Do YYYY')
                }
            }
            resolve(narrative)
        } catch (err) {
            LOG.error(err)
            reject(err)
        }
    })
}

function golfForecast(when, time, where, forecast) {
    return new Promise((resolve, reject) => {
        let whenDt = moment(when)
        let narrative = 'You asked for weather on ' + whenDt.format('dddd, MMMM Do YYYY') + ' but I can only tell you weather for the next 10 days.'
        if (forecast) {
            if (forecast.day) {
                narrative = 'Conditions to play golf is ' + forecast.day.golf_category + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
            } else {
                if (forecast.night) {
                    narrative = 'Conditions to play golf is ' + forecast.night.golf_category + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
                }
            }
        }
        resolve(narrative)
    })
}

function outsideActivitiesForecast(when, time, where, forecast) {
    return new Promise((resolve, reject) => {
        let whenDt = moment(when)
        let narrative = 'You asked for weather on ' + whenDt.format('dddd, MMMM Do YYYY') + ' but I can only tell you weather for the next 10 days.'
        if (forecast) {
            if (forecast.day) {
                narrative = 'Conditions for outside activities are ' + forecast.day.golf_category + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
            } else {
                if (forecast.night) {
                    narrative = 'Conditions for outside activities are ' + forecast.night.golf_category + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
                }
            }
        }
        resolve(narrative)
    })
}

function thunderForecast(when, time, where, forecast) {
    return new Promise((resolve, reject) => {
        let whenDt = moment(when)
        let narrative = 'You asked for weather on ' + whenDt.format('dddd, MMMM Do YYYY') + ' but I can only tell you weather for the next 10 days.'
        if (forecast) {
            if (forecast.day) {
                narrative = 'It looks like there is ' + forecast.day.thunder_enum_phrase + ' warnings on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
            } else {
                if (forecast.night) {
                    narrative = 'It looks like there is ' + forecast.night.thunder_enum_phrase + ' warnings on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
                }
            }
        }
        resolve(narrative)
    })
}

function windForecast(when, time, where, forecast) {
    return new Promise((resolve, reject) => {
        let whenDt = moment(when)
        let narrative = 'You asked for weather on ' + whenDt.format('dddd, MMMM Do YYYY') + ' but I can only tell you weather for the next 10 days.'
        if (forecast) {
            if (forecast.day) {
                narrative = 'There will be ' + forecast.day.wind_phrase + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
            } else {
                if (forecast.night) {
                    narrative = 'There will be ' + forecast.night.wind_phrase + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
                }
            }
        }
        resolve(narrative)
    })
}

function temperatureForecast(when, time, where, forecast) {
    return new Promise((resolve, reject) => {
        let whenDt = moment(when)
        let narrative = 'You asked for weather on ' + whenDt.format('dddd, MMMM Do YYYY') + ' but I can only tell you weather for the next 10 days.'
        if (forecast) {
            let mostRecent = forecast.day ? forecast.day : forecast.night
            if (mostRecent.hi < 60) {
                narrative = 'It will be on the cold side with a high of ' + mostRecent.hi + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
            }
            if (mostRecent.hi > 60 && mostRecent.hi < 90) {
                narrative = 'It will be nice with a high of ' + mostRecent.hi + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
            }
            if (mostRecent.hi > 90) {
                narrative = 'It will be on the hot side with a high of ' + mostRecent.hi + ' on ' + whenDt.format('dddd, MMMM Do YYYY') + ' in ' + where
            }
        }
        resolve(narrative)
    })
}

function getMostRelevantForecast(forecasts, when, time) {
    return new Promise((resolve, reject) => {
        // Use this to search the forecast for the right day
        let whenDt = moment(when)
        let mostRelevant
        for (let forecast of forecasts) {
            let forecastDt = moment(forecast.fcst_valid_local)
            if (forecastDt.isSame(whenDt, 'day')) {
                mostRelevant = forecast
                break
            }
        }
        resolve(mostRelevant)
    })
}

function getForecastDuration(when) {
    let m = moment(when)
    let now = moment()
    var days = moment(m, 'DD/MM/YYYY').diff(moment(now, 'DD/MM/YYYY'), 'days') + 1
    let forecastDays = 3
    switch (true) {
        case (days < 3):
            forecastDays = 3
            break
        case (days < 5):
            forecastDays = 5
            break
        case (days < 7):
            forecastDays = 7
            break
        case (days < 10):
            forecastDays = 10
            break
    }
    return forecastDays
}

module.exports = new WeatherUtils()


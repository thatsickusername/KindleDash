const fs = require('fs');
const path = require('path');
const { getF1Data } = require('./f1');

function svgToDataUri(svgString) {
  if (!svgString) return '';
  // Ensure stroke and fill colors are crisp black/white if not set
  let cleaned = svgString.replace(/var\(--color-ink[^\)]*\)/g, '#000000')
                         .replace(/var\(--color-subtext[^\)]*\)/g, '#555555')
                         .replace(/var\(--color-bar-border[^\)]*\)/g, '#a8a8a8');
  return 'data:image/svg+xml;base64,' + Buffer.from(cleaned).toString('base64');
}

/**
 * EXACT 1:1 REPLICATION of templates/clock.js
 * Mode A: Standard centered static clock (170px hero numerals, calendar divider, day of week, full date)
 * Mode B: F1 Race/Qualifying day split grid with top 5 classification
 */
function generateClockLayout(timeZone = 'Asia/Kolkata', f1Data = null) {
  const now = new Date();
  const isQualiOrRaceDay = f1Data?.isQualiOrRaceDay === true;

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const parts = timeFormatter.formatToParts(now);
  const hours = parts.find(p => p.type === 'hour')?.value || '00';
  const minutes = parts.find(p => p.type === 'minute')?.value || '00';

  const dayFormatter = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' });
  const dayName = dayFormatter.format(now);

  const dateFormatter = new Intl.DateTimeFormat('en-US', { timeZone, month: 'long', day: 'numeric', year: 'numeric' });
  const fullDate = dateFormatter.format(now);

  // Bottom bar replication (from templates/figma-layout.js)
  const bottomBar = {
    type: 'div',
    props: {
      style: {
        width: '600px',
        height: '85px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        borderTop: '2px solid #a8a8a8',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF'
      },
      children: [
        {
          type: 'span',
          props: {
            style: { fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#111111' },
            children: 'Back'
          }
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center' },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#111111', textTransform: 'uppercase' },
                  children: 'CLOCK'
                }
              }
            ]
          }
        }
      ]
    }
  };

  if (isQualiOrRaceDay) {
    const race = f1Data?.nextRace;
    const isRaceDay = f1Data?.currentPhase === 'race';
    const sessionResults = f1Data?.sessionResults || [];
    const sessionTitle = f1Data?.sessionTitle || (isRaceDay ? 'RACE CLASSIFICATION (TOP 5)' : 'QUALIFYING (TOP 5)');

    const resultRows = sessionResults.slice(0, 5).map(d => ({
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #d9d9d9',
          padding: '4px 0',
          width: '100%'
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', width: '80px' },
              children: [
                { type: 'span', props: { style: { fontFamily: 'Inter', fontWeight: 800, fontSize: '15px', width: '26px' }, children: String(d.position) } },
                {
                  type: 'span',
                  props: {
                    style: { fontFamily: 'Inter', fontWeight: 800, fontSize: '11px', backgroundColor: '#e2e8f0', padding: '2px 5px', borderRadius: '4px' },
                    children: d.code
                  }
                }
              ]
            }
          },
          {
            type: 'span',
            props: {
              style: { fontFamily: 'Inter', fontWeight: 700, fontSize: '14px', flex: 1, paddingLeft: '8px' },
              children: d.name
            }
          },
          {
            type: 'span',
            props: {
              style: { fontFamily: 'Inter', fontWeight: 500, fontSize: '13px', color: '#464c52', width: '120px' },
              children: d.constructor
            }
          },
          {
            type: 'span',
            props: {
              style: { fontFamily: 'Inter', fontWeight: 800, fontSize: '14px', width: '70px', textAlign: 'right' },
              children: d.stat
            }
          }
        ]
      }
    }));

    return {
      type: 'div',
      props: {
        style: {
          width: '600px',
          height: '800px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          color: '#111111',
          boxSizing: 'border-box'
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                width: '600px',
                height: '715px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px 28px 12px 28px',
                boxSizing: 'border-box'
              },
              children: [
                // Top half: Clock & Date
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '340px'
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'baseline', lineHeight: 1 },
                          children: [
                            { type: 'span', props: { style: { fontFamily: 'SpaceGrotesk', fontSize: '135px', fontWeight: 300, letterSpacing: '-4px' }, children: hours } },
                            { type: 'span', props: { style: { fontFamily: 'SpaceGrotesk', fontSize: '110px', fontWeight: 300, margin: '0 4px' }, children: ':' } },
                            { type: 'span', props: { style: { fontFamily: 'SpaceGrotesk', fontSize: '135px', fontWeight: 300, letterSpacing: '-4px' }, children: minutes } }
                          ]
                        }
                      },
                      { type: 'div', props: { style: { width: '110px', height: '2px', backgroundColor: '#111111', margin: '10px 0 12px 0' } } },
                      { type: 'div', props: { style: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '4px' }, children: dayName } },
                      { type: 'div', props: { style: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#464c52' }, children: fullDate } }
                    ]
                  }
                },
                // Bottom half: Qualifying / Race Day Top 5 Positions Box
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '100%',
                      height: '335px',
                      border: '2.5px solid #111111',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #111111', paddingBottom: '6px' },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: { display: 'flex', flexDirection: 'column' },
                                children: [
                                  { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '17px', fontWeight: 800 }, children: race ? race.raceName : 'Formula 1 Grand Prix' } },
                                  { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, color: '#464c52' }, children: `${race ? `${race.locality}, ${race.country}` : 'Championship'} • ${sessionTitle}` } }
                                ]
                              }
                            },
                            {
                              type: 'span',
                              props: {
                                style: { backgroundColor: '#111111', color: '#FFFFFF', fontFamily: 'Inter', fontSize: '11px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px' },
                                children: isRaceDay ? '🏁 RACE DAY' : '⏱️ QUALIFYING'
                              }
                            }
                          ]
                        }
                      },
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, paddingTop: '4px' },
                          children: resultRows
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          bottomBar
        ]
      }
    };
  }

  // Standard Centered Static Clock (Mode B)
  return {
    type: 'div',
    props: {
      style: {
        width: '600px',
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        color: '#111111',
        boxSizing: 'border-box'
      },
      children: [
        // Main Centered Content (715px)
        {
          type: 'div',
          props: {
            style: {
              width: '600px',
              height: '715px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 40px',
              boxSizing: 'border-box'
            },
            children: [
              // Time Face
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    lineHeight: '0.85',
                    marginBottom: '24px'
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'SpaceGrotesk',
                          fontSize: '170px',
                          fontWeight: 300,
                          color: '#111111',
                          letterSpacing: '-4px'
                        },
                        children: hours
                      }
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'SpaceGrotesk',
                          fontSize: '140px',
                          fontWeight: 300,
                          color: '#111111',
                          margin: '0 4px',
                          transform: 'translateY(-12px)'
                        },
                        children: ':'
                      }
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'SpaceGrotesk',
                          fontSize: '170px',
                          fontWeight: 300,
                          color: '#111111',
                          letterSpacing: '-4px'
                        },
                        children: minutes
                      }
                    }
                  ]
                }
              },
              // Calendar Strip Divider
              {
                type: 'div',
                props: {
                  style: {
                    width: '140px',
                    height: '2px',
                    backgroundColor: '#111111',
                    marginBottom: '28px'
                  }
                }
              },
              // Day of the Week
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Inter',
                    fontSize: '32px',
                    fontWeight: 700,
                    letterSpacing: '-0.5px',
                    color: '#111111',
                    marginBottom: '8px',
                    textAlign: 'center'
                  },
                  children: dayName
                }
              },
              // Full Date
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Inter',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: '#464c52',
                    textAlign: 'center'
                  },
                  children: fullDate
                }
              }
            ]
          }
        },
        bottomBar
      ]
    }
  };
}

/**
 * EXACT 1:1 REPLICATION of templates/figma-weather.js
 * Hero weather icon + 170px Temp Now + 3-day forecast left column + Environmental metrics right column + Bottom bar
 */
function generateWeatherLayout(data) {
  const heroUri = svgToDataUri(data.heroIcon);
  const day1Uri = svgToDataUri(data.forecastDay1Icon);
  const day2Uri = svgToDataUri(data.forecastDay2Icon);
  const day3Uri = svgToDataUri(data.forecastDay3Icon);
  const precipUri = svgToDataUri(data.precipitationIcon);
  const humUri = svgToDataUri(data.humidityIcon);
  const windUri = svgToDataUri(data.windIcon);

  return {
    type: 'div',
    props: {
      style: {
        width: '600px',
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        color: '#111111',
        boxSizing: 'border-box'
      },
      children: [
        // Main Screen Content (715px height)
        {
          type: 'div',
          props: {
            style: {
              width: '600px',
              height: '715px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px 28px 12px 28px',
              boxSizing: 'border-box'
            },
            children: [
              // Section 1: Hero Weather Visual & Temperature Now (Height ~290px)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    width: '100%',
                    height: '290px'
                  },
                  children: [
                    // Hero Weather Icon
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '250px',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        },
                        children: [
                          {
                            type: 'img',
                            props: {
                              src: heroUri,
                              style: { width: '180px', height: '180px' }
                            }
                          }
                        ]
                      }
                    },
                    // Hero Temperature & Label
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '250px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          paddingLeft: '10px'
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'flex-start', lineHeight: '0.85' },
                              children: [
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontFamily: 'SpaceGrotesk',
                                      fontSize: '170px',
                                      fontWeight: 300,
                                      color: '#111111',
                                      letterSpacing: '-3px'
                                    },
                                    children: String(data.tempNow)
                                  }
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      fontFamily: 'Inter',
                                      fontSize: '88px',
                                      fontWeight: 400,
                                      color: '#111111',
                                      lineHeight: '1',
                                      marginLeft: '4px',
                                      marginTop: '10px'
                                    },
                                    children: '°'
                                  }
                                }
                              ]
                            }
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                fontFamily: 'Inter',
                                fontSize: '20px',
                                fontWeight: 500,
                                color: '#111111',
                                marginTop: '18px',
                                letterSpacing: '-0.2px'
                              },
                              children: 'Temperature Now'
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },

              // Section 2: 2-Column Metrics Grid (~360px)
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '100%',
                    height: '360px',
                    justifyContent: 'space-between',
                    alignItems: 'stretch'
                  },
                  children: [
                    // Left Column: Next 3 Days Forecast
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-around',
                          paddingLeft: '20px',
                          width: '50%',
                          height: '100%'
                        },
                        children: [
                          // Day 1
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center' },
                              children: [
                                { type: 'img', props: { src: day1Uri, style: { width: '38px', height: '38px', marginRight: '16px' } } },
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', flexDirection: 'column' },
                                    children: [
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }, children: data.forecastDay1Desc } },
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#464c52' }, children: data.forecastDay1Name } }
                                    ]
                                  }
                                }
                              ]
                            }
                          },
                          // Day 2
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center' },
                              children: [
                                { type: 'img', props: { src: day2Uri, style: { width: '38px', height: '38px', marginRight: '16px' } } },
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', flexDirection: 'column' },
                                    children: [
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }, children: data.forecastDay1Desc } },
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#464c52' }, children: data.forecastDay2Name } }
                                    ]
                                  }
                                }
                              ]
                            }
                          },
                          // Day 3
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center' },
                              children: [
                                { type: 'img', props: { src: day3Uri, style: { width: '38px', height: '38px', marginRight: '16px' } } },
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', flexDirection: 'column' },
                                    children: [
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }, children: data.forecastDay3Desc } },
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#464c52' }, children: data.forecastDay3Name } }
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    },

                    // Right Column: Environmental Metrics (Precipitation, Humidity, Wind)
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-around',
                          paddingLeft: '20px',
                          width: '50%',
                          height: '100%'
                        },
                        children: [
                          // Metric 1: Precipitation
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center' },
                              children: [
                                { type: 'img', props: { src: precipUri, style: { width: '36px', height: '36px', marginRight: '16px' } } },
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', flexDirection: 'column' },
                                    children: [
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }, children: data.precipitation } },
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#464c52' }, children: 'Precipitation' } }
                                    ]
                                  }
                                }
                              ]
                            }
                          },
                          // Metric 2: Humidity
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center' },
                              children: [
                                { type: 'img', props: { src: humUri, style: { width: '36px', height: '36px', marginRight: '16px' } } },
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', flexDirection: 'column' },
                                    children: [
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }, children: data.humidity } },
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#464c52' }, children: 'Humidity' } }
                                    ]
                                  }
                                }
                              ]
                            }
                          },
                          // Metric 3: Wind
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'center' },
                              children: [
                                { type: 'img', props: { src: windUri, style: { width: '36px', height: '36px', marginRight: '16px' } } },
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', flexDirection: 'column' },
                                    children: [
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }, children: data.wind } },
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#464c52' }, children: 'Wind' } }
                                    ]
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },

        // Bottom Bar
        {
          type: 'div',
          props: {
            style: {
              width: '600px',
              height: '85px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 28px',
              borderTop: '2px solid #a8a8a8',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF'
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#111111' },
                  children: 'Back'
                }
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center' },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: { fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#111111', textTransform: 'uppercase' },
                        children: 'WEATHER'
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  };
}

module.exports = {
  generateClockLayout,
  generateWeatherLayout
};

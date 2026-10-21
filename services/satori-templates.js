const fs = require('fs');
const path = require('path');
const { getF1Data } = require('./f1');

function svgToDataUri(svgString) {
  if (!svgString) return '';
  let cleaned = svgString.replace(/var\(--color-ink[^\)]*\)/g, '#000000')
                         .replace(/var\(--color-subtext[^\)]*\)/g, '#555555')
                         .replace(/var\(--color-bar-border[^\)]*\)/g, '#a8a8a8');
  return 'data:image/svg+xml;base64,' + Buffer.from(cleaned).toString('base64');
}

function renderBottomBar(title = 'APP') {
  return {
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
                  children: title
                }
              }
            ]
          }
        }
      ]
    }
  };
}

/**
 * 1. CLOCK VIEW (Mode A: Standard Centered, Mode B: Race Day Split)
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
          renderBottomBar('CLOCK')
        ]
      }
    };
  }

  // Standard Centered Clock
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
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 40px',
              boxSizing: 'border-box'
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', lineHeight: '0.85', marginBottom: '24px' },
                  children: [
                    { type: 'span', props: { style: { fontFamily: 'SpaceGrotesk', fontSize: '170px', fontWeight: 300, color: '#111111', letterSpacing: '-4px' }, children: hours } },
                    { type: 'span', props: { style: { fontFamily: 'SpaceGrotesk', fontSize: '140px', fontWeight: 300, color: '#111111', margin: '0 4px', transform: 'translateY(-12px)' }, children: ':' } },
                    { type: 'span', props: { style: { fontFamily: 'SpaceGrotesk', fontSize: '170px', fontWeight: 300, color: '#111111', letterSpacing: '-4px' }, children: minutes } }
                  ]
                }
              },
              { type: 'div', props: { style: { width: '140px', height: '2px', backgroundColor: '#111111', marginBottom: '28px' } } },
              { type: 'div', props: { style: { fontFamily: 'Inter', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px', color: '#111111', marginBottom: '8px', textAlign: 'center' }, children: dayName } },
              { type: 'div', props: { style: { fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, color: '#464c52', textAlign: 'center' }, children: fullDate } }
            ]
          }
        },
        renderBottomBar('CLOCK')
      ]
    }
  };
}

/**
 * 2. WEATHER VIEW (1:1 with figma-weather.js)
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
              // Hero Section
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', height: '290px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { width: '250px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
                        children: [{ type: 'img', props: { src: heroUri, style: { width: '180px', height: '180px' } } }]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { width: '250px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', paddingLeft: '10px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', alignItems: 'flex-start', lineHeight: '0.85' },
                              children: [
                                { type: 'span', props: { style: { fontFamily: 'SpaceGrotesk', fontSize: '170px', fontWeight: 300, color: '#111111', letterSpacing: '-3px' }, children: String(data.tempNow) } },
                                { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '88px', fontWeight: 400, color: '#111111', lineHeight: '1', marginLeft: '4px', marginTop: '10px' }, children: '°' } }
                              ]
                            }
                          },
                          { type: 'div', props: { style: { fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, color: '#111111', marginTop: '18px', letterSpacing: '-0.2px' }, children: 'Temperature Now' } }
                        ]
                      }
                    }
                  ]
                }
              },

              // 2-Column Metrics Grid
              {
                type: 'div',
                props: {
                  style: { display: 'flex', width: '100%', height: '360px', justifyContent: 'space-between', alignItems: 'stretch' },
                  children: [
                    // Left: 3-day forecast
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingLeft: '20px', width: '50%', height: '100%' },
                        children: [
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
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px' }, children: data.forecastDay2Desc } },
                                      { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '16px', fontWeight: 500, color: '#464c52' }, children: data.forecastDay2Name } }
                                    ]
                                  }
                                }
                              ]
                            }
                          },
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

                    // Right: Environmental Metrics
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingLeft: '20px', width: '50%', height: '100%' },
                        children: [
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
        renderBottomBar('WEATHER')
      ]
    }
  };
}

/**
 * 3. FORMULA 1 VIEW (1:1 with templates/screens/f1.js)
 */
function generateF1Layout(f1Data = {}) {
  const race = f1Data.nextRace;
  const standings = f1Data.driverStandings || [];
  const currentPhase = f1Data.currentPhase;
  const isQualiDay = currentPhase === 'qualifying';
  const isRaceDay = currentPhase === 'race';

  let countdownText = 'RACE SCHEDULED';
  if (f1Data.daysToRace !== null && f1Data.daysToRace !== undefined) {
    if (f1Data.daysToRace === 0) countdownText = 'GRAND PRIX TODAY';
    else if (f1Data.daysToRace === 1) countdownText = 'RACE TOMORROW';
    else countdownText = `${f1Data.daysToRace} DAYS TO GO`;
  }

  const standingsRows = standings.slice(0, 5).map(d => ({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #d9d9d9',
        padding: '6px 0',
        width: '100%'
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', width: '80px' },
            children: [
              { type: 'span', props: { style: { fontFamily: 'Inter', fontWeight: 800, fontSize: '16px', width: '28px' }, children: String(d.position) } },
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Inter', fontWeight: 800, fontSize: '12px', backgroundColor: '#e2e8f0', padding: '3px 6px', borderRadius: '4px' },
                  children: d.code
                }
              }
            ]
          }
        },
        {
          type: 'span',
          props: {
            style: { fontFamily: 'Inter', fontWeight: 700, fontSize: '15px', flex: 1, paddingLeft: '8px' },
            children: d.name
          }
        },
        {
          type: 'span',
          props: {
            style: { fontFamily: 'Inter', fontWeight: 500, fontSize: '14px', color: '#464c52', width: '130px' },
            children: d.constructor
          }
        },
        {
          type: 'span',
          props: {
            style: { fontFamily: 'Inter', fontWeight: 800, fontSize: '15px', width: '80px', textAlign: 'right' },
            children: `${d.points} PTS`
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
              // Top Card: Grand Prix Hero Card
              {
                type: 'div',
                props: {
                  style: {
                    width: '100%',
                    height: '340px',
                    border: '2.5px solid #111111',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#464c52' },
                              children: `ROUND ${race ? race.round : '--'} // 2026 SEASON`
                            }
                          },
                          {
                            type: 'span',
                            props: {
                              style: { backgroundColor: '#111111', color: '#FFFFFF', fontFamily: 'Inter', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '4px' },
                              children: countdownText
                            }
                          }
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', margin: '10px 0' },
                        children: [
                          {
                            type: 'span',
                            props: {
                              style: { fontFamily: 'SpaceGrotesk', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1 },
                              children: race ? race.raceName : 'Formula 1 Grand Prix'
                            }
                          },
                          {
                            type: 'span',
                            props: {
                              style: { fontFamily: 'Inter', fontSize: '18px', fontWeight: 600, color: '#464c52', marginTop: '6px' },
                              children: race ? `${race.locality}, ${race.country} • ${race.circuitName}` : 'Championship Circuit'
                            }
                          }
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', gap: '10px', borderTop: '1.5px solid #d9d9d9', paddingTop: '12px' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                backgroundColor: isQualiDay ? '#111111' : '#f1f5f9',
                                color: isQualiDay ? '#FFFFFF' : '#111111',
                                padding: '8px 12px',
                                borderRadius: '6px'
                              },
                              children: [
                                { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }, children: 'QUALIFYING' } },
                                { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '14px', fontWeight: 700, marginTop: '2px' }, children: race ? `${race.qualiDate} ${race.qualiTime}` : '--:--' } }
                              ]
                            }
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                flexDirection: 'column',
                                flex: 1,
                                backgroundColor: isRaceDay ? '#111111' : '#f1f5f9',
                                color: isRaceDay ? '#FFFFFF' : '#111111',
                                padding: '8px 12px',
                                borderRadius: '6px'
                              },
                              children: [
                                { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px' }, children: 'GRAND PRIX' } },
                                { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '14px', fontWeight: 700, marginTop: '2px' }, children: race ? `${race.raceDate} ${race.raceTime}` : '--:--' } }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },

              // Bottom Card: Championship Top 5 Table
              {
                type: 'div',
                props: {
                  style: {
                    width: '100%',
                    height: '340px',
                    border: '2.5px solid #111111',
                    borderRadius: '14px',
                    padding: '16px 24px',
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
                          { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '17px', fontWeight: 800 }, children: 'WORLD DRIVERS CHAMPIONSHIP' } },
                          { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 600, color: '#464c52' }, children: 'TOP 5 STANDINGS' } }
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, paddingTop: '4px' },
                        children: standingsRows.length > 0 ? standingsRows : [{ type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '14px' }, children: 'Championship standings unavailable' } }]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        renderBottomBar('FORMULA 1')
      ]
    }
  };
}

/**
 * 4. WORLD NEWS VIEW (1:1 with templates/news.js)
 */
function generateNewsLayout(newsItems = []) {
  const articles = newsItems.slice(0, 3).map((item, idx) => ({
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        borderBottom: idx < 2 ? '1.5px solid #d9d9d9' : 'none',
        padding: '14px 0',
        width: '100%'
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Inter', fontSize: '11px', fontWeight: 800, backgroundColor: '#111111', color: '#FFFFFF', padding: '2px 8px', borderRadius: '3px', textTransform: 'uppercase' },
                  children: item.category || 'WORLD'
                }
              },
              {
                type: 'span',
                props: {
                  style: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, color: '#666666' },
                  children: item.timeAgo || 'Recent'
                }
              }
            ]
          }
        },
        {
          type: 'span',
          props: {
            style: { fontFamily: 'SpaceGrotesk', fontSize: '20px', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.3px', marginBottom: '6px' },
            children: item.title || 'Breaking News'
          }
        },
        {
          type: 'span',
          props: {
            style: { fontFamily: 'Inter', fontSize: '14px', fontWeight: 400, color: '#464c52', lineHeight: 1.35 },
            children: item.snippet || item.description || ''
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
              {
                type: 'div',
                props: {
                  style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid #111111', paddingBottom: '12px' },
                  children: [
                    { type: 'span', props: { style: { fontFamily: 'SpaceGrotesk', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }, children: 'BBC World News' } },
                    { type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '12px', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }, children: 'LIVE DISPATCH' } }
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, padding: '8px 0' },
                  children: articles.length > 0 ? articles : [{ type: 'span', props: { style: { fontFamily: 'Inter', fontSize: '15px' }, children: 'No news articles available' } }]
                }
              }
            ]
          }
        },
        renderBottomBar('WORLD NEWS')
      ]
    }
  };
}

/**
 * 5. NIGHT SLEEP VIEW (Minimalist Crescent Moon + Stars Vector Graphic)
 */
function generateSleepLayout() {
  const moonSvg = `<svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 14C29 21 19 42 25 61C31 79 51 90 71 84C57 91 37 86 26 74C13 61 13 39 26 26C33 19 40 15 48 14Z" fill="#111111" stroke="#111111" stroke-width="1.5"/>
    <path d="M72 18L75 25L82 27.5L75 30L72 37L69 30L62 27.5L69 25L72 18Z" fill="#111111"/>
    <path d="M85 45L87 50L92 52L87 54L85 59L83 54L78 52L83 50L85 45Z" fill="#111111"/>
    <circle cx="58" cy="48" r="3.5" fill="#111111"/>
    <path d="M70 65L72 70L77 71.5L72 73L70 78L68 73L63 71.5L68 70L70 65Z" fill="#111111"/>
  </svg>`;
  const moonUri = 'data:image/svg+xml;base64,' + Buffer.from(moonSvg).toString('base64');

  return {
    type: 'div',
    props: {
      style: {
        width: '600px',
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        color: '#111111',
        boxSizing: 'border-box',
        padding: '0 40px'
      },
      children: [
        {
          type: 'img',
          props: {
            src: moonUri,
            style: { width: '180px', height: '180px', marginBottom: '36px' }
          }
        },
        {
          type: 'span',
          props: {
            style: { fontFamily: 'SpaceGrotesk', fontSize: '36px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '12px', textAlign: 'center' },
            children: 'Good night.'
          }
        },
        {
          type: 'span',
          props: {
            style: { fontFamily: 'Inter', fontSize: '20px', fontWeight: 500, color: '#464c52', textAlign: 'center', letterSpacing: '0.5px' },
            children: 'Display sleeping until morning.'
          }
        }
      ]
    }
  };
}

module.exports = {
  generateClockLayout,
  generateWeatherLayout,
  generateF1Layout,
  generateNewsLayout,
  generateSleepLayout
};

/**
 * Satori Layout Templates for Kindle E-Ink (600x800)
 * Strict display: flex, #000000 (black) and #FFFFFF (white) only.
 */

function generateClockLayout(timeZone = 'Asia/Kolkata') {
  const now = new Date();

  // Time formatter
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const timeStr = timeFormatter.format(now);

  // Day formatter
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long'
  });
  const dayStr = dayFormatter.format(now).toUpperCase();

  // Date formatter
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const dateStr = dateFormatter.format(now).toUpperCase();

  return {
    type: 'div',
    props: {
      style: {
        width: '600px',
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        padding: '50px 30px',
        boxSizing: 'border-box'
      },
      children: [
        // Header Meta
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '4px solid #000000',
              paddingBottom: '16px'
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' },
                  children: 'KINDLEDASH'
                }
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '18px', fontWeight: 'bold' },
                  children: timeZone
                }
              }
            ]
          }
        },

        // Main Clock Container
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto 0'
            },
            children: [
              // Hero Time
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '150px',
                    fontWeight: 'bold',
                    lineHeight: '1',
                    marginBottom: '20px'
                  },
                  children: timeStr
                }
              },
              // Horizontal divider
              {
                type: 'div',
                props: {
                  style: {
                    width: '320px',
                    height: '6px',
                    backgroundColor: '#000000',
                    marginBottom: '24px'
                  }
                }
              },
              // Day of week
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '44px',
                    fontWeight: 'bold',
                    letterSpacing: '3px',
                    marginBottom: '8px'
                  },
                  children: dayStr
                }
              },
              // Full date
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '24px',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  },
                  children: dateStr
                }
              }
            ]
          }
        },

        // Footer Meta
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '4px solid #000000',
              paddingTop: '16px'
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '18px', fontWeight: 'bold' },
                  children: 'MODE: CLOCK'
                }
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '18px', fontWeight: 'bold' },
                  children: 'E-INK SSR // TRMNL'
                }
              }
            ]
          }
        }
      ]
    }
  };
}

function generateWeatherLayout(weatherData = {}) {
  const temp = Math.round(weatherData.temperature ?? 24);
  const condition = (weatherData.conditionText || 'CLEAR SKY').toUpperCase();
  const high = Math.round(weatherData.highTemp ?? 28);
  const low = Math.round(weatherData.lowTemp ?? 18);
  const humidity = weatherData.humidity ?? 65;
  const wind = weatherData.windSpeed ?? 12;
  const uv = weatherData.uvIndex ?? 4;
  const city = (weatherData.cityName || 'WEATHER').toUpperCase();

  return {
    type: 'div',
    props: {
      style: {
        width: '600px',
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        padding: '50px 30px',
        boxSizing: 'border-box'
      },
      children: [
        // Header
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '4px solid #000000',
              paddingBottom: '16px'
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' },
                  children: 'KINDLEDASH'
                }
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '18px', fontWeight: 'bold' },
                  children: city
                }
              }
            ]
          }
        },

        // Hero Weather Area
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '20px',
              marginBottom: '20px'
            },
            children: [
              // Temp Number
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '130px',
                    fontWeight: 'bold',
                    lineHeight: '1'
                  },
                  children: `${temp}°`
                }
              },
              // Condition Label
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '32px',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    marginTop: '10px',
                    marginBottom: '10px'
                  },
                  children: condition
                }
              },
              // High / Low Pill
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    border: '3px solid #000000',
                    padding: '8px 24px',
                    borderRadius: '24px',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  },
                  children: `H: ${high}°  |  L: ${low}°`
                }
              }
            ]
          }
        },

        // 2x2 Grid of Metrics (flex rows)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              border: '3px solid #000000'
            },
            children: [
              // Row 1
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '100%',
                    borderBottom: '3px solid #000000'
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          width: '50%',
                          padding: '16px 20px',
                          borderRight: '3px solid #000000'
                        },
                        children: [
                          { type: 'span', props: { style: { fontSize: '14px', fontWeight: 'bold' }, children: 'HUMIDITY' } },
                          { type: 'span', props: { style: { fontSize: '28px', fontWeight: 'bold', marginTop: '4px' }, children: `${humidity}%` } }
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          width: '50%',
                          padding: '16px 20px'
                        },
                        children: [
                          { type: 'span', props: { style: { fontSize: '14px', fontWeight: 'bold' }, children: 'WIND SPEED' } },
                          { type: 'span', props: { style: { fontSize: '28px', fontWeight: 'bold', marginTop: '4px' }, children: `${wind} km/h` } }
                        ]
                      }
                    }
                  ]
                }
              },
              // Row 2
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '100%'
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          width: '50%',
                          padding: '16px 20px',
                          borderRight: '3px solid #000000'
                        },
                        children: [
                          { type: 'span', props: { style: { fontSize: '14px', fontWeight: 'bold' }, children: 'UV INDEX' } },
                          { type: 'span', props: { style: { fontSize: '28px', fontWeight: 'bold', marginTop: '4px' }, children: `${uv} / 10` } }
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          width: '50%',
                          padding: '16px 20px'
                        },
                        children: [
                          { type: 'span', props: { style: { fontSize: '14px', fontWeight: 'bold' }, children: 'SYSTEM STATUS' } },
                          { type: 'span', props: { style: { fontSize: '28px', fontWeight: 'bold', marginTop: '4px' }, children: 'ONLINE' } }
                        ]
                      }
                    }
                  ]
                }
              }
            ]
          }
        },

        // Footer Meta
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '4px solid #000000',
              paddingTop: '16px'
            },
            children: [
              {
                type: 'span',
                props: {
                  style: { fontSize: '18px', fontWeight: 'bold' },
                  children: 'MODE: WEATHER'
                }
              },
              {
                type: 'span',
                props: {
                  style: { fontSize: '18px', fontWeight: 'bold' },
                  children: 'OPEN-METEO // E-INK'
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

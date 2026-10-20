# KindleDash 3.0: Implementation Checklist

## Phase 1: Carousel & Screen Setup
- [x] Configure 4 core screens in carousel: Clock, Weather, Formula 1, World News.
- [x] Set Formula 1 screen to `always` visible so it remains in rotation 24/7.
- [x] Show upcoming race countdown, track, and timetable on dedicated F1 screen.
- [x] Show Top 5 World Drivers Championship standings on dedicated F1 screen.

## Phase 2: Dynamic Split Clock Screen
- [x] Add conditional rendering in [`templates/clock.js`](file:///C:/Users/manis/Development/kindleDash/templates/clock.js):
  - [x] **Standard Days**: Centered static clock with 170px hero numbers, divider, day, and date.
  - [x] **Qualifying & Race Days**: Automatically splits into a balanced 2-row grid (`grid-template-rows: 1fr 1fr`):
    - [x] Top Row: Clock & Date (`105px` numerals, day, full date).
    - [x] Bottom Row: Grand Prix name, city/country, session tag (`⏱️ QUALIFYING` or `🏁 RACE DAY`), and top 5 standings table.
  - [x] Minute-drift auto ticker preserved across both modes.

## Phase 3: Layout & Bottom Bar
- [x] Dedicated F1 and Weather screens use full-height 2-container layout filling entire 712px height above bottom bar.
- [x] Bottom bar displays active screen title on left (`Clock`, `Weather`, `Formula 1`, `World News`) and battery icon + percentage on right.

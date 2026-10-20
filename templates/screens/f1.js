function renderF1Screen(f1Data) {
  const race = f1Data?.nextRace;
  const standings = f1Data?.driverStandings || [];
  const currentPhase = f1Data?.currentPhase; // 'qualifying' | 'race'
  const isQualiDay = currentPhase === 'qualifying';
  const isRaceDay = currentPhase === 'race';

  const standingsHtml = standings.map((d) => `
    <div style="
      display: grid;
      grid-template-columns: 28px 52px 1fr 125px 75px;
      align-items: center;
      font-family: var(--font-main);
      font-size: 16px;
      border-bottom: 1px solid var(--color-bar-border, #a8a8a8);
      padding: 6px 0;
    ">
      <div style="font-weight: 800; font-size: 16px; color: var(--color-ink, #111111);">${d.position}</div>
      <div style="font-weight: 800; background: var(--color-bar-bg, #d9d9d9); padding: 3px 6px; border-radius: 4px; text-align: center; font-size: 13px; color: var(--color-ink, #111111);">${d.code}</div>
      <div style="font-weight: 700; padding-left: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-ink, #111111);">${d.name}</div>
      <div style="font-size: 14px; font-weight: 500; color: var(--color-subtext, #464c52); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.constructor}</div>
      <div style="font-weight: 800; font-size: 16px; text-align: right; color: var(--color-ink, #111111);">${d.points} PTS</div>
    </div>
  `).join('');

  return `
    <main style="
      width: 600px;
      height: 712px;
      position: absolute;
      top: 0;
      left: 0;
      padding: 24px 28px 12px 28px;
      box-sizing: border-box;
      display: grid;
      grid-template-rows: 1fr 1fr;
      row-gap: 16px;
      overflow: hidden;
    ">
      <!-- Container 1: Hero Grand Prix Card (Stretches full row 1) -->
      <div style="
        width: 100%;
        height: 100%;
        border: 2.5px solid var(--color-ink, #111111);
        border-radius: 14px;
        padding: 20px 24px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #ffffff;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="background: var(--color-ink, #111111); color: #ffffff; font-family: var(--font-main); font-size: 13px; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px;">
            ${isRaceDay ? '🏁 RACE DAY' : '⏱️ QUALIFYING DAY'}
          </span>
          <span style="font-family: var(--font-main); font-size: 14px; font-weight: 800; color: var(--color-ink, #111111); letter-spacing: 0.2px;">
            ${isRaceDay ? 'GRAND PRIX TODAY' : 'RACE TOMORROW'}
          </span>
        </div>

        <div>
          <div style="font-family: var(--font-main); font-size: 32px; font-weight: 800; line-height: 1.15; letter-spacing: -0.5px; color: var(--color-ink, #111111); margin-top: 2px;">
            ${race ? race.raceName : 'Formula 1 Grand Prix'}
          </div>
          <div style="font-family: var(--font-main); font-size: 16px; font-weight: 500; color: var(--color-subtext, #464c52); line-height: 1.3; margin-top: 4px;">
            ${race ? `${race.circuitName} • ${race.locality}, ${race.country}` : 'World Championship'}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div style="
            border: 2px solid var(--color-ink, #111111);
            border-radius: 8px;
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            ${isQualiDay ? 'background: var(--color-ink, #111111); color: #ffffff;' : 'background: #ffffff; color: var(--color-ink, #111111);'}
          ">
            <span style="font-family: var(--font-main); font-size: 12px; font-weight: 700; letter-spacing: 0.8px;">QUALIFYING</span>
            <span style="font-family: var(--font-main); font-size: 16px; font-weight: 800; margin-top: 4px;">${race?.sessions?.qualifying ? race.sessions.qualifying.split(' ')[0] : 'Saturday'}</span>
          </div>
          <div style="
            border: 2px solid var(--color-ink, #111111);
            border-radius: 8px;
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            ${isRaceDay ? 'background: var(--color-ink, #111111); color: #ffffff;' : 'background: #ffffff; color: var(--color-ink, #111111);'}
          ">
            <span style="font-family: var(--font-main); font-size: 12px; font-weight: 700; letter-spacing: 0.8px;">GRAND PRIX</span>
            <span style="font-family: var(--font-main); font-size: 16px; font-weight: 800; margin-top: 4px;">${race?.date || 'Sunday'}</span>
          </div>
        </div>
      </div>

      <!-- Container 2: Driver Standings (Stretches full row 2 right down to bottom bar) -->
      <div style="
        width: 100%;
        height: 100%;
        border: 2.5px solid var(--color-ink, #111111);
        border-radius: 14px;
        padding: 18px 24px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: #ffffff;
      ">
        <div style="font-family: var(--font-main); font-size: 14px; font-weight: 800; letter-spacing: 1.5px; border-bottom: 2px solid var(--color-ink, #111111); padding-bottom: 8px; color: var(--color-ink, #111111);">
          WORLD DRIVERS CHAMPIONSHIP (TOP 5)
        </div>
        <div style="display: flex; flex-direction: column; justify-content: space-around; flex: 1; padding-top: 4px;">
          ${standingsHtml || '<div>Standings currently unavailable</div>'}
        </div>
      </div>
    </main>
  `;
}

module.exports = {
  renderF1Screen
};

// FART QUEST topic: Tick-Tock Hollow — clocks & time (Measure Marsh)
// Authored content — implementation agents: read, never modify.

export default {
  id: 'clocks-time',
  name: 'Tick-Tock Hollow',
  region: 'measure-marsh',
  genId: 'clocks',
  tagline: 'Where every minute gets eaten before you can read it — unless you know the trick.',

  creature: {
    id: 'minute-muncher',
    name: 'The Minute Muncher',
    rarity: 'rare',
    image: 'assets/monsters/the-minute-muncher.png',
    bio: 'He swallows stray minutes whole — that’s why the clock always seems to lose a few between glances. He has never once managed to eat a whole hour, though not for lack of trying.',
    factSneak: 'The minute hand’s numbers are a secret 5-times-table — the 7 doesn’t mean 7 minutes, it means 35.',
  },

  weapon: {
    id: 'two-face-watch',
    name: 'The Two-Face Watch',
    tagline: 'One face for the day, one for the night — and it never once gets past and to muddled up.',
    rule: 'Past or to? Minute hand left half = TO, right half = PAST. For 24-hour: afternoon = add 12.',
    example: '25 past 3 in the afternoon: the minute hand is on the right half — that’s PAST — so it’s 3:25. It’s the afternoon, so the 24-hour clock adds 12: 15:25.',
  },

  lesson: [
    {
      type: 'talk',
      vo: 'teach-clocks',
      text: 'Gather round, my ticking treasure! Deep in Tick-Tock Hollow lurks a beastie who has never ONCE told the time correctly — he gobbles up the minutes before anyone can read them. Today, brave nose-soldier, you get the Two-Face Watch. He will never confuse you again.',
    },
    {
      type: 'show',
      title: 'Two Hands, Two Jobs',
      html: `<p>Every clock face has two hands, and they have very different jobs. The <b>short, fat hand</b> is the HOUR hand — it barely creeps around all day. The <b>long, thin hand</b> is the MINUTE hand — it races all the way round the face every single hour.</p>
<div style="width:180px;height:180px;border-radius:50%;background:var(--card);border:6px solid var(--ink);position:relative;margin:16px auto;box-shadow:0 4px 0 rgba(0,0,0,.3);">
  <div style="position:absolute;left:90px;top:22px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">12</div>
  <div style="position:absolute;left:124px;top:31.1px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">1</div>
  <div style="position:absolute;left:148.9px;top:56px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">2</div>
  <div style="position:absolute;left:158px;top:90px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">3</div>
  <div style="position:absolute;left:148.9px;top:124px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">4</div>
  <div style="position:absolute;left:124px;top:148.9px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">5</div>
  <div style="position:absolute;left:90px;top:158px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">6</div>
  <div style="position:absolute;left:56px;top:148.9px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">7</div>
  <div style="position:absolute;left:31.1px;top:124px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">8</div>
  <div style="position:absolute;left:22px;top:90px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">9</div>
  <div style="position:absolute;left:31.1px;top:56px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">10</div>
  <div style="position:absolute;left:56px;top:31.1px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">11</div>
  <div style="position:absolute;left:90px;top:90px;width:0;height:0;">
    <div style="position:absolute;left:-3px;top:-40px;width:6px;height:40px;background:var(--ink);border-radius:3px;transform-origin:50% 100%;transform:rotate(90deg);"></div>
    <div style="position:absolute;left:-2px;top:-62px;width:4px;height:62px;background:var(--stink);border-radius:2px;transform-origin:50% 100%;transform:rotate(0deg);"></div>
    <div style="position:absolute;left:-6px;top:-6px;width:12px;height:12px;background:var(--ink);border-radius:50%;"></div>
  </div>
</div>
<p>Here the short hand points EXACTLY at the 3, and the long hand points EXACTLY at the 12. That makes it easy: <b>3 o’clock</b>. No minutes have passed yet — the minute hand is right back at the top, ready to start its lap.</p>`,
    },
    {
      type: 'show',
      title: 'Every Number Is Really 5 Minutes',
      html: `<p>Right then, hero — here’s where it gets clever. The minute hand doesn’t count in ones. Every number it passes is secretly worth <b>five minutes</b>, because there are 5 tiny ticks between each one.</p>
<div style="width:220px;height:220px;border-radius:50%;background:var(--card);border:6px solid var(--ink);position:relative;margin:16px auto;box-shadow:0 4px 0 rgba(0,0,0,.3);">
  <div style="position:absolute;left:110px;top:12px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">60</div>
  <div style="position:absolute;left:159px;top:25.1px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">05</div>
  <div style="position:absolute;left:194.9px;top:61px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">10</div>
  <div style="position:absolute;left:208px;top:110px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">15</div>
  <div style="position:absolute;left:194.9px;top:159px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">20</div>
  <div style="position:absolute;left:159px;top:194.9px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">25</div>
  <div style="position:absolute;left:110px;top:208px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">30</div>
  <div style="position:absolute;left:61px;top:194.9px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">35</div>
  <div style="position:absolute;left:25.1px;top:159px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">40</div>
  <div style="position:absolute;left:12px;top:110px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">45</div>
  <div style="position:absolute;left:25.1px;top:61px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">50</div>
  <div style="position:absolute;left:61px;top:25.1px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:11px;color:var(--gold-deep);font-style:italic;">55</div>
  <div style="position:absolute;left:110px;top:36px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">12</div>
  <div style="position:absolute;left:147px;top:45.9px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">1</div>
  <div style="position:absolute;left:174.1px;top:73px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">2</div>
  <div style="position:absolute;left:184px;top:110px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">3</div>
  <div style="position:absolute;left:174.1px;top:147px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">4</div>
  <div style="position:absolute;left:147px;top:174.1px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">5</div>
  <div style="position:absolute;left:110px;top:184px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">6</div>
  <div style="position:absolute;left:73px;top:174.1px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">7</div>
  <div style="position:absolute;left:45.9px;top:147px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">8</div>
  <div style="position:absolute;left:36px;top:110px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">9</div>
  <div style="position:absolute;left:45.9px;top:73px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">10</div>
  <div style="position:absolute;left:73px;top:45.9px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:15px;color:var(--ink);">11</div>
  <div style="position:absolute;left:110px;top:110px;width:0;height:0;">
    <div style="position:absolute;left:-3px;top:-46px;width:6px;height:46px;background:var(--ink);border-radius:3px;transform-origin:50% 100%;transform:rotate(227.5deg);"></div>
    <div style="position:absolute;left:-2px;top:-68px;width:4px;height:68px;background:var(--stink);border-radius:2px;transform-origin:50% 100%;transform:rotate(210deg);"></div>
    <div style="position:absolute;left:-6px;top:-6px;width:12px;height:12px;background:var(--ink);border-radius:50%;"></div>
  </div>
</div>
<p>See the little gold numbers on the outside? They’re the minute hand’s SECRET times table. Here the minute hand points at the 7 — but that’s not "7 minutes", it’s <b>7 × 5 = 35 minutes</b>. The hour hand sits between the 7 and the 8, so the hour hasn’t changed yet — it’s still 7. Time: <b>7:35</b>.</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'clocks-try-1', topicId: 'clocks-time', tier: 1, format: 'mcq5',
        stem: 'What time does the clock show?',
        visual: { kind: 'clock', h: 4, m: 20 },
        options: [
          { text: '4:20', misconception: null },
          { text: '5:20', misconception: 'hour-hand-early' },
          { text: '4:40', misconception: 'past-to-swap' },
          { text: '3:20', misconception: 'hour-hand-late' },
        ],
        correctIndex: 0,
        hintSteps: [
          'Look at the SHORT hand first — which two numbers is it between? That tells you the hour hasn’t changed yet.',
          'Now the LONG hand — which number is it pointing at? Multiply that number by 5 to get the minutes.',
        ],
        explain: {
          rule: 'Past or to? Minute hand left half = TO, right half = PAST. For 24-hour: afternoon = add 12.',
          worked: 'The short hour hand is just past the 4, so the hour is still 4. The long minute hand points at the 4 — 4 × 5 = 20 minutes. Time: 4:20.',
          whyWrong: {
            '5:20': 'The hour hand is close to 5 but hasn’t reached it yet — the hour stays at 4 until the minute hand completes its full lap.',
            '4:40': 'That’s the mirror time on the OTHER side of the clock face. The minute hand here is on the right half, so it’s PAST — not TO.',
            '3:20': 'The hour hand has already moved past the 3 — check which number it is closest to now.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'Past or To? Meet the Two-Face Watch',
      html: `<p>Now for the big one — the trick the Minute Muncher dreads most. Imagine the clock face cut into two halves, straight down the middle from 12 to 6.</p>
<div style="display:flex;gap:28px;justify-content:center;flex-wrap:wrap;align-items:flex-start;margin:18px 0;">
  <div style="text-align:center;">
    <div style="width:150px;height:150px;border-radius:50%;background:var(--card);border:5px solid var(--ink);position:relative;margin:0 auto;box-shadow:0 4px 0 rgba(0,0,0,.3);">
      <div style="position:absolute;left:75px;top:16px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">12</div>
      <div style="position:absolute;left:102.3px;top:24.4px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">1</div>
      <div style="position:absolute;left:122.4px;top:44.5px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">2</div>
      <div style="position:absolute;left:130.5px;top:75px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">3</div>
      <div style="position:absolute;left:122.4px;top:105.5px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">4</div>
      <div style="position:absolute;left:102.3px;top:125.6px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">5</div>
      <div style="position:absolute;left:75px;top:134px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">6</div>
      <div style="position:absolute;left:47.7px;top:125.6px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">7</div>
      <div style="position:absolute;left:27.6px;top:105.5px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">8</div>
      <div style="position:absolute;left:19.5px;top:75px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">9</div>
      <div style="position:absolute;left:27.6px;top:44.5px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">10</div>
      <div style="position:absolute;left:47.7px;top:24.4px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">11</div>
      <div style="position:absolute;left:75px;top:75px;width:0;height:0;">
        <div style="position:absolute;left:-3px;top:-34px;width:6px;height:34px;background:var(--ink);border-radius:3px;transform-origin:50% 100%;transform:rotate(95deg);"></div>
        <div style="position:absolute;left:-2px;top:-52px;width:4px;height:52px;background:var(--stink);border-radius:2px;transform-origin:50% 100%;transform:rotate(60deg);"></div>
        <div style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;background:var(--ink);border-radius:50%;"></div>
      </div>
    </div>
    <p style="margin-top:8px;font-weight:700;">Ten PAST three</p>
  </div>
  <div style="text-align:center;">
    <div style="width:150px;height:150px;border-radius:50%;background:var(--card);border:5px solid var(--ink);position:relative;margin:0 auto;box-shadow:0 4px 0 rgba(0,0,0,.3);">
      <div style="position:absolute;left:75px;top:16px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">12</div>
      <div style="position:absolute;left:102.3px;top:24.4px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">1</div>
      <div style="position:absolute;left:122.4px;top:44.5px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">2</div>
      <div style="position:absolute;left:130.5px;top:75px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">3</div>
      <div style="position:absolute;left:122.4px;top:105.5px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">4</div>
      <div style="position:absolute;left:102.3px;top:125.6px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">5</div>
      <div style="position:absolute;left:75px;top:134px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">6</div>
      <div style="position:absolute;left:47.7px;top:125.6px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">7</div>
      <div style="position:absolute;left:27.6px;top:105.5px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">8</div>
      <div style="position:absolute;left:19.5px;top:75px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">9</div>
      <div style="position:absolute;left:27.6px;top:44.5px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">10</div>
      <div style="position:absolute;left:47.7px;top:24.4px;transform:translate(-50%,-50%);font-family:'Fredoka',sans-serif;font-weight:700;font-size:12px;color:var(--ink);">11</div>
      <div style="position:absolute;left:75px;top:75px;width:0;height:0;">
        <div style="position:absolute;left:-3px;top:-34px;width:6px;height:34px;background:var(--ink);border-radius:3px;transform-origin:50% 100%;transform:rotate(115deg);"></div>
        <div style="position:absolute;left:-2px;top:-52px;width:4px;height:52px;background:var(--stink);border-radius:2px;transform-origin:50% 100%;transform:rotate(300deg);"></div>
        <div style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;background:var(--ink);border-radius:50%;"></div>
      </div>
    </div>
    <p style="margin-top:8px;font-weight:700;">Ten TO four</p>
  </div>
</div>
<p>On the LEFT clock, the minute hand is on the RIGHT half of the face, still catching up towards 12 — that means it’s <b>PAST</b> the hour. On the RIGHT clock, the minute hand is on the LEFT half, chasing towards the next hour — that means it’s <b>TO</b> the next hour.</p>
<div class="law-scroll">⌘ <b>THE TWO-FACE WATCH:</b> Minute hand on the RIGHT half (just past 12, before 6) = PAST. Minute hand on the LEFT half (past 6, before 12) = TO the NEXT hour.</div>`,
    },
    {
      type: 'try',
      q: {
        id: 'clocks-try-2', topicId: 'clocks-time', tier: 1, format: 'mcq5',
        stem: 'What time does the clock show?',
        visual: { kind: 'clock', h: 5, m: 45 },
        options: [
          { text: '5:45', misconception: null },
          { text: '6:45', misconception: 'hour-hand-early' },
          { text: '5:15', misconception: 'past-to-swap' },
          { text: '6:15', misconception: 'double-error' },
        ],
        correctIndex: 0,
        hintSteps: [
          'The short hand is nearly touching the 6 — but has it ARRIVED yet? Not until the long hand finishes its full lap back to 12.',
          'The long hand is on the 9 — that’s 45 minutes, which is "quarter to" the NEXT hour. Quarter to which hour?',
        ],
        explain: {
          rule: 'Past or to? Minute hand left half = TO, right half = PAST. For 24-hour: afternoon = add 12.',
          worked: 'The hour hand looks close to the 6, but the hour hasn’t changed yet — it stays at 5 until the minute hand sweeps all the way round to 12. The minute hand is on the 9 (45 minutes) — quarter to 6. Time: 5:45.',
          whyWrong: {
            '6:45': 'The hour hand LOOKS like it’s on the 6, but it only truly arrives once the minute hand completes the full circle back to 12.',
            '5:15': 'That’s the mirror position on the other half of the face. The minute hand here is on the LEFT half (past 30), so it means TO the next hour, not past this one.',
            '6:15': 'Two mistakes stacked up here — the wrong hour AND the wrong side of the clock. Check which half the minute hand is on first.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'One Clock, Two Faces: 12-Hour and 24-Hour',
      html: `<p>The Two-Face Watch has one more trick up its strap. By day it shows the friendly 12-hour clock, with a.m. and p.m. — but at the very same moment, it’s secretly also running the 24-hour clock underneath, the one buses, trains and school bells use.</p>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;align-items:center;margin:18px 0;">
  <div style="display:inline-block;background:var(--swamp-deep);color:var(--gold);font-family:'SF Mono',Menlo,Consolas,monospace;font-weight:700;font-size:24px;padding:12px 18px;border-radius:var(--r-sm);box-shadow:0 4px 0 rgba(0,0,0,.3);">6:05 a.m.</div>
  <span style="font-family:'Fredoka',sans-serif;font-weight:700;color:var(--stink);font-size:22px;">→</span>
  <div style="display:inline-block;background:var(--swamp-deep);color:var(--gold);font-family:'SF Mono',Menlo,Consolas,monospace;font-weight:700;font-size:24px;padding:12px 18px;border-radius:var(--r-sm);box-shadow:0 4px 0 rgba(0,0,0,.3);">06:05</div>
</div>
<p>Morning (a.m.) times barely change — just tuck a leading zero on the front if the hour is a single digit. But watch what happens in the afternoon:</p>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;align-items:center;margin:18px 0;">
  <div style="display:inline-block;background:var(--swamp-deep);color:var(--gold);font-family:'SF Mono',Menlo,Consolas,monospace;font-weight:700;font-size:24px;padding:12px 18px;border-radius:var(--r-sm);box-shadow:0 4px 0 rgba(0,0,0,.3);">7:40 p.m.</div>
  <span style="font-family:'Fredoka',sans-serif;font-weight:700;color:var(--stink);font-size:22px;">→</span>
  <div style="display:inline-block;background:var(--swamp-deep);color:var(--gold);font-family:'SF Mono',Menlo,Consolas,monospace;font-weight:700;font-size:24px;padding:12px 18px;border-radius:var(--r-sm);box-shadow:0 4px 0 rgba(0,0,0,.3);">19:40</div>
</div>
<p>Afternoon and evening (p.m.) times get <b>+12</b> added to the hour. 7 + 12 = 19. The minutes never change — only the hour does the work. And remember: only p.m. gets the +12. A morning time never does!</p>`,
    },
    {
      type: 'try',
      q: {
        id: 'clocks-try-3', topicId: 'clocks-time', tier: 2, format: 'mcq5',
        stem: 'Write <b>6:15 p.m.</b> using the 24-hour clock.',
        options: [
          { text: '18:15', misconception: null },
          { text: '6:15', misconception: 'forgot-add-12' },
          { text: '7:15', misconception: 'hour-off-by-one' },
          { text: '17:15', misconception: 'hour-off-by-one' },
          { text: '18:45', misconception: 'minutes-shifted' },
        ],
        correctIndex: 0,
        hintSteps: [
          'It’s the afternoon (p.m.), so the Two-Face Watch shows its OTHER face: add 12 to the hour.',
          '6 + 12 = ? Keep the minutes exactly the same — only the hour changes.',
        ],
        explain: {
          rule: 'Past or to? Minute hand left half = TO, right half = PAST. For 24-hour: afternoon = add 12.',
          worked: '6:15 p.m. is in the afternoon, so add 12 to the hour: 6 + 12 = 18. The minutes stay exactly as given. 24-hour time: 18:15.',
          whyWrong: {
            '6:15': 'That’s the a.m. version. For the afternoon, the Two-Face Watch needs its OTHER face: add 12.',
            '7:15': 'The hour has shifted by one for no reason — you only add 12, you don’t also change which hour it started as.',
            '17:15': 'That’s one hour short of the right answer — check the addition: 6 + 12.',
            '18:45': 'The hour is right, but the minutes have changed — they should stay exactly as given in the question.',
          },
        },
      },
    },
    {
      type: 'show',
      title: 'How Long Until…? Simple Durations',
      html: `<p>One last skill for the toolkit: working out how much time has passed — as long as you don’t run past the top of the hour, it’s just counting on.</p>
<div class="numline" data-min="20" data-max="45" data-marker="35">
  <div class="camp camp-a">3:20</div>
  <div class="numline-track">
    <span class="tick"></span><span class="tick"></span><span class="tick"></span>
    <span class="numline-marker" style="--pos:50%">+25 min</span>
    <span class="tick"></span><span class="tick"></span><span class="tick"></span>
  </div>
  <div class="camp camp-b">3:45</div>
</div>
<p>A quest starts at <b>3:20</b> and lasts <b>25 minutes</b>. Count on: 20 + 25 = 45. It finishes at <b>3:45</b> — the hour never had to change, so it stays lovely and simple.</p>`,
    },
    { type: 'anim', anim: 'clocks-time' },
    { type: 'weapon' },
  ],

  tips: [
    'The SHORT fat hand is the HOUR hand — it barely moves. The LONG thin hand is the MINUTE hand — it does all the running around.',
    'Every number on the clock face is really a 5-minute stop. Multiply the number the minute hand points to by 5.',
    'Minute hand on the RIGHT half (numbers 1–5) = PAST the hour. Minute hand on the LEFT half (numbers 7–11) = TO the next hour.',
    'The hour hand creeping close to the next number does NOT mean the hour has changed yet — at 7:55 it’s nearly pointing at 8, but it’s still SEVEN fifty-five.',
    'Only afternoon and evening (p.m.) times get +12 for the 24-hour clock. Morning (a.m.) times keep the same hour number — just remember the leading zero: 6 a.m. = 06:00.',
    'Don’t add 12 to a morning time by accident — 8 a.m. is 08:00, not 20:00!',
    '12 o’clock is the odd one out: 12 midnight (12 a.m.) becomes 00:00, but 12 noon (12 p.m.) stays 12:00 — no adding, no subtracting.',
  ],
};

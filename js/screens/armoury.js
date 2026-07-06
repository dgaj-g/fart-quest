// FART QUEST — screens/armoury.js (UI agent)

export function mount(root, ctx) {
  const screen = document.createElement('div');
  screen.className = 'armoury-screen screen enter-pop';

  const back = document.createElement('button');
  back.className = 'btn btn-ghost topic-back';
  back.style.padding = '10px 18px';
  back.textContent = '← Map';
  back.addEventListener('click', () => { ctx.audio.sfx('back'); ctx.go('#/map'); });
  screen.appendChild(back);

  screen.innerHTML += `<h1 class="armoury-title">The Armoury</h1>`;

  const taughtTopics = Object.keys(ctx.topics).filter((id) => ctx.state.topic(id).taught);

  if (taughtTopics.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'armoury-empty';
    empty.textContent = 'No weapons yet, hero! Complete a Scout Report to earn your first Secret Weapon.';
    screen.appendChild(empty);
  } else {
    const board = document.createElement('div');
    board.className = 'pegboard';
    taughtTopics.forEach((id) => {
      const topic = ctx.topics[id];
      const weapon = topic.weapon;
      const card = document.createElement('div');
      card.className = 'weapon-card enter-up';
      card.innerHTML = `
        <h3>${weapon.name}</h3>
        <div class="tagline">${weapon.tagline}</div>
        <div class="rule">${weapon.rule}</div>
        <button class="used-against">Used against: ${topic.name}</button>
      `;
      card.querySelector('.used-against').addEventListener('click', () => {
        ctx.audio.sfx('click');
        ctx.go(`#/topic/${id}`);
      });
      board.appendChild(card);
    });
    screen.appendChild(board);
  }

  root.appendChild(screen);
}

export function unmount() {}

export default { mount, unmount };

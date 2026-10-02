(function () {
  const canvas = document.getElementById('binary-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const FONT_SIZE = 10;
  const CHARS = ['0', '1'];
  let drops = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / FONT_SIZE);
    while (drops.length < columns) {
      drops.push(Math.random() * -canvas.height / FONT_SIZE);
    }
    drops.length = columns;
  }

  function draw() {
    ctx.fillStyle = 'rgba(240, 244, 255, 0.10)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `bold ${FONT_SIZE}px 'IBM Plex Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * FONT_SIZE;
      const y = drops[i] * FONT_SIZE;

      if (drops[i] > 1 && Math.random() > 0.85) {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      } else {
        ctx.fillStyle = `rgba(67, 97, 238, ${0.55 + Math.random() * 0.45})`;
      }

      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.97) drops[i] = 0;
      drops[i] += 0.8 + Math.random() * 0.6;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 35);
})();

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('weeks-container');
  const totalLecturesBadge = document.getElementById('total-lectures');
  const LECTURES_PER_WEEK = 3;
  const HOLIDAY_WORDS = ['no lecture', 'no-lecture', 'holiday'];

  const isHolidayLecture = (lecture) =>
    HOLIDAY_WORDS.some((word) => lecture.title.toLowerCase().includes(word));

  function holidayCard(lecture) {
    const isAlert = lecture.link?.startsWith('javascript:');
    const onclick = isAlert
      ? lecture.link.replace('javascript:', '')
      : "alert('No lecture today!')";

    return `
      <div class="lecture-card lecture-card--holiday">
        <div class="lecture-number">
          <span class="lecture-num-badge lecture-num-badge--holiday">${lecture.lecture_number}</span>
        </div>
        <div class="lecture-info">
          <h3 class="lecture-title">🌸 ${lecture.title}</h3>
          <div class="lecture-meta">
            <div class="meta-item chapter"><i class="fa-solid fa-calendar-xmark"></i> No slides</div>
            <div class="meta-item date"><i class="fa-solid fa-calendar-days"></i> ${lecture.date === '0000/00/00' ? 'Holiday' : lecture.date}</div>
          </div>
        </div>
        <div class="watch-btn-wrap">
          <button class="watch-btn watch-btn--holiday" onclick="${onclick}">
            <i class="fa-solid fa-face-smile-wink"></i> No Lecture!
          </button>
        </div>
      </div>`;
  }

  function lectureCard(lecture) {
    const action = lecture.link
      ? `<a class="watch-btn" href="${lecture.link}" target="_blank" rel="noopener">
           <i class="fa-solid fa-circle-play"></i> Watch Now
         </a>`
      : `<button class="watch-btn" style="opacity:0.5; cursor:not-allowed;" onclick="alert('Link not available for this lecture yet.')">
           <i class="fa-solid fa-circle-play"></i> Not Available
         </button>`;

    return `
      <div class="lecture-card">
        <div class="lecture-number">
          <span class="lecture-num-badge">${lecture.lecture_number}</span>
        </div>
        <div class="lecture-info">
          <h3 class="lecture-title">${lecture.title}</h3>
          <div class="lecture-meta">
            <div class="meta-item chapter"><i class="fa-solid fa-book-open"></i> ${lecture.slides_numbers}</div>
            <div class="meta-item date"><i class="fa-solid fa-calendar-days"></i> ${lecture.date}</div>
          </div>
        </div>
        <div class="watch-btn-wrap">${action}</div>
      </div>`;
  }

  function weekBlock(week, weekIndex) {
    const weekNum = String(weekIndex + 1).padStart(2, '0');
    const cards = week
      .map((lecture) => (isHolidayLecture(lecture) ? holidayCard(lecture) : lectureCard(lecture)))
      .join('');

    return `
      <div class="week-block">
        <div class="week-label-col">
          <span class="week-label-text">Week${weekNum}</span>
        </div>
        <div class="week-content">${cards}</div>
      </div>`;
  }

  fetch('https://ahmadessawii06.github.io/Computer-Architecture-Manar-Lectures/data/data.json')
    .then((res) => res.json())
    .then((data) => {
      if (totalLecturesBadge) totalLecturesBadge.textContent = `${data.length} Lectures`;

      const weeks = [];
      for (let i = 0; i < data.length; i += LECTURES_PER_WEEK) {
        weeks.push(data.slice(i, i + LECTURES_PER_WEEK));
      }

      container.innerHTML = weeks.map(weekBlock).join('');
    })
    .catch((err) => {
      console.error('Error loading lectures JSON:', err);
      container.innerHTML = `<div style="text-align:center; padding: 2rem; color: red;">Error loading lectures. Please check if data/data.json exists.</div>`;
    });
});
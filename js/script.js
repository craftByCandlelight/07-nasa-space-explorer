// Inputs and elements
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const fetchBtn = document.getElementById('fetchBtn');
const quickButtons = document.querySelectorAll('.quick-btn');
const surpriseBtn = document.getElementById('surpriseBtn');

// Modal elements
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModal = document.getElementById('closeModal');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Theme toggle
const themeToggle = document.getElementById("themeToggle");

// Parallax header
const siteHeader = document.querySelector(".site-header");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️ Light Mode";
} else {
  themeToggle.textContent = "🌙 Dark Mode";
}

// Toggle theme (with subtle animation)
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙 Dark Mode";
  }

  // Tiny bounce animation
  themeToggle.style.transform = "scale(0.95)";
  setTimeout(() => {
    themeToggle.style.transform = "scale(1)";
  }, 150);
});

// State for modal navigation
let currentItems = [];
let currentIndex = 0;

// Random Space Facts
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin 600 times per second.",
  "Jupiter has the shortest day of all planets.",
  "The Sun accounts for 99.86% of all mass in the solar system.",
  "There are more stars in the universe than grains of sand on Earth.",
  "The Milky Way galaxy is on a collision course with Andromeda.",
  "Saturn could float in water because it’s mostly gas."
];

// Display random fact
document.getElementById('spaceFact').textContent =
  "🚀 Did You Know? " + spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// Setup date inputs
setupDateInputs(startInput, endInput);

// Your API key
const apiKey = "vggBw4Iucrfd4YgST1GI71cXnl3NKaOg4TMlEfhy";

// Helper: show loading
function showLoading() {
  gallery.innerHTML = `
    <div class="loading">
      🔄 Retrieving cosmic images…<br/>
      <small>Hang tight! NASA is sending data from space.</small>
    </div>
  `;
}

// Helper: show error
function showError(message) {
  gallery.innerHTML = `<p class="loading">⚠️ ${message}</p>`;
}

// Fetch APOD images for a date range
async function fetchImagesRange(startDate, endDate) {
  showLoading();

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      showError("Unexpected response from NASA. Please try again.");
      return;
    }

    currentItems = data.filter(item => item.media_type === "image" || item.media_type === "video");
    renderGallery(currentItems);

  } catch (error) {
    showError("Error loading images. Please check your connection and try again.");
  }
}

// Fetch a single random APOD
async function fetchRandomApod() {
  showLoading();

  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    currentItems = data;
    renderGallery(currentItems);

  } catch (error) {
    showError("Error loading random image. Please try again.");
  }
}

// Render gallery (with 3D tilt)
function renderGallery(items) {
  gallery.innerHTML = "";

  if (!items.length) {
    gallery.innerHTML = `<p class="loading">No entries found for this range. Try another set of dates.</p>`;
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "gallery-item";

    if (item.media_type === "image") {
      card.innerHTML = `
        <img src="${item.url}" alt="${item.title}" />
        <p><strong>${item.title}</strong><br>${item.date}</p>
      `;
      card.addEventListener("click", () => openModal(index));
    } else {
      card.innerHTML = `
        <p><strong>${item.title}</strong><br>${item.date}</p>
        <a href="${item.url}" target="_blank">🎥 Watch Video</a>
      `;
      card.addEventListener("click", () => {
        window.open(item.url, "_blank");
      });
    }

    // 3D tilt effect
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-y * 10).toFixed(2);
      const rotateY = (x * 10).toFixed(2);
      card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.15)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
    });

    gallery.appendChild(card);
  });
}

// Main button: Explore Space Photos
fetchBtn.addEventListener("click", () => {
  const startDate = startInput.value;
  const endDate = endInput.value;
  if (!startDate || !endDate) {
    showError("Please select both a start and end date.");
    return;
  }
  fetchImagesRange(startDate, endDate);
});

// Quick range buttons
quickButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const range = btn.dataset.range;

    // Spin animation for "Spin the NASA Calendar"
    if (btn.classList.contains("spin-btn")) {
      btn.classList.add("spin-active");
      setTimeout(() => btn.classList.remove("spin-active"), 400);
    }

    if (range === "random") {
      const start = new Date(earliestDate);
      const end = new Date(today);
      const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
      const randomDate = new Date(randomTime).toISOString().split("T")[0];

      startInput.value = randomDate;
      endInput.value = randomDate;
      fetchImagesRange(randomDate, randomDate);
      return;
    }

    const days = parseInt(range, 10);
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(end.getDate() - (days - 1));

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    startInput.value = startStr;
    endInput.value = endStr;
    fetchImagesRange(startStr, endStr);
  });
});

// Surprise Me button
surpriseBtn.addEventListener("click", () => {
  // Sparkle animation
  surpriseBtn.classList.add("sparkle-active");
  setTimeout(() => surpriseBtn.classList.remove("sparkle-active"), 800);

  fetchRandomApod();
});

// Modal functions
function openModal(index) {
  const item = currentItems[index];
  currentIndex = index;

  if (item.media_type === "image") {
    modalImg.src = item.url;
    modalImg.style.display = "block";
  } else {
    modalImg.style.display = "none";
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation || "No explanation available.";
  modal.classList.remove("hidden");
}

function closeModalFn() {
  modal.classList.add("hidden");
}

closeModal.addEventListener("click", closeModalFn);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFn();
});

// Keyboard ESC to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModalFn();
  }
});

// Modal navigation
prevBtn.addEventListener("click", () => {
  if (!currentItems.length) return;
  currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
  openModal(currentIndex);
});

nextBtn.addEventListener("click", () => {
  if (!currentItems.length) return;
  currentIndex = (currentIndex + 1) % currentItems.length;
  openModal(currentIndex);
});

// Parallax header + Back to Top rocket
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY || window.pageYOffset;

  // Parallax header
  siteHeader.style.transform = `translateY(${scrollY * 0.15}px)`;
});

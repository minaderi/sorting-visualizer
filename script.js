const barsContainer = document.getElementById("bars");
const shuffleBtn = document.getElementById("shuffle-btn");
const bubbleBtn = document.getElementById("bubble-btn");
const quickBtn = document.getElementById("quick-btn");
const sizeSlider = document.getElementById("size-slider");
const speedSlider = document.getElementById("speed-slider");
const sizeValue = document.getElementById("size-value");
const speedValue = document.getElementById("speed-value");
const comparisonsEl = document.getElementById("comparisons");
const swapsEl = document.getElementById("swaps");
const buttons = [shuffleBtn, bubbleBtn, quickBtn];

let array = [];
let bars = [];
let comparisons = 0;
let swaps = 0;

// Slider 1-100 arası; yüksek hız = kısa bekleme
function getDelay() {
  return 101 - Number(speedSlider.value);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateStats() {
  comparisonsEl.textContent = comparisons;
  swapsEl.textContent = swaps;
}

function resetStats() {
  comparisons = 0;
  swaps = 0;
  updateStats();
}

function generateArray() {
  const count = Number(sizeSlider.value);
  array = Array.from({ length: count }, () => Math.floor(Math.random() * 95) + 5);
  renderBars();
  resetStats();
}

function renderBars() {
  barsContainer.innerHTML = "";
  bars = array.map(value => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${value}%`;
    barsContainer.appendChild(bar);
    return bar;
  });
}

function setBusy(busy) {
  buttons.forEach(btn => (btn.disabled = busy));
  sizeSlider.disabled = busy;
}

// İki çubuğu karşılaştırırken sarı yak
async function compare(i, j) {
  comparisons++;
  updateStats();
  bars[i].classList.add("comparing");
  bars[j].classList.add("comparing");
  await sleep(getDelay());
  bars[i].classList.remove("comparing");
  bars[j].classList.remove("comparing");
}

// Yer değiştirirken kırmızı yak
async function swap(i, j) {
  swaps++;
  updateStats();
  bars[i].classList.add("swapping");
  bars[j].classList.add("swapping");
  [array[i], array[j]] = [array[j], array[i]];
  bars[i].style.height = `${array[i]}%`;
  bars[j].style.height = `${array[j]}%`;
  await sleep(getDelay());
  bars[i].classList.remove("swapping");
  bars[j].classList.remove("swapping");
}

// Bitince soldan sağa yeşil dalga
async function markAllSorted() {
  for (const bar of bars) {
    bar.classList.add("sorted");
    await sleep(5);
  }
}

async function bubbleSort() {
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      await compare(j, j + 1);
      if (array[j] > array[j + 1]) {
        await swap(j, j + 1);
      }
    }
  }
}

async function quickSort(low, high) {
  if (low >= high) return;
  const pivotIndex = await partition(low, high);
  await quickSort(low, pivotIndex - 1);
  await quickSort(pivotIndex + 1, high);
}

async function partition(low, high) {
  const pivot = array[high];
  let i = low;
  for (let j = low; j < high; j++) {
    await compare(j, high);
    if (array[j] < pivot) {
      if (i !== j) await swap(i, j);
      i++;
    }
  }
  if (i !== high) await swap(i, high);
  return i;
}

async function runSort(sortFn) {
  setBusy(true);
  resetStats();
  bars.forEach(bar => bar.classList.remove("sorted"));
  await sortFn();
  await markAllSorted();
  setBusy(false);
}

sizeSlider.addEventListener("input", () => {
  sizeValue.textContent = sizeSlider.value;
  generateArray();
});
speedSlider.addEventListener("input", () => {
  speedValue.textContent = speedSlider.value;
});
shuffleBtn.addEventListener("click", generateArray);
bubbleBtn.addEventListener("click", () => runSort(bubbleSort));
quickBtn.addEventListener("click", () => runSort(() => quickSort(0, array.length - 1)));

generateArray();
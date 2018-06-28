// user-defined
const PADDING = 15;

let masonry;
let masonryWidth;
let columnNumber;
let itemWidth;
let items;

function handleResize() {
  updateMasonryWidth();
  updateColumnNumber();
  updateItemWidth();
  updateItemsArray();
  
  repositionItems();
}

function updateMasonryWidth() {
  masonryWidth = masonry.clientWidth;
}

function updateColumnNumber() {
  let width = window.innerWidth;
  if (width < 576) {
    columnNumber = 1;
  } else if (width < 768) {
    columnNumber = 2;
  } else if (width < 992) {
    columnNumber = 3;
  } else {
    columnNumber = 4;
  }
}

function updateItemWidth() {
  itemWidth = masonryWidth / columnNumber - PADDING;
}

function updateItemsArray() {
  items = document.getElementsByClassName('item');
}

function repositionItems() {
  let widths = [], heights = [];
  for (let i = 0; i < columnNumber; i++) {
    widths[i] = i * itemWidth + i * PADDING + PADDING / 2;
    heights[i] = 0;
  }

  for (let i = 0; i < items.length; i++) {
    items[i].style.width = itemWidth + 'px';
    const height = items[i].clientHeight;
    const nextColumnIndex = heights.indexOf(Math.min(...heights));
    items[i].style.left = widths[nextColumnIndex] + 'px';
    items[i].style.top = heights[nextColumnIndex] + 'px';
    heights[nextColumnIndex] += height + PADDING;
  }

  masonry.style.height = Math.max(...heights) + 'px';
}

window.onload = function() {
  masonry = document.getElementById('masonry');

  if (!masonry) return;

  window.matchMedia('(max-width: 1199.98px)').addListener(handleResize);
  window.matchMedia('(max-width: 991.98px)').addListener(handleResize);
  window.matchMedia('(max-width: 767.98px)').addListener(handleResize);
  window.matchMedia('(max-width: 575.98px)').addListener(handleResize);

  handleResize();

  /////////////////////

  checkWebp();

  fetchTrendingGifs();

  $('#search-form').submit(e => {
    e.preventDefault();
    let query = $('#search-form :input').val();
    let regexResult = query.match(/^[a-z0-9][a-z0-9 ]{0,200}/gi);
    if (regexResult == null || regexResult.length != 1 || regexResult[0].length != query.length) {
      $('#search-input').addClass('red-shadow');
      setTimeout(() => {
        $('#search-input').removeClass('red-shadow');
      }, 800);
      return;
    }
    currentQuerry = query;
    switchMode('search');
    fetchGifs();
  });

  $('#nav-star').click(displayFavorites);
};
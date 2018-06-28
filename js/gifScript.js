const api_key = 'TcvaoapP8KRl1rLW7J8pLElyvytdwwBP'; // noyo123
const base_url = 'https://api.giphy.com/v1/gifs/';

let currentQuerry;
let mode = 'trending';
let inc = 30;
let off = 0;
let webpEnabled = false;

function createGif(src, link, id) {
  let item = document.createElement('div');
  item.classList.add('item');
  let gif = document.createElement('div');
  gif.classList.add('gif');
  let img = document.createElement('img');
  img.src = src;
  img.onload = handleResize;

  let favorite = document.createElement('a');
  favorite.innerHTML = '<i class="material-icons orange">' + (isInFavorites(id) ? 'star' : 'star_border') + '</i>';
  favorite.classList.add('favorite-img');
  favorite.href = '#';
  gif.onmouseenter = function() {
    let star = gif.getElementsByClassName('favorite-img')[0];
    star.classList.add('show-star');
  }
  gif.onmouseleave = function() {
    let star = gif.getElementsByClassName('favorite-img')[0];
    star.classList.remove('show-star');
  }

  gif.appendChild(img);
  gif.appendChild(favorite);
  item.appendChild(gif);
  document.getElementById('masonry').appendChild(item);

  $(favorite).click(e => {
    e.preventDefault();
    let star = gif.getElementsByClassName('favorite-img')[0];
    if (!isInFavorites(id)) {
      addToFavorites(id);
    } else {
      removeFromFavorites(id);
    }
    $('#favorites p').text('Favorites (' + getFavoritesCount() + ')');
    star.innerHTML = '<i class="material-icons orange">' + (isInFavorites(id) ? 'star' : 'star_border') + '</i>';
  });
}

function handleGifs(gifData) {
  for (let i = 0; i < gifData.length; i++) {
    let src;
    if (webpEnabled) {
      src = gifData[i].images.fixed_width.webp;
    } else {
      src = gifData[i].images.fixed_width_downsampled.url;
    }
    createGif(src, gifData[i].bitly_url, gifData[i].id);
  }
}

function fetchTrendingGifs(rating = 'G') {
  let url = base_url + 'trending?api_key=' + api_key + '&limit=' + inc + '&offset=' + off + '&rating=' + rating;
  fetch(url)
    .then(request => {
      return request.json();
    })
    .then(data => {
      handleGifs(data.data);
    })
    .catch(error => {
      console.log(error);
    });
}

function fetchGifs(rating = 'G', lang = 'en') {
  let url = base_url + 'search?api_key=' + api_key + '&q=' + currentQuerry + '&limit=' + inc + '&offset=' + off + '&rating=' + rating + '&lang=' + lang;
  fetch(url)
    .then(request => {
      return request.json();
    })
    .then(data => {
      handleGifs(data.data);
    })
    .catch(error => {
      console.log(error);
    });
}

function fetchFavorites() {
  let gif_ids = JSON.parse(window.localStorage.getItem('favorites'));
  if (gif_ids == null || gif_ids.favorites.length == 0) return;
  gif_ids = gif_ids.favorites;
  if (gif_ids.length < off + 1) return;
  let url = 'https://api.giphy.com/v1/gifs?api_key=' + api_key + '&ids=';
  for (var i = off; i < off + inc; i++) {
    if (gif_ids[i] == undefined) break;
    url += gif_ids[i];
    url += ',';
  }
  url = url.slice(0, -1);
  fetch(url)
    .then(request => {
      return request.json();
    })
    .then(data => {
      handleGifs(data.data);
    })
    .catch(error => {
      console.log(error);
    })
}

function switchMode(m) {
  if (m.includes('search')) {
    mode = 'search';
  } else if (m.includes('favorites')) {
    mode = 'favorites';
  } else {
    mode = 'trending';
  }
  off = 0;
  clearGifs();
}

$(window).scroll(function() {
  if($(window).scrollTop() + $(window).height() == $(document).height()) {
    loadMore();
  }
});

window.onscroll = function() {
  if (document.body.scrollTop > 900 || document.documentElement.scrollTop > 900) {
    $('#topBtn').css('opacity', '1');
  } else {
    $('#topBtn').css('opacity', '0');
  }
}

function loadMore() {
  off += inc;
  if (mode.includes('trending')) {
    fetchTrendingGifs();
  } else if (mode.includes('search')) {
    fetchGifs();
  } else if (mode.includes('favorites')) {
    fetchFavorites();
  }
}

function clearGifs() {
  document.getElementById('masonry').innerHTML = '';
}

function goToTop() {
  if (parseFloat(document.getElementById('topBtn').style.opacity) < .1) {
    return;
  }
  $('html, body').animate({scrollTop: 0}, 'slow');
}

function removeFromFavorites(id) {
  let favorites = JSON.parse(window.localStorage.getItem('favorites'));
  if (favorites != null && favorites.favorites.includes(id)) {
    favorites.favorites.splice(favorites.favorites.indexOf(id), 1);
  }
  window.localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isInFavorites(id) {
  let favorites = JSON.parse(window.localStorage.getItem('favorites'));
  if (favorites != null && favorites.favorites.includes(id)) return true;
  return false;
}

function addToFavorites(id) {
  let favorites = JSON.parse(window.localStorage.getItem('favorites'));
  if (favorites == null) favorites = {favorites: []};
  if (!favorites.favorites.includes(id)) favorites.favorites.push(id);
  window.localStorage.setItem('favorites', JSON.stringify(favorites));
}

function getFavoritesCount() {
  let gif_ids = JSON.parse(window.localStorage.getItem('favorites'));
  if (gif_ids == null) return 0;
  return gif_ids.favorites.length > 99 ? '99+' : gif_ids.favorites.length;
}

function displayFavorites() {
  switchMode('favorites');
  fetchFavorites();
}

function checkWebp() {
  // quality toggling is available only if the browser supports webp
  // otherwise downsampled gifs are used
  var img = new Image();
  img.onload = function() {
    webpEnabled = !!(img.height > 0 && img.width > 0);
    if (webpEnabled) {
      $('#quality')
        .click(e => {
          e.preventDefault();
          if (webpEnabled) toggleQuality();
        })
        .css('display', 'initial');
    }
  };
  img.onerror = function() {
    webpEnabled = false;
  }
  img.src = 'https://www.gstatic.com/webp/gallery/1.webp';
}
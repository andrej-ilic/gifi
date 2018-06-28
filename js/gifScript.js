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
  let a = document.createElement('a');
  a.href = link;
  a.target = '_blank';

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
  a.appendChild(img);
  gif.appendChild(a);
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
    if (gifData[i].images.fixed_width.webp.length < 1 ||
        gifData[i].images.fixed_width_downsampled.webp.length < 1 ||
        gifData[i].images.fixed_width_downsampled.url.length < 1) {
      continue;
    }

    let src;
    if (webpEnabled) {
      if (!isMobile()) {
        src = gifData[i].images.fixed_width.webp;
      } else {
        src = gifData[i].images.fixed_width_downsampled.webp;
      }
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

function isMobile() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}
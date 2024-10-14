let currentSong = new Audio();
let songs;
let currfolder;
let ncs;

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    let ele = as[i];
    if (ele.href.endsWith(".mp3")) {
      songs.push(ele.href.split(`/${folder}/`)[1].split(".mp3")[0]);
    }
  }

  //display all songs in playlist
  let songul = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songul.innerHTML = "";
  for (const song of songs) {
    songul.innerHTML =
      songul.innerHTML +
      `<li>
                <img class="invert" src="img/music.svg" alt="Song">
                <div class="info">
                  <div>${song.replaceAll("%20", " ").split(" - ")[1]}</div>
                  <div>${song.replaceAll("%20", " ").split(" - ")[0]}</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="img/play.svg" alt="Play">
                </div>
            </li>`;
  }

  // attach event listner to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(
        e.querySelector(".info").children[1].innerHTML +
          " - " +
          e.querySelector(".info").firstElementChild.innerHTML +
          ".mp3"
      );
    });
  });
  let app = [];
  for (let i = 0; i < songs.length; i++) {
    app[i] = songs[i].replaceAll("%20", " ");
  }
  return app;
}

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = track.split(".mp3")[0];
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/songs/")[1].split("/")[0];
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="25" cy="25" r="25" fill="#1abc54" />
                  <path
                    d="M12.8906 8.846C12.5371 10.189 10.8667 11.138 7.5257 13.0361C4.296 14.8709 2.6812 15.7884 1.37983 15.4196C0.8418 15.2671 0.35159 14.9776 0.95624 14.5787C0 13.6139 0 11.7426 0 8C0 4.2574 0 2.3861 0.95624 1.42132C1.35159 1.02245 1.8418 0.73288 2.37983 0.58042C3.6812 0.21165 5.296 1.12907 8.5257 2.96393C11.8667 4.86197 13.5371 5.811 13.8906 7.154C14.0365 7.7084 14.0365 8.2916 13.8906 8.846Z"
                    fill="black"
                    stroke="black"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                    transform="translate(12, 10) scale(1.1) translate(5, 5)"
                  />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="Album" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  // load playlist when card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0] + ".mp3");
    });
  });
}
async function main() {
  // get all songs
  await getSongs("songs/Hollywood-Hits");
  playMusic(songs[0].replaceAll("%20", " ") + ".mp3", true);

  // display all albums on the page
  displayAlbums();

  //attach event listner to previos, play and pause buttons
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add eventlistner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add eventlistner to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // add event listner to close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add eventlistners to previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src
        .split(`/${currfolder}/`)[1]
        .split(".mp3")[0]
        .replaceAll("%20", " ")
    );
    if (index == -1) {
      let app = [];
      for (let i = 0; i < songs.length; i++) {
        app[i] = songs[i].replaceAll("%20", " ");
      }
      index = app.indexOf(
        currentSong.src
          .split(`/${currfolder}/`)[1]
          .split(".mp3")[0]
          .replaceAll("%20", " ")
      );
    }
    if (index - 1 >= 0) {
      playMusic(songs[index - 1].replaceAll("%20", " ") + ".mp3");
    }
  });

  // add eventlistners to next
  next.addEventListener("click", () => {
    let index = songs.indexOf(
      currentSong.src
        .split(`/${currfolder}/`)[1]
        .split(".mp3")[0]
        .replaceAll("%20", " ")
    );
    if (index == -1) {
      let app = [];
      for (let i = 0; i < songs.length; i++) {
        app[i] = songs[i].replaceAll("%20", " ");
      }
      index = app.indexOf(
        currentSong.src
          .split(`/${currfolder}/`)[1]
          .split(".mp3")[0]
          .replaceAll("%20", " ")
      );
    }
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1].replaceAll("%20", " ") + ".mp3");
    }
  });

  // add eventlistner to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
    });

  // add event listner to volume button
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.2;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 20;
    }
  });
}
main();

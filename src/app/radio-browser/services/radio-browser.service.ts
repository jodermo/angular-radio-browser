import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

(window as any).radio = window['radio'] || {
  audio: null,
  station: null,
  searchResult: null,
  filter: null,
  volume: 1,
};

@Injectable({
  providedIn: 'root'
})
export class RadioBrowserService {
  API = {
    protocol: 'https',
    url: 'api.radio-browser.info/json',
    subdomains: ['de1'],
  };
  defaultStationThumbnail = '/assets/images/radio_placeholder.png';
  searchApiUrl = 'https://de1.api.radio-browser.info/json';
  filter = {
    type: 'stations',
    by: 'name',
    value: null,
    order: 'name',
    limit: 100,
    offset: 0,
    reverse: false,
    exact: false,
    prefix: null,
  };
  filterTypes = [
    {
      name: 'stations',
      filterBy: ['name', 'country', 'language', 'tag'], // old: ['name', 'codec', 'country', 'state', 'language', 'tag', 'id', 'uuid']
      options: null
    },
  ];
  oderTypes = ['name', 'country', 'language', 'tags']; // old: ['name', 'url', 'homepage', 'favicon', 'tags', 'country', 'state', 'language', 'votes', 'negativevotes', 'codec', 'bitrate', 'lastcheckok', 'lastchecktime', 'clicktimestamp', 'clickcount', 'clicktrend'];
  currentFilterType = this.filterTypes[0];
  lastSearchQuery;
  searchResult = [] as any;
  searching = false;
  firstSearch = false;
  audio: any;
  streamUrl = '';
  station = null;
  stationReady = false;
  favoriteStations = [];
  lastVolume = 1;
  duration = 0;
  durationString = null;
  time = 0;
  timeString = null;
  audioState = 'none';
  callbacks = {
    onPlay: [],
    onPause: [],
    onTimeUpdate: []
  };
  ready = false;
  showFavorites = false;

  constructor(private http: HttpClient) {
  }

  init() {
    const searchQuery = localStorage.getItem('radio-filter-value');
    const radioName = localStorage.getItem('radio-station-name');
    this.getFavoriteStations();
    if (searchQuery) {
      this.selectFilterByType(this.filter.type || this.filterTypes[0].name);
      this.filter.value = radioName;
      localStorage.removeItem('radio-search');
      this.searchStations(searchQuery, radioName || null);
    }
    if (window && window['radio'] && window['radio'].audio) {
      this.audio = window['radio'].audio;
      this.station = window['radio'].station || null;
      this.searchResult = window['radio'].searchResult || null;
      if (window['radio'].filter) {
        this.filter = window['radio'].filter;
      }
      this.selectFilterByType(this.filter.type || this.filterTypes[0].name);
    } else {
      this.filter.type = localStorage.getItem('radio-filter-type') || null;
      this.filter.prefix = localStorage.getItem('radio-filter-prefix') || null;
      this.filter.by = localStorage.getItem('radio-filter-by') || null;
      if (searchQuery) {
        this.filter.value = searchQuery;
        this.searchStations(this.filter.value, radioName || null);
      } else {
        this.selectFilterByType(this.filter.type || this.filterTypes[0].name);
      }
    }
    this.playbackEvents();
    setTimeout(() => {
      this.ready = true;
    }, 0);

  }

  selectFilterByType(type) {
    let filterType = null;
    for (const fType of this.filterTypes) {
      if (fType.name === type) {
        filterType = fType;
      }
    }
    if (filterType) {
      this.selectFilterType(filterType);
    }
  }

  selectFilterType(filterType) {
    this.currentFilterType = filterType;
    this.filter.prefix = filterType.urlPrefix;
    this.filter.type = filterType.name;
    this.filter.by = null;
    if (filterType.filterBy && filterType.filterBy.length) {
      this.filter.by = filterType.filterBy[0];
    }
    this.filter.value = null;
    if (filterType.options && filterType.options.length) {
      this.filter.value = filterType.options[0];
    }
    window['radio'].filter = this.filter;
    return this.filter;
  }

  searchStations(query = this.filter.value, selectStationName: any = false) {
    this.showFavorites = false;
    if (query) {
      this.filter.value = query;
      localStorage.setItem('radio-filter-prefix', this.filter.prefix);
      localStorage.setItem('radio-filter-type', this.filter.type);
      localStorage.setItem('radio-filter-by', this.filter.by);
      localStorage.setItem('radio-filter-value', this.filter.value);
      let exactStr = '';
      if (this.filter.exact) {
        exactStr = 'exact';
      }
      let searchUrl = this.searchApiUrl + '/' + (this.filter.type || 'stations') + '/by' + (this.filter.by || 'name') + exactStr + '/' + this.filter.value + '?limit=' + this.filter.limit;

      if (this.filter.order) {
        searchUrl += '&order=' + this.filter.order;
      }
      if (this.filter.reverse) {
        searchUrl += '&reverse=true';
      }

      searchUrl += '&callback=foo';
      if (searchUrl !== this.lastSearchQuery) {
        this.searching = true;
        this.searchResult = [];
        window['radio'].searchResult = [];
        this.get(searchUrl).subscribe((data) => {
          if (selectStationName) {
            this.searchResult.forEach(radio => {
              if (radio.name && radio.name === selectStationName) {
                return this.selectStation(radio);
              }
            });
          }
          this.showResult(data, searchUrl);
          this.searching = false;
        }, (error) => {
          this.searching = false;
        });
      } else {
        this.searching = false;
      }

    }

  }

  showResult(resultData, searchQuery) {
    this.lastSearchQuery = searchQuery;
    this.searchResult = resultData;
    this.firstSearch = true;
    window['radio'].searchResult = this.searchResult;
  }

  searchStationsNew(selectStationName: any = null) {
    /*
    RadioBrowser.getStations(filter)
      .then((data) => {
        this.searchResult = data;
        window['radio'].searchResult = this.searchResult;
        this.searching = false;
        if (selectStationName) {
          this.searchResult.forEach(radio => {
            if (radio.name && radio.name === selectStationName) {
              return this.selectStation(radio);
            }
          });
        }
      })
      .catch((error) => {
        this.searching = false;
      });
     */
  }

  selectStation(station: any) {
    window['radio'].station = station;
    localStorage.setItem('radio-station-name', station.name || null);
    this.station = station;
    this.streamUrl = station.url;
    this.scrollToStation(station);
    this.startStream();
  }

  stationActive(station: any) {
    return (this.station && station.stationuuid === this.station.stationuuid);
  }

  scrollToStation(station = this.station) {
    if (station.stationuuid) {
      const elm = document.getElementById('radio_' + station.stationuuid);
      if (elm) {
        elm.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }

  errorStationThumbnail(event) {
    event.target.src = this.defaultStationThumbnail;
  }

  getFavoriteStations() {
    const stations = localStorage.getItem('radio-favorite-stations');
    this.favoriteStations = JSON.parse(stations) || [];
  }

  stationIsFavorite(station: any) {
    for (const fStation of this.favoriteStations) {
      if (fStation.stationuuid === station.stationuuid) {
        return true;
      }
    }
    return false;
  }

  setFavoriteStation(station: any, event: Event = null) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.stationIsFavorite(station)) {
      this.favoriteStations.push(station);
      localStorage.setItem('radio-favorite-stations', JSON.stringify(this.favoriteStations));
    }
  }

  unsetFavoriteStation(station: any, event: Event = null) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    for (let i = 0; i < this.favoriteStations.length; i++) {
      if (this.favoriteStations[i].stationuuid === station.stationuuid) {
        this.favoriteStations.splice(i, 1);
      }
    }
    localStorage.setItem('radio-favorite-stations', JSON.stringify(this.favoriteStations));
  }

  toggleFavoriteStation(station: any, event: Event = null) {
    if (!this.stationIsFavorite(station)) {
      this.setFavoriteStation(station, event);
    } else {
      this.unsetFavoriteStation(station, event);
    }
  }

  selectNextStation() {
    let stations = this.searchResult;
    if (this.showFavorites && this.favoriteStations) {
      stations = this.favoriteStations;
    }
    if (this.station && stations) {
      let next = null;
      for (let i = 0; i < stations.length; i++) {
        if (stations[i] === this.station) {
          if (i < stations.length - 1) {
            next = stations[i + 1];
          } else {
            next = stations[0];
          }
        }
      }
      if (next) {
        this.selectStation(next);
      } else {
        this.selectStation(stations[0]);
      }
    }
  }

  selectPrevStation() {
    let stations = this.searchResult;
    if (this.showFavorites && this.favoriteStations) {
      stations = this.favoriteStations;
    }
    if (this.station && stations) {
      let next = null;
      for (let i = 0; i < stations.length; i++) {
        if (stations[i] === this.station) {
          if (i > 0) {
            next = stations[i - 1];
          } else {
            next = stations[stations.length - 1];
          }
        }
      }
      if (next) {
        this.selectStation(next);
      } else {
        this.selectStation(stations[stations.length - 1]);
      }
    }
  }

  startStream() {
    this.removeStream();
    if (this.streamUrl) {
      if (window['radio'] && window['radio'].audio) {
        window['radio'].audio.pause();
        window['radio'].audio.removeAttribute('src');
        window['radio'].audio.load();
      }
      this.stationReady = false;
      this.audioState = 'loading';
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.addEventListener('play', (e) => {
          this.triggerOnPlay(e);
        });
        this.audio.addEventListener('pause', (e) => {
          this.triggerOnPause(e);
        });
        this.audio.addEventListener('timeupdate', (e) => {
          this.triggerOnTimeUpdate(e);
        });
        this.audio.addEventListener('canplay', (e) => {
          this.stationReady = true;
          this.audioState = 'ready';
        });
      }
      this.audio.autoplay = true;
      // this.audio.crossorigin = 'anonymous';
      // this.audio.crossOrigin = 'anonymous';
      this.audio.src = this.streamUrl;
      window['radio'].audio = this.audio;
      window['radio'].station = this.station;
      this.playbackEvents();
      this.ready = true;
    }
  }

  onPlay(callback: any) {
    this.callbacks.onPlay.push(callback);
  }

  triggerOnPlay(event) {
    for (const callback of this.callbacks.onPlay) {
      callback(event);
    }
  }

  onPause(callback: any) {
    this.callbacks.onPause.push(callback);
  }

  triggerOnPause(event) {
    for (const callback of this.callbacks.onPause) {
      callback(event);
    }
  }

  onTimeUpdate(callback: any) {
    this.callbacks.onTimeUpdate.push(callback);
  }

  triggerOnTimeUpdate(event) {
    for (const callback of this.callbacks.onTimeUpdate) {
      callback(event);
    }
  }

  removeStream() {
    window['radio'].audio = null;
    window['radio'].station = null;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.ready = false;
  }

  playbackEvents() {
    if (this.audio) {
      this.audio.volume = this.lastVolume;
      this.audio.onplay = () => {
        this.audioState = 'playing';
      };
      this.audio.onpause = () => {
        this.audioState = 'paused';
      };
      this.audio.ontimeupdate = () => {
        this.time = this.audio.currentTime;
        this.timeString = this.valToTime(this.time);
        this.duration = this.audio.duration;
        this.durationString = this.valToTime(this.duration);
      };
      this.audio.oncanplay = () => {
        if (this.audio.paused) {
          this.audio.play();
        }
      };
    }
  }

  valToTime(value: number) {
    const format = (val) => {
      val = parseInt(val);
      if (val < 10) {
        return '0' + val;
      } else {
        return String(val);
      }
    };
    const s = value % 60;
    const m = (value / 60) % 60;
    const h = ((value / 60) % 60) % 60;
    if (value) {
      return format(h) + ':' + format(m) + ':' + format(s);
    } else {
      return null;
    }

  }

  togglePause() {
    if (this.audio && this.audio.paused) {
      this.audio.play();
    } else if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  toggleMute() {
    if (this.audio) {
      if (this.audio.volume === 0) {
        this.audio.volume = this.lastVolume;
      } else {
        this.lastVolume = this.audio.volume;
        this.audio.volume = 0;
      }
    }
  }

  checkTimeString(timeString) {
    if (timeString && !timeString.includes('NaN')) {
      return true;
    }
    return false;
  }

  get(url) {
    return this.http.get(url)
      .pipe(
        tap(
          data => {
            // console.log(url, data);
          },
          this.handleError
        )
      );
  }

  clearStorage() {
    localStorage.removeItem('radio-station-name');
    localStorage.removeItem('radio-filter-prefix');
    localStorage.removeItem('radio-filter-type');
    localStorage.removeItem('radio-filter-by');
    localStorage.removeItem('radio-filter-value');
  }

  private handleError(error) {
    return throwError(error);
  }
}

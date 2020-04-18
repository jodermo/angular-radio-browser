import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../../services/app.service';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { AppConfig } from '../../config/app.config';


@Injectable({
  providedIn: 'root'
})
export class RadioBrowserService {
  config: AppConfig = new AppConfig();
  mobileApp = this.config.mobileApp;
  API = {
    protocol: 'https',
    url: 'api.radio-browser.info/json',
    subdomains: ['de1'],
  };
  defaultStationThumbnail = 'assets/svg/radio.svg';
  searchApiUrl = 'https://de1.api.radio-browser.info/json';
  connectionTimeout = 5000;
  disallowedPrefixes = ['.m3u8', '.m3u', '?mp=/stream', '.pls'];
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
  resultData = [] as any;
  searchResult = [] as any;
  searching = false;
  firstSearch = false;
  audio: any;
  streamUrl = '';
  station = null;
  stationReady = false;
  favoriteStations = [];
  inactiveStations = [];
  lastVolume = 1;
  duration = 0;
  durationString = null;
  time = 0;
  timeString = null;
  callbacks = {
    onPlay: [],
    onPause: [],
    onTimeUpdate: []
  };
  visuals = false;
  ready = false;
  showFavorites = false;
  showInactive = false;
  showOverlay = false;
  overlayTitle = '';
  overlayText = '';
  overlayButtons = null;
  listLayout = 'grid-layout';
  analyzer: AudioAnalyzer;
  canvasId = 'frequencyCanvas';
  localStorageSupport = false;
  paused = true;
  selectNextStationSeconds;
  selectNextStationTimeout;
  errorText;

  constructor(private http: HttpClient, private musicControls: MusicControls) {
    this.localStorageSupport = this.localStorageIsSupported(() => localStorage);
    document.addEventListener('offline', () => {
      this.onOffline();
    }, false);
    document.addEventListener('online', () => {
      this.onOnline();
    }, false);
    window.addEventListener('keydown', evt => {
      switch (evt.keyCode) {
        //ESC
        case 27:
          this.onEsc();
          break;
        //F1
        case 112:
          this.onF1();
          break;
        //Fallback to default browser behaviour
        default:
          return true;
      }
      //Returning false overrides default browser event
      return false;
    });
  }

  onOffline() {
    this.showInfoOverlay('no network connection', 'Device Offline', [
      {
        title: 'OK', event: () => {
          this.hideInfoOverlay();
        }
      }
    ]);
  }

  onOnline() {
    this.hideInfoOverlay();
    this.startStream();
  }

  onEsc() {
    this.removeStream()
  }

  onF1() {
    let message = '';
    let device = new AppService().device;
    for (const key in device) {
      message += key + '\n'
      for (const kkey in device[key]) {
        message += kkey + ' : ' + device[key][kkey] + '\n'
      }
      message += '\n\n'
    }
    this.showInfoOverlay(message, 'Device Info', [
      {
        title: 'OK', event: () => {
          this.hideInfoOverlay();
        }
      }
    ]);
  }

  init(visuals = this.visuals) {
    this.visuals = visuals;
    let searchQuery;
    let radioName;
    let layout;
    if (this.localStorageSupport) {
      searchQuery = localStorage.getItem('radio-filter-value');
      radioName = localStorage.getItem('radio-station-name');
      layout = localStorage.getItem('radio-layout');
    }

    if (layout) {
      this.listLayout = layout;
    }
    this.getInactiveStations();
    this.getFavoriteStations();
    if (searchQuery) {
      this.selectFilterByType(this.filter.type || this.filterTypes[0].name);
      this.filter.value = radioName;
      if (this.localStorageSupport) {
        localStorage.removeItem('radio-search');
      }
      this.searchStations(searchQuery, radioName || null);
    }

    if (this.localStorageSupport) {
      this.filter.type = localStorage.getItem('radio-filter-type') || null;
      this.filter.prefix = localStorage.getItem('radio-filter-prefix') || null;
      this.filter.by = localStorage.getItem('radio-filter-by') || null;
    }
    if (searchQuery) {
      this.filter.value = searchQuery;
      this.searchStations(this.filter.value, radioName || null);
    } else {
      this.selectFilterByType(this.filter.type || this.filterTypes[0].name);
    }

    this.playbackEvents();
    setTimeout(() => {
      this.ready = true;
    }, 0);

  }

  setLayout(layout: string) {
    this.listLayout = layout;
    if (this.localStorageSupport) {
      localStorage.setItem('radio-layout', layout);
    }
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
    return this.filter;
  }

  searchStations(query = this.filter.value, selectStationName: any = false) {
    this.showFavorites = false;
    if (query) {
      this.filter.value = query;
      if (this.localStorageSupport) {
        localStorage.setItem('radio-filter-prefix', this.filter.prefix);
        localStorage.setItem('radio-filter-type', this.filter.type);
        localStorage.setItem('radio-filter-by', this.filter.by);
        localStorage.setItem('radio-filter-value', this.filter.value);
      }
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

  filterResult(resultData = this.resultData) {
    return resultData.filter(station => {
      for (const prefix of this.disallowedPrefixes) {
        for (const inactive of this.inactiveStations) {
          if (station.stationuuid === inactive.stationuuid) {
            return false;
          }
        }
        if (station.url && (station.url as string).includes(prefix)) {
          return false;
        }
      }

      return true;
    });
  }

  showResult(resultData, searchQuery) {
    this.lastSearchQuery = searchQuery;
    this.resultData = resultData;
    this.searchResult = this.filterResult(resultData);
    this.firstSearch = true;
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


    if (this.localStorageSupport) {
      localStorage.setItem('radio-station-name', station.name || null);
    }
    if (this.selectNextStationTimeout) {
      clearTimeout(this.selectNextStationTimeout);
    }
    this.removeStream();
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

  /* inactive stations */
  getInactiveStations() {
    if (this.localStorageSupport) {
      const stations = localStorage.getItem('radio-inactive-stations');
      this.inactiveStations = JSON.parse(stations) || [];
    }
  }

  stationIsInactive(station: any) {
    for (const fStation of this.inactiveStations) {
      if (fStation.stationuuid === station.stationuuid) {
        return true;
      }
    }
    return false;
  }

  setInactiveStation(station: any, event: Event = null) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.stationIsInactive(station)) {
      this.inactiveStations.push(station);
      if (this.localStorageSupport) {
        localStorage.setItem('radio-inactive-stations', JSON.stringify(this.inactiveStations));
      }
    }
    this.getFavoriteStations();
    this.searchResult = this.filterResult(this.resultData);
  }

  unsetInactiveStation(station: any, event: Event = null) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    for (let i = 0; i < this.inactiveStations.length; i++) {
      if (this.inactiveStations[i].stationuuid === station.stationuuid) {
        this.inactiveStations.splice(i, 1);
      }
    }
    if (this.localStorageSupport) {
      localStorage.setItem('radio-inactive-stations', JSON.stringify(this.inactiveStations));
    }
    this.getFavoriteStations();
    this.searchResult = this.filterResult(this.resultData);
  }

  toggleInactiveStation(station: any, event: Event = null) {
    if (!this.stationIsInactive(station)) {
      this.setInactiveStation(station, event);
    } else {
      this.unsetInactiveStation(station, event);
    }
  }


  /* favorite stations */

  getFavoriteStations() {
    if (this.localStorageSupport) {
      const stations = localStorage.getItem('radio-favorite-stations');
      this.favoriteStations = this.filterResult(JSON.parse(stations) || [])
    }
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
      if (this.localStorageSupport) {
        localStorage.setItem('radio-favorite-stations', JSON.stringify(this.favoriteStations));
      }
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
    if (this.localStorageSupport) {
      localStorage.setItem('radio-favorite-stations', JSON.stringify(this.favoriteStations));
    }
  }

  toggleFavoriteStation(station: any, event: Event = null) {
    if (!this.stationIsFavorite(station)) {
      this.setFavoriteStation(station, event);
    } else {
      this.unsetFavoriteStation(station, event);
    }
  }

  selectNextStationIn(seconds: number) {
    if (this.selectNextStationTimeout) {
      clearTimeout(this.selectNextStationTimeout);
    }
    this.selectNextStationSeconds = seconds;
    if (seconds <= 0) {
      this.selectNextStation();
      this.hideInfoOverlay();
    } else {
      this.selectNextStationTimeout = setTimeout(() => {
        this.selectNextStationIn(seconds - 1);
        this.setMusicControls('Error (next in ' + this.selectNextStationSeconds + 's)');
      }, 1000);
    }

  }

  selectNextStation() {
    let stations = this.searchResult;
    if (this.showFavorites && this.favoriteStations) {
      stations = this.favoriteStations;
    } else if (this.showInactive && this.inactiveStations) {
      stations = this.inactiveStations;
    }
    if (this.station && stations) {
      let next = null;
      for (let i = 0; i < stations.length; i++) {
        if (stations[i].stationuuid === this.station.stationuuid) {
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
    } else if (this.showInactive && this.inactiveStations) {
      stations = this.inactiveStations;
    }
    if (this.station && stations) {
      let next = null;
      for (let i = 0; i < stations.length; i++) {
        if (stations[i].stationuuid === this.station.stationuuid) {
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
    if (this.streamUrl) {
      this.stationReady = false;
      this.errorText = null;
      this.selectNextStationSeconds = 0;
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.addEventListener('play', (e) => {
          this.triggerOnPlay(e);
          if (this.mobileApp) {
            setTimeout(() => {
              this.musicControls.updateIsPlaying(true);
            }, 60);
          }
        });
        this.audio.addEventListener('pause', (e) => {
          this.triggerOnPause(e);
          if (this.mobileApp) {
            setTimeout(() => {
              this.musicControls.updateIsPlaying(false);
            }, 60);
          }
        });
        this.audio.addEventListener('timeupdate', (e) => {
          // console.log('timeupdate', e);
          this.triggerOnTimeUpdate(e);
        });
        this.audio.addEventListener('canplay', (e) => {
          this.stationReady = true;
          this.setMusicControls();
          this.startAnalyzer();
        });
        this.audio.addEventListener('error', (e) => {
          this.audioError(e);
        });
      }
      this.audio.autoplay = true;
      this.audio.crossOrigin = 'anonymus';
      this.audio.src = this.streamUrl;
    }
    this.setMusicControls();
    this.playbackEvents();
    this.ready = true;

  }

  setMusicControls(subtitle = 'mucke.online') {
    if (this.mobileApp) {
      this.musicControls.create({
        track: this.station.name,
        artist: subtitle,
        cover: this.station.favicon || 'assets/images/og_image.jpg',
        isPlaying: !this.paused,
        dismissable: false,
        hasPrev: true,
        hasNext: true,
        hasClose: true,
        album: '',
        duration: 0,
        elapsed: 10,
        hasScrubbing: false,
        ticker: 'Now playing "' + this.station.name + '"',
        playIcon: 'media_play',
        pauseIcon: 'media_pause',
        prevIcon: 'media_prev',
        nextIcon: 'media_next',
        closeIcon: 'media_close',
        notificationIcon: 'notification'
      });
      this.musicControls.subscribe().subscribe(action => {
        const message = JSON.parse(action).message;
        switch (message) {
          case 'music-controls-next':
            this.selectNextStation();
            break;
          case 'music-controls-previous':
            this.selectPrevStation();
            break;
          case 'music-controls-pause':
            this.togglePause();
            break;
          case 'music-controls-play':
            this.togglePause();
            break;
          case 'music-controls-destroy':
            this.removeStream();
            break;
          // External controls (iOS only)
          case 'music-controls-toggle-play-pause' :
            this.togglePause();
            break;
          case 'music-controls-skip-forward':
            this.selectNextStation();
            break;
          case 'music-controls-skip-backward':
            this.selectPrevStation();
            break;
          // Headset events (Android only)
          // All media button events are listed below
          case 'music-controls-media-button' :
            this.selectNextStation();
            break;
          case 'music-controls-headset-unplugged':
            if (this.audio) {
              this.audio.pause();
            }
            break;
          case 'music-controls-headset-plugged':
            break;
          default:
            break;
        }
      });
      this.musicControls.listen();
      this.musicControls.updateIsPlaying(true);
    }
  }

  audioError(error) {
    this.errorText = 'Error';
    let errorCode = error.code || '';
    let message = this.station.name + '\n\n';
    message += this.streamUrl + '\n\n';
    if (this.audio) {
      message += (this.audio.error.message || '') + '\n\n';
      errorCode = this.audio.error.code;
      this.errorText += ' ' + this.audio.error.message;
    } else {
      message += (error.message || 'can´t load ' + this.streamUrl) + '\n\n';
    }

    this.showInfoOverlay(message, 'Error ' + errorCode, [
      {
        title: 'OK', event: () => {
          this.hideInfoOverlay();
        }
      },
      {
        title: 'Hide', event: () => {
          const station = this.station;
          this.selectNextStation();
          this.setInactiveStation(station);
          this.hideInfoOverlay();
        }
      },
      {
        title: 'Next', event: () => {
          this.hideInfoOverlay();
          this.selectNextStation();
        }
      }
    ]);
    if (this) {
      this.selectNextStationIn(5);
    }
  }

  startAnalyzer() {
    if (!this.analyzer && this.audio && this.visuals) {
      this.analyzer = new AudioAnalyzer(this.audio);
      if (this.canvasId) {
        const audioCanvas: HTMLElement = document.getElementById(this.canvasId);
        if (audioCanvas) {
          this.analyzer.setCanvas(audioCanvas as HTMLCanvasElement);
          this.analyzer.loop();
        }
      }
    }
  }

  onPlay(callback: any) {
    this.callbacks.onPlay.push(callback);
  }

  triggerOnPlay(event) {
    this.paused = false;
    this.setMusicControls();
    for (const callback of this.callbacks.onPlay) {
      callback(event);
    }
  }

  onPause(callback: any) {
    this.callbacks.onPause.push(callback);
  }

  triggerOnPause(event) {
    this.paused = true;
    this.setMusicControls();
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
    this.station = null;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.ready = false;
    this.paused = true;
  }

  playbackEvents() {
    if (this.audio) {
      this.audio.volume = this.lastVolume;
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

    if (this.audio && this.paused) {
      this.audio.play();
    } else if (this.audio && !this.paused) {
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
    if (this.localStorageSupport) {
      localStorage.removeItem('radio-station-name');
      localStorage.removeItem('radio-filter-prefix');
      localStorage.removeItem('radio-filter-type');
      localStorage.removeItem('radio-filter-by');
      localStorage.removeItem('radio-filter-value');
    }
  }

  showInfoOverlay(text = '', title = '', buttons = null) {
    this.overlayTitle = title;
    this.overlayText = text;
    this.overlayButtons = buttons;
    this.showOverlay = true;
  }

  hideInfoOverlay() {
    if (this.selectNextStationTimeout) {
      clearTimeout(this.selectNextStationTimeout);
      this.selectNextStationSeconds = 0;
    }
    this.overlayTitle = '';
    this.overlayText = '';
    this.overlayButtons = null;
    this.showOverlay = false;
  }

  toggleGridLayout() {
    if (this.listLayout === 'grid-layout') {
      this.setLayout('default-layout');
    } else {
      this.setLayout('grid-layout');
    }
  }

  getPlatform() {
    const platform = ['Win32', 'Android', 'iOS'];
    for (let i = 0; i < platform.length; i++) {
      if (navigator.platform.indexOf(platform[i]) > -1) {
        return platform[i];
      }
    }
    return navigator.platform;
  }

  localStorageIsSupported(getStorage) {
    try {
      const key = "__some_random_key_you_are_not_going_to_use__";
      getStorage().setItem(key, key);
      getStorage().removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  private handleError(error) {
    return throwError(error);
  }
}

export class AudioAnalyzer {
  audioCtx;
  analyser;
  audioSrc;
  frequency = {
    values: [],
    dataArray: null
  };
  frequencyData;
  canvas;
  canvasCtx;
  canvasSettings = {
    gradient: null,
    width: null,
    height: null,
    gap: 2, // gap between meters
    capHeight: 2,
    capStyle: '#fff',
    meterNum: 64, // count of the meters
    capYPositionArray: [], //// store the vertical position of hte caps for the preivous frame
  };
  callbacks = {
    update: null
  };

  constructor(public audio: HTMLAudioElement) {
    this.setAudio(audio);
  }

  setAudio(audio: HTMLAudioElement) {
    this.audio = audio;
    if (this.audioCtx) {
      this.audioCtx.close();
    }
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.audioSrc = this.audioCtx.createMediaElementSource(audio);
    this.audioSrc.connect(this.analyser);
    this.audioSrc.connect(this.audioCtx.destination);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  update() {
    this.frequencyDataUpdate();
    this.drawCanvas();
  }

  frequencyDataUpdate() {
    this.frequency.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(this.frequency.dataArray);
    const step = Math.round(this.frequency.dataArray.length / this.canvasSettings.meterNum);
    this.frequency.values = [];
    for (let i = 0; i < this.canvasSettings.meterNum; i++) {
      const value = this.frequency.dataArray[i * step];
      this.frequency.values.push(value);
    }
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d');
    this.canvasSettings.gradient = this.canvasCtx.createLinearGradient(0, 0, 0, 300);
    this.canvasSettings.gradient.addColorStop(1, '#25ffb5');
    this.canvasSettings.gradient.addColorStop(0.25, '#72e9ff');
    this.canvasSettings.gradient.addColorStop(0, '#1f18ff');
    this.setCanvasSize();
  }

  setCanvasSize() {
    if (this.canvas) {
      this.canvas.width = this.canvas.clientWidth;
      this.canvas.height = this.canvas.clientHeight;
      this.canvasSettings.width = this.canvas.width;
      this.canvasSettings.height = this.canvas.height;
    }
  }

  drawCanvas() {
    if (this.canvasCtx) {
      this.setCanvasSize();
      const array = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(array);
      const step = Math.round(array.length / this.canvasSettings.meterNum);
      this.canvasCtx.clearRect(0, 0, this.canvasSettings.width, this.canvasSettings.height);
      for (let i = 0; i < this.canvasSettings.meterNum; i++) {
        const value = array[i * step] / 1.5;
        const meterWidth = this.canvasSettings.width / this.canvasSettings.meterNum;
        if (this.canvasSettings.capYPositionArray.length < Math.round(this.canvasSettings.meterNum)) {
          this.canvasSettings.capYPositionArray.push(value);
        }
        this.canvasCtx.fillStyle = this.canvasSettings.capStyle;
        if (value < this.canvasSettings.capYPositionArray[i]) {
          this.canvasCtx.fillRect(
            i * (meterWidth),
            this.canvasSettings.height - (--this.canvasSettings.capYPositionArray[i]),
            meterWidth - this.canvasSettings.gap,
            this.canvasSettings.capHeight);
        } else {
          this.canvasCtx.fillRect(
            i * (meterWidth),
            this.canvasSettings.height - value,
            meterWidth - this.canvasSettings.gap,
            this.canvasSettings.capHeight);
          this.canvasSettings.capYPositionArray[i] = value;
        }
        this.canvasCtx.fillStyle = this.canvasSettings.gradient;
        this.canvasCtx.fillRect(i * meterWidth,
          this.canvasSettings.height - value + this.canvasSettings.capHeight,
          meterWidth - this.canvasSettings.gap,
          this.canvasSettings.height);
      }
    }
  }

  loop() {
    this.update();
    window.requestAnimationFrame(() => {
      this.loop();
    });
  }
}

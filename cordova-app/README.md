# Angular Cordova App
### prepare angular app (befor build):
   • add script tag to index.html: `<script type="text/javascript" src="cordova.js"></script>` <br>
   • change component template in app.component.ts: from `./app.component.html`  to `./app.component.mobile.html` <br>
   • edit config file (config/app.config.ts), set: `mobileApp = true;`  <br><br>
### fix fucked up angular build, in www directory (after build):
• add `type="text/javascript"` to script tags <br>
• search and replace `url(/assets` with `url(assets` in all files
<br>
<br>
## Android APK release 
#### edit version code:
edit number of `-- --versionCode=6` in package.json, script line: <br>`"build:release": "cordova build --prod --release  android -- --versionCode=6",`
<br>
<br>
## other helpful stuff:
##### for broken plugin `cordova-music-controls-plugin`:
use: `cordova plugin add https://github.com/amitkhare/cordova-music-controls-plugin --save`

### icon sources for android
```
    <icon src="res/icon/android-icon-36x36.png" density="ldpi"/>
    <icon src="res/icon/android-icon-48x48.png" density="mdpi"/>
    <icon src="res/icon/android-icon-72x72.png" density="hdpi"/>
    <icon src="res/icon/android-icon-96x96.png" density="xhdpi"/>
    <icon src="res/icon/android-icon-144x144.png" density="xxhdpi"/>
    <icon src="res/icon/android-icon-192x192.png" density="xxxhdpi"/>
```

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { RadioBrowserService } from './plugins/radio-browser/radio-browser.service';
import { RadioStationPreviewSmallComponent } from './plugins/radio-browser/radio-station-preview-small/radio-station-preview-small.component';
import { RadioStationPreviewComponent } from './plugins/radio-browser/radio-station-preview/radio-station-preview.component';
import { RadioBrowserComponent } from './plugins/radio-browser/radio-browser.component';
import { StartViewComponent } from './misc/start-view/start-view.component';
import { ImageComponent } from './ui/image/image.component';
import { AboutComponent } from './misc/about/about.component';
import { CopyrightComponent } from './misc/copyright/copyright.component';
import { MusicControls } from '@ionic-native/music-controls/ngx';


@NgModule({
  declarations: [
    AppComponent,
    CopyrightComponent,
    AboutComponent,
    ImageComponent,
    StartViewComponent,
    RadioBrowserComponent,
    RadioStationPreviewComponent,
    RadioStationPreviewSmallComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [HttpClient, RadioBrowserService, MusicControls],
  bootstrap: [AppComponent]
})
export class AppModule {
}

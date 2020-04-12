import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { RadioBrowserService } from './radio-browser/services/radio-browser.service';
import { RadioBrowserComponent } from './radio-browser/radio-browser.component';
import { RadioStationPreviewSmallComponent } from './radio-browser/radio-station-preview-small/radio-station-preview-small.component';
import { RadioStationPreviewComponent } from './radio-browser/radio-station-preview/radio-station-preview.component';
import { CopyrightComponent } from './copyright/copyright.component';



@NgModule({
  declarations: [
    AppComponent,
    RadioBrowserComponent,
    RadioStationPreviewComponent,
    RadioStationPreviewSmallComponent,
    CopyrightComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [HttpClient, RadioBrowserService],
  bootstrap: [AppComponent]
})
export class AppModule {
}

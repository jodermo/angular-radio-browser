import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { RadioBrowserComponent } from './radio-browser/radio-browser.component';
import { RadioBrowserService } from './radio-browser/services/radio-browser.service';
import { RadioPreviewComponent } from './radio-browser/radio-preview/radio-preview.component';
import { RadioPreviewSmallComponent } from './radio-browser/radio-preview-small/radio-preview-small.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CopyrightComponent } from './copyright/copyright.component';


@NgModule({
  declarations: [
    AppComponent,
    RadioBrowserComponent,
    RadioPreviewComponent,
    RadioPreviewSmallComponent,
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

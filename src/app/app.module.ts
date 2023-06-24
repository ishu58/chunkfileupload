import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FileUploadComponent } from './components/fileupload/fileupload.component';
import { HttpClientModule } from '@angular/common/http';
import { FileUploaderService } from './components/file-uploader.service';

@NgModule({
  declarations: [AppComponent, FileUploadComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [FileUploaderService],
  bootstrap: [AppComponent],
})
export class AppModule {}

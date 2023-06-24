import { Component, OnInit } from '@angular/core';
import { FileUploaderService } from '../file-uploader.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css'],
})
export class FileUploadComponent implements OnInit {
  private uploadFile!: File;

  constructor(private fileUploader: FileUploaderService) {}

  ngOnInit() {}

  fileChanged(event: Event) {
    debugger;
    const fileElement = event.target as HTMLInputElement;
    if (
      fileElement == null ||
      fileElement.files == null ||
      fileElement.files.length <= 0
    ) {
      return;
    }
    // the first file is set as upload target.
    this.uploadFile = fileElement.files[0];
  }

  public saveFile() {
    debugger;
    if (this.uploadFile == null) {
      return;
    }
    this.fileUploader.upload(this.uploadFile).subscribe(
      (result) => console.log(result), // onNext
      (error) => console.error(error), // onError
      () => console.log('finished')
    ); // onComplete
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';

// Interface for UploadFileResult
export interface UploadFileResult {
  result: UploadResult | undefined;
}

// Interface for UploadResult
export interface UploadResult {
  succeeded: boolean;
  errorMessage: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploaderService {
  constructor(private httpClient: HttpClient) {}

  private chunkSize = 1048576 * 3;
  private static getErrorResult(reason: any): UploadFileResult {
    return {
      result: {
        succeeded: false,
        errorMessage: reason,
      },
    };
  }

  public upload(file: File): Observable<boolean> {
    debugger;
    return new Observable<boolean>((observer) => {
      const reader = new FileReader();
      const fileName = file.name;
      reader.onload = (e: ProgressEvent) =>
        this.sendBufferData(reader.result, fileName, observer);
      reader.readAsArrayBuffer(file);
    });
  }

  private async sendBufferData(
    readResult: string | ArrayBuffer | null,
    fileName: string,
    observer: Observer<boolean>
  ) {
    debugger;
    if (readResult == null) {
      observer.error('failed reading file data');
      return;
    }
    // create directory for saving chunks by server side application.
    await this.sendChunks(new Uint8Array(readResult as ArrayBuffer))
      .then((result) =>
        this.sendChunks(new Uint8Array(readResult as ArrayBuffer))
      )
      .then((result) => this.endSendingData(fileName))
      .then((result) => {
        if (result.succeeded) {
          observer.next(true);
          observer.complete();
        } else {
          observer.error(result);
        }
      })
      .catch((reason) => observer.error(reason));
  }

  // private startSendingData(fileName: string): Promise<UploadFileResult> {
  //   debugger;
  //   return new Promise<UploadFileResult>((resolve, reject) => {
  //     const formData = new FormData();
  //     formData.append('fileName', fileName);
  //     this.httpClient
  //       .post<UploadFileResult>(
  //         'https://localhost:44356/files/start',
  //         formData,
  //         {}
  //       )
  //       .toPromise()
  //       .then((result) => {
  //         if (result?.result?.succeeded) {
  //           resolve(result);
  //         } else {
  //           reject(result);
  //         }
  //       })
  //       .catch((reason) => reject(FileUploaderService.getErrorResult(reason)));
  //   });
  // }

  private sendChunks(buffer: Uint8Array): Promise<UploadFileResult> {
    return new Promise<UploadFileResult>((resolve, reject) => {
      debugger;
      let fileIndex = 0;
      const sendChunkPromises = [];
      for (let i = 0; i < buffer.length; i += this.chunkSize) {
        let indexTo = i + this.chunkSize;
        if (indexTo >= buffer.length) {
          indexTo = buffer.length - 1; // for last data.
        }
        const formData = new FormData();
        formData.append('file', new Blob([buffer.subarray(i, indexTo)]));
        //formData.append('tmpDirectory', tmpDirectoryName);
        formData.append('index', fileIndex.toString());

        const headers = new HttpHeaders();
        // headers.append('tmpDirectory', tmpDirectoryName);
        // headers.append('index', fileIndex.toString());
        const sendChunkPromise = this.httpClient
          .post<void>('https://localhost:44356/files/chunk', formData, {
            headers,
          })
          .toPromise();
        sendChunkPromises.push(sendChunkPromise);
        fileIndex += 1;
      }
      Promise.all(sendChunkPromises)
        .then(() => {
          resolve({
            result: {
              succeeded: true,
              errorMessage: '',
            },
          });
        })
        .catch((reason) => {
          reject(FileUploaderService.getErrorResult(reason));
        });
    });
  }

  private endSendingData(fileName: string): Promise<UploadResult> {
    return new Promise<UploadResult>((resolve, reject) => {
      const formData = new FormData();
      formData.append('fileName', fileName);
      this.httpClient
        .post<UploadResult>('https://localhost:44356/files/end', formData, {})
        .toPromise()
        .then((result) => {
          if (result?.succeeded) {
            resolve(result);
          } else {
            reject(result);
          }
        })
        .catch((reason) =>
          reject(FileUploaderService.getErrorResult(reason).result)
        );
    });
  }
}

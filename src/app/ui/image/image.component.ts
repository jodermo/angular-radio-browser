import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements AfterViewInit {
  @ViewChild('image') imageRef: ElementRef;
  @Input() src: string;
  @Input() alt: string = '';
  @Input() fallback = 'assets/images/fallback.png';
  @Input() width: number = 0;
  @Input() height: number = 0;
  image: HTMLImageElement;
  ratio;
  resized = false;

  constructor() {

  }

  ngAfterViewInit(): void {
    this.image = this.imageRef.nativeElement;
    this.image.onload = () => {
      this.size();
    };
  }

  fallbackSrc() {
    return this.fallback;
  }

  size() {

    if (this.image && this.image.width && !this.resized) {
      let width = this.image.width;
      if (this.width === 0) {
        if (this.height) {
          width = this.image.width * (this.height / this.image.height);
        }
      } else {
        width = this.width;
      }
      let height = this.image.height;
      if (this.height === 0) {
        if (this.width) {
          height = this.image.height * (this.width / this.image.width);
        }
      } else {
        height = this.height;
      }
      this.width = width;
      this.height = height;
      this.image.width = width;
      this.image.height = height;
      this.resized = true;
    }
    if (this.image && this.resized) {
      return {
        width: this.image.width,
        height: this.image.height
      }
    }
    return {
      width: 0,
      height: 0
    }
  }

}

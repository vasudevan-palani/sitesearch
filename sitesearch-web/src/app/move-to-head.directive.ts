import { Directive,OnDestroy,OnInit,Renderer2,ElementRef,Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';


@Directive({
  selector: '[moveToHead]'
})
export class MoveToHeadDirective implements OnDestroy, OnInit {

  constructor(private renderer: Renderer2, private elRef: ElementRef, @Inject(DOCUMENT) private document: Document) {
  }
  ngOnInit(): void {
    this.renderer.appendChild(this.document.head, this.elRef.nativeElement);
    this.renderer.removeAttribute(this.elRef.nativeElement, 'movetohead');
  }

  ngOnDestroy(): void {
    this.renderer.removeChild(this.document.head, this.elRef.nativeElement);
  }

}

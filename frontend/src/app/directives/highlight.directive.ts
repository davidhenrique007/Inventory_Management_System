import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnChanges {
  @Input() appHighlight: string = '';
  @Input() highlightColor: string = '#ffeb3b';
  @Input() caseSensitive: boolean = false;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.highlight();
  }

  private highlight(): void {
    const text = this.el.nativeElement.innerText;
    if (!this.appHighlight || !text) {
      this.reset();
      return;
    }

    const searchTerm = this.caseSensitive ? this.appHighlight : this.appHighlight.toLowerCase();
    const textToSearch = this.caseSensitive ? text : text.toLowerCase();

    if (!textToSearch.includes(searchTerm)) {
      this.reset();
      return;
    }

    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, this.caseSensitive ? 'g' : 'gi');
    const highlightedText = text.replace(regex, `<span style="background-color: ${this.highlightColor};">$1</span>`);

    this.el.nativeElement.innerHTML = highlightedText;
  }

  private reset(): void {
    this.el.nativeElement.innerHTML = this.el.nativeElement.innerText;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

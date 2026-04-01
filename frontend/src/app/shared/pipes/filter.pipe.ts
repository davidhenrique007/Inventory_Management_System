import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform<T extends Record<string, any>>(
    items: T[] | null,
    searchTerm: string,
    searchFields: (keyof T)[]
  ): T[] {
    if (!items || !searchTerm || searchTerm.trim() === '') {
      return items || [];
    }

    const term = searchTerm.toLowerCase().trim();

    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(term);
      });
    });
  }
}

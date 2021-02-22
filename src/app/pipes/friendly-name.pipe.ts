import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'friendlyName'
})
export class FriendlyNamePipe implements PipeTransform {

  transform(value: string): string {
    
    const friendlyName = value === 'black-piece' ? 'Black' : 'White'; 

    return friendlyName;
  }

}

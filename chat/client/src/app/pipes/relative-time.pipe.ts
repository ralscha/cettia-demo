import {Pipe, PipeTransform} from '@angular/core';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

@Pipe({
  name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars
  transform(value: any, args?: any): any {
    return formatDistanceToNow(new Date(value), {addSuffix: true});
  }

}

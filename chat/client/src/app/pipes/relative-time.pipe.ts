import {Pipe, PipeTransform} from '@angular/core';
// @ts-ignore
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

@Pipe({
  name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: string, ...args) {
    return distanceInWordsToNow(new Date(value), {addSuffix: true});
  }

}

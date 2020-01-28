import {fromEvent, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';

const debounce = (elem: any, fn: (string) => void): Subscription => (
    fromEvent(elem, 'keyup').pipe(
        map((event: any) => event.target.value),
        filter(res => res.length > 2),
        debounceTime(1000),
        distinctUntilChanged()
    ).subscribe(fn)
);

export default debounce;

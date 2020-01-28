import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MBReply} from '../models/mapbox/MBReply';
import {MBFeature} from '../models/mapbox';

@Injectable({
    providedIn: 'root'
  })
export class MapBoxService {
    private token = 'pk.eyJ1IjoiaG9wZmx5IiwiYSI6ImNrNWI3NHIwMzBteHMzbHYwczhhZmZtcHkifQ.0BzC1e8JEED4fwJGpZHFYQ';
    private api_url = 'https://api.mapbox.com';

    /**
     * Reverse Geocoding
     * @param longitude
     * @param latitude
     */
    reverseGeocoding(longitude, latitude) {
        const url = `${this.api_url}/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${this.token}`;
        return this.http.get<MBReply<MBFeature>>(url);
    }

    /**
     * Geocoding
     * @param searchText
     */
    geocoding(searchText) {
        const url = `${this.api_url}/geocoding/v5/mapbox.places/${searchText}.json?access_token=${this.token}`;
        return this.http.get<MBReply<MBFeature>>(url);
    }

    /**
     * Constructor
     * @param http
     */
    constructor(private http: HttpClient) {
    }
}

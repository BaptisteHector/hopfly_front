import { Component, OnInit, Input } from '@angular/core';
import { Contact } from '../models';

@Component({
  selector: 'app-contact-overview',
  templateUrl: './contact-overview.component.html',
  styleUrls: ['./contact-overview.component.css']
})
export class ContactOverviewComponent implements OnInit {

  @Input() contact: Contact;
  constructor() { }

  ngOnInit(): void {
  }

}

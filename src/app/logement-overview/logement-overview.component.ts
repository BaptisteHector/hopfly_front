import { Component, OnInit, Input } from '@angular/core';
import { Logement } from '../models';

@Component({
  selector: 'app-logement-overview',
  templateUrl: './logement-overview.component.html',
  styleUrls: ['./logement-overview.component.css']
})
export class LogementOverviewComponent implements OnInit {

  @Input() logement: Logement
  constructor() { }

  ngOnInit(): void {
  }

}

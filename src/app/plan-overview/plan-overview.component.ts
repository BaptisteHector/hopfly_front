import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Plan, Trip } from '../models';

@Component({
  selector: 'app-plan-overview',
  templateUrl: './plan-overview.component.html',
  styleUrls: ['./plan-overview.component.css']
})
export class PlanOverviewComponent implements OnInit {

  @Input() plan: Plan
  @Output() choosePlan = new EventEmitter<Plan>();
  amount_activity: number = 0
  constructor() { }

  ngOnInit(): void {
    if (this.plan.activities === null)
      return
    this.amount_activity = this.plan.activities.split(',').length - 1
  }

  onClickPlan() {
    console.log(this.plan)
    this.choosePlan.emit(this.plan)
  }

}

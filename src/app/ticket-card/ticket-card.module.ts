import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import { TicketCardComponent } from './ticket-card.component';



@NgModule({
  declarations: [
    TicketCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    TicketCardComponent
  ]
})
export class TicketCardModule { }

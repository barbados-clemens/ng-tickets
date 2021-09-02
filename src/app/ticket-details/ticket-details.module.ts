import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";

import {TicketDetailsRoutingModule} from './ticket-details-routing.module';
import {TicketDetailsComponent} from './ticket-details.component';


@NgModule({
    declarations: [
        TicketDetailsComponent
    ],
    imports: [
        CommonModule,
        TicketDetailsRoutingModule,
        ReactiveFormsModule
    ],
    exports: [
        TicketDetailsComponent
    ]

})
export class TicketDetailsModule {
}

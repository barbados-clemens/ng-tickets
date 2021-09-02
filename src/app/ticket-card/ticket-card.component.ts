import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Interpreter} from "xstate";
import {TicketContext, TicketEvent} from "../machines/ticket.machine";

@Component({
    selector: 'app-ticket-card',
    template: `
        <header>

            <input type="checkbox" (click)="ticket.send(ticket.state.value === 'open' ? 'COMPLETE' : 'REOPEN')"
                   [checked]="ticket.state.value === 'completed'">
            <p [attr.data-state]="ticket.state.value">{{ticket.state.context.description}}</p>
        </header>

        <ng-content></ng-content>
    `,
    styleUrls: ['./ticket-card.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCardComponent {

    @Input() ticket: Interpreter<TicketContext, any, TicketEvent>

    constructor() {
    }

}

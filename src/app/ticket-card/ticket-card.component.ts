import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Interpreter} from "xstate";
import {TicketContext, TicketEvent} from "../machines/ticket.machine";

@Component({
    selector: 'app-ticket-card',
    template: `
        <header>

            <input type="checkbox"
                   (click)="ticketMachine.send(ticketMachine.state.value === 'open' ? 'COMPLETE' : 'REOPEN')"
                   [checked]="ticketMachine.state.value === 'completed'">
            <p [attr.data-state]="ticketMachine.state.value">{{ticketMachine.state.context.description}}</p>
        </header>

        <ng-content></ng-content>
    `,
    styleUrls: ['./ticket-card.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketCardComponent {

    @Input() ticketMachine: Interpreter<TicketContext, any, TicketEvent>

    constructor() {
    }

}

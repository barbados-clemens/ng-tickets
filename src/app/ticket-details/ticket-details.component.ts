import {Component} from '@angular/core';
import {FormControl} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {combineLatest, filter, map, withLatestFrom} from "rxjs";
import {tap} from "rxjs/operators";
import {MachineService} from "../machines/machine.service";

@Component({
    selector: 'app-ticket-details',
    template: `
        <a routerLink="/">View All Tickets</a>
        <ng-container *ngIf="ticketMachine$ | async as ticket; else loading;">
            <section class="ticket" [attr.data-state]="ticket.value" [ngSwitch]="true">

                <h1>Ticket # {{ticket.state.context.id}}</h1>
                <p>{{ticket.state.context.description}}</p>

                <div class="ticket__actions" *ngSwitchCase="ticket.state.matches('open')">
                    <button (click)="ticket.send('COMPLETE')">
                        Complete
                    </button>
                    <select name="assignTo"
                            id="assignTo"
                            [formControl]="userSelectControl"
                    >
                        <option [value]="u.id" *ngFor="let u of users$ | async">{{u.name}}</option>
                    </select>
                </div>

                <div class="ticket__actions" *ngSwitchCase="ticket.state.matches('completed')">
                    <button (click)="ticket.send('REOPEN')">
                        Open
                    </button>
                </div>

                <div *ngSwitchCase="ticket.state.matches('updating') || ticket.state.matches('completing')">
                    Updating...
                </div>
            </section>
        </ng-container>


        <ng-template #loading>
            <p>Loading...</p>
        </ng-template>
    `,
    styles: []
})
export class TicketDetailsComponent {
    userSelectControl = new FormControl();

    ticketMachine$ = combineLatest([
        this.route.paramMap.pipe(map(p => Number(p.get('id')))),
        this.machineSrv.state$,
    ])
        .pipe(
            filter(([_, machine]) => machine?.matches('loaded')),
            map(([id, ticketsMachine]) => ticketsMachine.context.tickets.find(m => m.state.context.id === id)),
            tap(ticket => {
                this.userSelectControl.patchValue(
                    ticket.state.context.assigneeId
                )
            })
        )

    users$ = this.machineSrv.state$.pipe(
        filter((machine) => machine?.matches('loaded')),
        map(s => s.context.users),
    )


    constructor(
        private readonly machineSrv: MachineService,
        private readonly route: ActivatedRoute
    ) {
        this.userSelectControl.valueChanges.pipe(
            withLatestFrom(this.ticketMachine$),

        tap(console.log),

        )
            .subscribe(([assigneeId, ticketMachine]) => {
                ticketMachine.send({type: 'ASSIGN_TO_USER', assigneeId})
            })
    }

}

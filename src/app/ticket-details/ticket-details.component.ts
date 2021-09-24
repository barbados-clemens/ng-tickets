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
        <ng-container *ngIf="{vm: ticketMachine$ | async} as ticket; else loading;">

            <h1 *ngIf="!ticket.vm">Ticket Not Found</h1>

            <section *ngIf="ticket.vm" class="ticket" [attr.data-state]="ticket.vm?.value" [ngSwitch]="true">

                <h1>Ticket # {{ticket.vm.state.context.id}}</h1>
                <p>{{ticket.vm.state.context.description}}</p>
                <pre>{{ticket.vm.state | json}}</pre>

                <div class="ticket__actions" *ngSwitchCase="ticket.vm.state.matches('open')">
                    <button (click)="ticket.vm.send('COMPLETE')">
                        Complete
                    </button>
                    <select name="assignTo"
                            id="assignTo"
                            [formControl]="userSelectControl"
                    >
                        <option [value]="u.id" *ngFor="let u of users$ | async">{{u.name}}</option>
                    </select>
                </div>

                <div class="ticket__actions" *ngSwitchCase="ticket.vm.state.matches('completed')">
                    <button (click)="ticket.vm.send('REOPEN')">
                        Open
                    </button>
                </div>

                <div *ngSwitchCase="ticket.vm.state.matches('updating') || ticket.vm.state.matches('completing')">
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
            tap(ticketMachine => {
                if (ticketMachine) {
                    this.userSelectControl.patchValue(
                        ticketMachine.state.context.assigneeId
                    )
                }
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
        )
            .subscribe(([assigneeId, ticketMachine]) => {
                ticketMachine.send({type: 'ASSIGN_TO_USER', assigneeId})
            })
    }

}

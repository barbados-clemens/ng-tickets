import {ChangeDetectionStrategy, Component} from "@angular/core";
import {FormControl, Validators} from "@angular/forms";
import {MachineService} from "../machines/machine.service";

@Component({
    selector: 'app-tickets-list',
    template: `
        <section class="ticket-list">
            <h1>Tickets</h1>
            <ng-container *ngIf="state$ | async as state;">

                <label>
                    Search:
                    <input type="search" [ngModel]="state.context.filterText" (ngModelChange)="filterChange($event)">
                </label>

                <ng-container [ngSwitch]="true">
                    <ng-container *ngSwitchCase="state.matches('loaded') || state.matches('creating')">
                        <ng-container *ngFor="let t of state.context.tickets;">
                            <app-ticket-card [ticketMachine]="t">
                                <a [routerLink]="['ticket', t.state.context.id]">View Details</a>
                            </app-ticket-card>
                        </ng-container>
                    </ng-container>

                    <p *ngSwitchCase="state.matches('loading')">Loading...</p>
                </ng-container>
            </ng-container>
        </section>

        <section class="add-ticket">
            <h2>Add Ticket</h2>
            <label for="newTicket">
                <input type="text" [formControl]="newTicketControl">
            </label>
            <button (click)="addTicket(newTicketControl.value)">Add</button>
        </section>
    `,
    styleUrls: ['./tickets-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketsListComponent {

    state$ = this.machineService.state$
    newTicketControl = new FormControl('', [Validators.required])

    constructor(private readonly machineService: MachineService,
    ) {
    }

    addTicket(description: string): void {
        this.machineService.send({type: 'CREATE_TICKET', description})
        this.newTicketControl.reset();
    }

    filterChange(filterText: string) {
        this.machineService.send({type: 'FILTER', filterText})
    }
}

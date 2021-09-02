import {Injectable} from "@angular/core";
import {from, Observable, ObservedValueOf} from "rxjs";
import {interpret, Interpreter} from "xstate";
import {BackendService} from "../backend.service";
import {createTicketsMachine, TicketsContext, TicketsEvent} from "./tickets.machine";

// TS Error around NodeJS.Global :(
// inspect({
//     url: 'https://stately.ai/viz?inspect',
//     iframe: false,
// })

@Injectable({
    providedIn: 'root',
})
export class MachineService {
    readonly state$: Observable<ObservedValueOf<Interpreter<TicketsContext, any, TicketsEvent>>>
    private readonly machineService: Interpreter<TicketsContext, any, TicketsEvent>

    constructor(readonly backendService: BackendService) {
        const machine = createTicketsMachine({services: backendService})

        this.machineService = interpret(machine, {devTools: true}).start();
        this.state$ = from(this.machineService)

    }

    get machineSnapshot() {
        return this.machineService
    }

    send(event: TicketsEvent) {
        this.machineService.send(event)
    }

}

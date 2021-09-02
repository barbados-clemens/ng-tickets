import {Component} from '@angular/core';
import {map} from "rxjs";
import {MachineService} from "./machines/machine.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    state$ = this.machineSrv.state$.pipe(map(s => s.context))

    constructor(private readonly machineSrv: MachineService) {
    }
}

import {RouterTestingModule} from "@angular/router/testing";
import {createComponentFactory, Spectator} from "@ngneat/spectator";
import {createModel} from "@xstate/test";
import {createMachine} from "xstate";
import {BackendService} from "../backend.service";
import {TicketDetailsComponent} from "./ticket-details.component";

describe(TicketDetailsComponent.name, () => {
    const testTicketMachine = createMachine({
        id: 'test-ticket-machine',
        initial: 'loading',
        states: {
            loading: {
                meta: {
                    test: (el: Spectator<TicketDetailsComponent>) => {
                        console.log(el)

                        expect(el.query('h1')).toHaveText('Ticket Not Found')
                    }
                },
            },
        }
    })

    const testModel = createModel(testTicketMachine).withEvents({
        LOAD: {},
    })

    const testPlans = testModel.getShortestPathPlans();

    testPlans.forEach(plan => {
        describe(plan.description, () => {
            let spectator: Spectator<TicketDetailsComponent>;
            let createComponent = createComponentFactory({
                component: TicketDetailsComponent,
                imports: [RouterTestingModule],
                providers: [BackendService]
            });

            beforeEach(() => {
                spectator = createComponent()
            })

            plan.paths.forEach(path => {
                it(path.description, async () => {
                    await path.test(spectator)
                })
            })
        })
    })

});

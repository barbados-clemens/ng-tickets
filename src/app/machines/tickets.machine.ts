import {combineLatest, firstValueFrom, lastValueFrom} from "rxjs";
import {assign, ContextFrom, EventFrom, spawn} from "xstate";
import {createModel} from "xstate/lib/model";
import {BackendService} from "../backend.service";
import {createTicketMachine} from "./ticket.machine";

const ticketsModel = createModel({
    tickets: [],
    users: [],
    error: undefined,
}, {
    events: {
        LOAD: () => ({}),
        RESET: () => ({}),
        CREATE_TICKET: (description: string) => ({description})
    }
})

export type TicketsContext = ContextFrom<typeof ticketsModel>;
export type TicketsEvent = EventFrom<typeof ticketsModel>;

export function createTicketsMachine(machineConfig: { services: BackendService }) {
    return ticketsModel.createMachine({
        id: 'tickets',
        initial: 'loading',
        context: ticketsModel.initialContext,
        states: {
            loading: {
                tags: 'loading',
                meta: {
                    description: 'load tickets and users. assign that into context',
                },
                invoke: {
                    id: 'load-data',
                    src: 'invokeLoadTicketsData',
                    onDone: {
                        target: 'loaded',
                        actions: assign((ctx, {data}) => {
                            const [users, tickets] = data;
                            return {
                                users,
                                tickets: tickets.map((t) => spawn(createTicketMachine(t, machineConfig)))
                            }

                        })
                    },
                    onError: {
                        target: 'error',
                        actions: assign({
                            error: (ctx, event) => event.data
                        })
                    }
                }
            },
            loaded: {
                tags: 'ready',
                meta: {
                    description: 'tickets and users are loaded and ready to go'
                },
                on: {
                    CREATE_TICKET: {
                        target: 'creating',
                    }
                }
            },
            creating: {
                invoke: {
                    id: 'create-new-ticket',
                    src: 'invokeNewTicket',
                    onDone: {
                        target: 'loaded',
                        actions: assign({
                            tickets: (ctx, event) => {
                                return [...ctx.tickets,  spawn(createTicketMachine(event.data, machineConfig))]
                            }
                        })
                    },
                    onError: {
                        target: 'error',
                        actions: assign({
                            error: (ctx, event) => event.data
                        })
                    }
                }
            },
            error: {}
        }
    })
        .withConfig({
            services: {
                invokeLoadTicketsData: (ctx, event) => {
                    return lastValueFrom(combineLatest(([
                        machineConfig.services.users(),
                        machineConfig.services.tickets()
                    ])))
                },
                invokeNewTicket: (ctx, event) => {
                    if (event.type === 'CREATE_TICKET') {
                        return firstValueFrom(machineConfig.services.newTicket({description: event.description}))
                    }
                    return Promise.reject(`Invalid event type. Expected "CREATE_TICKET", got "${event.type}"`)
                }
            }
        })

}

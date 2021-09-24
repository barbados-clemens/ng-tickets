import {combineLatest, firstValueFrom, lastValueFrom} from "rxjs";
import {assign, ContextFrom, EventFrom, send, spawn} from "xstate";
import {createModel} from "xstate/lib/model";
import {BackendService} from "../backend.service";
import {createTicketMachine} from "./ticket.machine";

const ticketsModel = createModel({
    allTickets: [],
    tickets: [],
    users: [],
    error: undefined,
    filterText: '',
}, {
    events: {
        LOAD: () => ({}),
        RESET: () => ({}),
        CREATE_TICKET: (description: string) => ({description}),
        FILTER: (filterText: string) => ({filterText})
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
                            const allMachines = tickets.map((t) => spawn(createTicketMachine(t, machineConfig)));
                            return {
                                users,
                                tickets: allMachines,
                                allTickets: allMachines,
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
                    },
                    FILTER: {
                        target: 'loaded',
                        actions: assign((ctx, event) => {
                            const filteredTickets = ctx.allTickets.filter(m => m.state.context.description.includes(event.filterText))

                            return {
                                ...ctx,
                                filterText: event.filterText,
                                tickets: filteredTickets,
                            }
                        })
                    }
                }
            },
            creating: {
                invoke: {
                    id: 'create-new-ticket',
                    src: 'invokeNewTicket',
                    onDone: {
                        target: 'loaded',
                        actions: [
                            assign({
                                allTickets: (ctx, event) => {
                                    return [...ctx.allTickets, spawn(createTicketMachine(event.data, machineConfig))]
                                }
                            }),
                            send((ctx) => ({type: 'FILTER', filterText: ctx.filterText}))
                        ],

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

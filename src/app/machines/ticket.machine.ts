import {firstValueFrom} from "rxjs";
import {assign, ContextFrom, EventFrom} from 'xstate';
import {createModel} from "xstate/lib/model";
import {BackendService, Ticket} from "../backend.service";

const ticketModel = createModel(
    {
        id: 0,
        description: "",
        assigneeId: undefined,
        error: undefined,
    },
    {
        events: {
            COMPLETE: () => ({}),
            REOPEN: () => ({}),
            ASSIGN_TO_USER: (assigneeId: number) => ({assigneeId}),
            UPDATE: (ticket: Partial<Omit<Ticket, "id">>) => ({ticket}),
            RETRY: () => ({}),
        },
    }
);


export type TicketEvent = EventFrom<typeof ticketModel>
export type TicketContext = ContextFrom<typeof ticketModel>

// export interface TicketMachineServices {
//     invokeUpdateTicket(ticketId: number, updates: Partial<Omit<Ticket, "id">>): Promise<Ticket>
// }


export function createTicketMachine(ticket: Ticket, machineConfig: { services: BackendService }) {
    console.log('creating new machine', ticket);
    return ticketModel.createMachine({
        id: `ticket-${ticket.id}`,
        context: {...ticketModel.initialContext, ...ticket},
        initial: "open",
        states: {
            open: {
                on: {
                    UPDATE: 'updating',
                    COMPLETE: "completing",
                    ASSIGN_TO_USER: 'updating',
                },
            },
            updating: {
                invoke: {
                    id: 'update-ticket-details',
                    src: 'invokeUpdateTicket',
                    onDone: 'open',
                    onError: {
                        target: 'error',
                        actions: assign({
                            error: (ctx, event) => event.data
                        })
                    }
                }
            },
            // assigning: {
            //     invoke: {
            //         id: 'assign-ticket-details',
            //         src: 'invokeAssignToUser',
            //         onDone: 'open',
            //         onError: {
            //             target: 'error',
            //             actions: assign({
            //                 error: (ctx, event) => event.data
            //             })
            //         }
            //     },
            // },
            completing: {
                invoke: {
                    id: 'complete-ticket-details',
                    src: 'invokeUpdateTicket',
                    onDone: 'completed',
                    onError: {
                        target: 'error',
                        actions: assign({
                            error: (ctx, event) => event.data
                        })
                    }
                }
            },
            // opening: {
            //     invoke: {
            //         id: 'reopen-ticket-details',
            //         src: 'invokeReOpenTicket',
            //         onDone: 'open',
            //         onError: {
            //             target: 'error',
            //             actions: assign({
            //                 error: (ctx, event) => event.data
            //             })
            //         }
            //     }
            // },
            completed: {
                on: {
                    REOPEN: 'updating'
                },
            },

            error: {
                on: {
                    RETRY: 'open'
                }
            }
        },
    })
        .withConfig({
            services: {
                invokeUpdateTicket: (ctx, event) => {
                    switch (event.type) {
                        case "COMPLETE":
                            return firstValueFrom(machineConfig.services.complete(ctx.id, false));
                        case "ASSIGN_TO_USER":
                            return firstValueFrom(machineConfig.services.assign(ctx.id, ctx.assigneeId))
                        case "REOPEN":
                            return firstValueFrom(machineConfig.services.complete(ctx.id, false));
                        case "UPDATE":
                            return firstValueFrom(machineConfig.services.update(ctx.id, event.ticket))

                    }
                }
            }
        })

}

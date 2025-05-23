import { getCookie } from '@utils/cookie';
import { errorBadRequest, errorForbidden, errorInternal, errorNotFound } from '@utils/error-msg';
import { GoodDate } from '@utils/datetime';
import { Activity } from '@models/activity';

export enum TicketType {
    TicketDaily = 0,
    TicketPersonality,
}

export class Ticket {
    id: string;
    activityId: string;
    detailId: string;
    student: string;
    type: TicketType;
    points: number;
    date: GoodDate;
    updatedAt: GoodDate;

    activity?: Activity;

    constructor(
        id: string,
        activityId: string,
        detailId: string,
        student: string,
        type: number,
        points: number,
        date: string,
        updatedAt: string,
        activity?: Activity
    ) {
        this.id = id;
        this.activityId = activityId;
        this.detailId = detailId;
        this.student = student;
        this.type = type;
        this.points = points;
        this.date = GoodDate.fromString(date);
        this.updatedAt = GoodDate.fromString(updatedAt);
        this.activity = activity;
    }

    clone(): Ticket {
        return new Ticket(
            this.id,
            this.activityId,
            this.detailId,
            this.student,
            this.type,
            this.points,
            this.date.toString(),
            this.updatedAt.toString(),
            this.activity
        );
    }

    static fromJSON(json: any): Ticket {
        return new Ticket(
            json.id,
            json.activityId,
            json.detailId,
            json.student,
            json.type,
            json.points,
            json.date,
            json.updatedAt,
            json.activity ? Activity.fromJSON(json.activity) : undefined
        );
    }

    static fromJSONList(json: any): Ticket[] {
        return json.map((item: any) => Ticket.fromJSON(item));
    }

    static template(): Ticket {
        return new Ticket('', '', '', '', 0, 0, '2025-01-01', '2025-01-01');
    }

    static queryStudentTicket = async (
        formData: {
            startDate: GoodDate;
            endDate: GoodDate;
            type: TicketType;
        },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(
                `${props.serverEndpoint}/user/student/ticket?startDate=${formData.startDate.toISODate()}&endDate=${formData.endDate.toISODate()}&type=${formData.type}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: getCookie('token') || '',
                    },
                }
            ),
            json = await response.json();

        if (response.ok) {
            return Ticket.fromJSONList(json.data);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else {
            throw new Error(json.message);
        }
    };

    static list = async (activityId: string, detailId: string | null, props: { serverEndpoint?: string }) => {
        const url = detailId
            ? `${props.serverEndpoint}/activity/${activityId}/detail/${detailId}/ticket`
            : `${props.serverEndpoint}/activity/${activityId}/ticket`;
        const response = await fetch(url, {
            headers: {
                Authorization: getCookie('token') || '',
            },
        });
        const json = await response.json();
        if (response.ok) {
            return Ticket.fromJSONList(json.data);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 404) {
            throw new Error(errorNotFound);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.message);
        }
    };

    static create = async (
        activityId: string,
        detailId: string,
        data: Array<{
            detailId: string;
            student: string;
            type: number;
            points: number;
        }>,
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(`${props.serverEndpoint}/activity/${activityId}/detail/${detailId}/ticket/new`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: getCookie('token') || '',
                },
                body: JSON.stringify(data),
            }),
            json = await response.json();

        if (response.ok) {
            return Ticket.fromJSON(json.data);
        } else {
            throw new Error(json.message);
        }
    };

    static delete = async (activityId: string, ticketId: string, props: { serverEndpoint?: string }) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/ticket/' + ticketId, {
            method: 'DELETE',
            headers: {
                Authorization: getCookie('token') || '',
            },
        });

        const json = await response.json();

        if (response.ok) {
            return;
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.message);
        }
    };

    static update = async (
        activityId: string,
        ticketId: string,
        data: {
            detailId?: string;
            student?: string;
            type?: number;
            points?: number;
        },
        props: { serverEndpoint?: string }
    ) => {
        const response = await fetch(props.serverEndpoint + '/activity/' + activityId + '/ticket/' + ticketId, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getCookie('token') || '',
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();

        if (response.ok) {
            return Ticket.fromJSON(json.data);
        } else if (response.status === 400) {
            throw new Error(errorBadRequest);
        } else if (response.status === 403) {
            throw new Error(errorForbidden);
        } else if (response.status === 500) {
            throw new Error(errorInternal);
        } else {
            throw new Error(json.message);
        }
    };
}
